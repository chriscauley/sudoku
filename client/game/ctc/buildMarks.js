import extractColor from './extractColor'
import _className from '../className'

// example puzzles:
// H7n7NhH26M - crazy thermometers
// 7Qh3tBm4mj - ceiling and floor
export default (marks, geo) => {
  marks = marks.map((mark) => {
    const center = mark.center.reverse()
    const ratio = mark.width / mark.height
    const xy = center.map((n) => Math.floor(n))
    const index = geo.xy2index(xy)
    let type = mark.rounded ? 'thermo' : 'square'
    let orientation = ''
    if (ratio < 1) {
      type = 'wall'
      orientation = 'h-split'
    } else if (ratio > 1) {
      type = 'wall'
      orientation = 'v-split'
    }
    const color = extractColor(mark.backgroundColor)
    const className = _className(
      { xy, rounded: mark.rounded },
      `mark ${orientation} ${type} color-${color}`,
    )
    return {
      index,
      offset: [xy[0] - center[0], xy[1] - center[1]],
      text: mark.text,
      xy,
      type,
      orientation,
      color,
      className,
      _className: className,
    }
  })

  const mark_indexes = {}
  marks.forEach((u) => (mark_indexes[u.index] = u))
  marks.forEach((mark) => {
    if (!geo.xyInGrid(mark.xy)) {
      mark.type = 'gutter'
      return
    }
    mark.next_to = geo
      .index2pawn(mark.index)
      .map((i) => mark_indexes[i])
      .filter(Boolean)
    mark.is_end = mark.next_to.length === 1
  })
  return marks
}
