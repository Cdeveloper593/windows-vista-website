/**
 * Slice vista256.jpg (the Vista icon sprite sheet) into individual icons.
 *
 * - Cell grid detected from near-white gap runs (see scripts/grid*.ps1 output)
 * - Background is removed with a border flood-fill of near-white pixels
 *   (keeps icon-interior whites), then a 1px feather for anti-aliasing
 * - Output: src/assets/icons/tile_RrCc.png (alpha PNG, cell-sized)
 * - Also emits scripts/contact-sheet.png with coordinates for picking
 */
import fs from 'node:fs'
import path from 'node:path'
import jpeg from 'jpeg-js'
import { PNG } from 'pngjs'

const SRC = process.argv[2] ?? 'vista256.jpg'
const OUT_DIR = path.resolve('src/assets/icons')
const TMP_DIR = path.resolve('scripts/.tmp-tiles')
fs.mkdirSync(OUT_DIR, { recursive: true })
fs.mkdirSync(TMP_DIR, { recursive: true })

// Cell boxes detected from the gap analysis (start-end inclusive)
const COLS = [
  [16, 111],
  [122, 217],
  [228, 322],
  [330, 433],
  [440, 534],
  [546, 640],
  [652, 747],
  [758, 853],
  [861, 959],
  [967, 1064],
  [1076, 1171],
  [1182, 1276],
  [1288, 1383],
  [1409, 1504],
  [1515, 1610],
  [1621, 1716],
  [1727, 1822],
  [1833, 1928],
  [1939, 2034],
  [2045, 2139],
  [2151, 2246],
  [2257, 2349],
  [2363, 2457],
  [2469, 2564],
  [2575, 2670],
  [2680, 2776],
]
const ROWS = [
  [0, 97],
  [104, 204],
  [209, 307],
  [314, 412],
  [419, 517],
  [524, 621],
  [630, 727],
  [734, 832],
  [839, 937],
  [944, 1041],
  [1049, 1147],
  [1157, 1252],
  [1259, 1357],
  [1365, 1459],
]

const isNearWhite = (r, g, b) => r >= 238 && g >= 238 && b >= 238

const raw = jpeg.decode(fs.readFileSync(SRC), { useTArray: true })
const { width: W, height: H, data } = raw
console.log(`decoded ${W}x${H}`)

function px(x, y) {
  const i = (y * W + x) * 4
  return [data[i], data[i + 1], data[i + 2]]
}

const manifest = []

for (let ry = 0; ry < ROWS.length; ry++) {
  for (let cx = 0; cx < COLS.length; cx++) {
    const [x0, x1] = COLS[cx]
    const [y0, y1] = ROWS[ry]
    const cw = x1 - x0 + 1
    const ch = y1 - y0 + 1

    // copy cell pixels
    const cell = Buffer.alloc(cw * ch * 4)
    let nonWhite = 0
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const [r, g, b] = px(x0 + x, y0 + y)
        const oi = (y * cw + x) * 4
        cell[oi] = r
        cell[oi + 1] = g
        cell[oi + 2] = b
        cell[oi + 3] = 255
        if (!isNearWhite(r, g, b)) nonWhite++
      }
    }
    if (nonWhite < 20) continue // empty cell

    // flood fill background from borders
    const near = new Uint8Array(cw * ch)
    for (let i = 0; i < cw * ch; i++) {
      const r = cell[i * 4],
        g = cell[i * 4 + 1],
        b = cell[i * 4 + 2]
      near[i] = isNearWhite(r, g, b) ? 1 : 0
    }
    const bg = new Uint8Array(cw * ch) // 1 = background (transparent)
    const stack = []
    const push = (x, y) => {
      if (x < 0 || y < 0 || x >= cw || y >= ch) return
      const i = y * cw + x
      if (bg[i] || !near[i]) return
      bg[i] = 1
      stack.push(i)
    }
    for (let x = 0; x < cw; x++) {
      push(x, 0)
      push(x, ch - 1)
    }
    for (let y = 0; y < ch; y++) {
      push(0, y)
      push(cw - 1, y)
    }
    while (stack.length) {
      const i = stack.pop()
      const x = i % cw,
        y = (i - x) / cw
      push(x + 1, y)
      push(x - 1, y)
      push(x, y + 1)
      push(x, y - 1)
    }

    // apply transparency
    for (let i = 0; i < cw * ch; i++) {
      if (bg[i]) cell[i * 4 + 3] = 0
    }
    // feather: 1px border between opaque and transparent
    const alphaSnapshot = new Uint8Array(cw * ch)
    for (let i = 0; i < cw * ch; i++) alphaSnapshot[i] = cell[i * 4 + 3]
    for (let y = 0; y < ch; y++) {
      for (let x = 0; x < cw; x++) {
        const i = y * cw + x
        if (alphaSnapshot[i] === 0) continue
        const adjacentToBg =
          (x > 0 && bg[i - 1]) ||
          (x < cw - 1 && bg[i + 1]) ||
          (y > 0 && bg[i - cw]) ||
          (y < ch - 1 && bg[i + cw])
        if (!adjacentToBg) continue
        const r = cell[i * 4],
          g = cell[i * 4 + 1],
          b = cell[i * 4 + 2]
        const minc = Math.min(r, g, b)
        // the whiter the edge pixel, the more transparent it should be
        const a = Math.max(0, Math.min(255, Math.round((238 - minc) * (255 / 60))))
        cell[i * 4 + 3] = Math.min(cell[i * 4 + 3], a)
      }
    }

    const png = new PNG({ width: cw, height: ch })
    png.data = cell
    const name = `tile_R${ry}C${cx}.png`
    fs.writeFileSync(path.join(OUT_DIR, name), PNG.sync.write(png))
    manifest.push({ name, row: ry, col: cx, x: x0, y: y0, w: cw, h: ch })
  }
}

fs.writeFileSync(path.join(TMP_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2))
console.log(`sliced ${manifest.length} tiles -> ${OUT_DIR}`)
