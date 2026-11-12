import { chromium } from '@playwright/test'

const url = process.argv[2] ?? 'http://localhost:4173/'
const out = process.argv[3] ?? 'scripts/shot.png'
const width = Number(process.argv[4] ?? 1280)
const height = Number(process.argv[5] ?? 960)
const frozen = process.argv[6] !== 'live'

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height } })

if (frozen) {
  // Freeze time so screenshots are deterministic (2007-10-30 23:03:00 local)
  const fixed = new Date(2007, 9, 30, 23, 3, 0).getTime()
  await page.addInitScript((fixedTime) => {
    const RealDate = Date
    class FrozenDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          super(fixedTime)
        } else {
          super(...args)
        }
      }
      static now() {
        return fixedTime
      }
    }
    // @ts-expect-error override global Date
    window.Date = FrozenDate
  }, fixed)
}

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(400)
await page.screenshot({ path: out })
await browser.close()
console.log(`saved ${out} (${width}x${height})`)
