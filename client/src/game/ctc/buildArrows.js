import { cloneDeep } from 'lodash'

import { vector } from '../Geo'
import css from '@unrest/css'

export const fromCTC = ({ wayPoints }) => {
  wayPoints = cloneDeep(wayPoints)
  // waypoints use yx coordinates, so flip them
  const wp1 = wayPoints[wayPoints.length - 2].reverse()
  const wp2 = wayPoints[wayPoints.length - 1].reverse()
  const average = vector.add(wp1, wp2).map((n) => n / 2)
  const d = vector.subtract(wp1, wp2).map((n) => Math.abs(n))

  const out = {
    xy: average.map((n) => Math.floor(n)),
    dxy: [-Math.sign(wp1[0] - wp2[0]), -Math.sign(wp1[1] - wp2[1])],
  }
  const long = (out.long = !!d.find((n) => n > 1))
  if (long) {
    // spans two cells, average will not work. Use head waypoint as xy and mark as long
    out.xy = wp2.map((n) => Math.floor(n))
    out.long = true
  }
  out.className = [out, 'arrow']
  return out
}

export default (board) => {
  const { arrows = [] } = board.options.ctc
  const { geo } = board
  board.extras.arrows = []
  arrows.forEach((ctc_arrow) => {
    if (ctc_arrow.wayPoints.length < 2) {
      return
    }
    const arrow = fromCTC(ctc_arrow)
    arrow.index = geo.xy2index(arrow.xy)
    if (arrow.long) {
      board.options.ctc.lines.push(ctc_arrow)
    }
    if (geo.xyInGrid(arrow.xy)) {
      board.extras.arrows.push(arrow)
    } else {
      console.warn('TODO: gutter arrow at', arrow.xy)
    }
  })
}
