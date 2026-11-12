import type { IconProps } from './types'
import { SPRITE, type SpriteName } from './spritemap'

/** Renders a sliced Vista tile by name. */
export function Sheet({ name, size = 32, className, title }: IconProps & { name: SpriteName }) {
  return (
    <img
      src={SPRITE[name]}
      width={size}
      height={size}
      className={className}
      alt={title ?? ''}
      title={title}
      draggable={false}
      style={{ imageRendering: 'auto' }}
    />
  )
}
