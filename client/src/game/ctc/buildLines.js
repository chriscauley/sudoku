import css from '@unrest/css'

import { vector, dxy2text } from '../Geo'
import extractColor from './extractColor'

// currently only thermometers & diagonals
// forked thermometer #H7n7NhH26M
// lots of theremometers #J7pMMgrLL3
export default (board) => {
  const thermometer_colors = {}
  const forced_ends = {} // used in "shall we play a game" #Z4gGYPtBWNw

  const { W, H } = board.geo
  const processedLines = board.ctc.lines
    .filter((l) => l.wayPoints.length)
    .map((line) => {
      const { wayPoints } = line
      const color = extractColor(line.color)
      const cells = wayPoints.map((wp) => {
        const xy = wp.map((i) => Math.floor(i)).reverse()
        const index = board.geo.xy2index(xy)
        if (wp[0] % 0.5 || wp[1] % 0.5) {
          forced_ends[index] = color
        }
        return { xy, index }
      })
      if (cells.length === 2 && cells[0].index + cells[1].index === 90) {
        const diff = Math.abs(cells[0].index - cells[1].index)
        let xys = [],
          direction
        if (diff === 90) {
          xys = vector.connect([0, 0], [W - 1, H - 1])
          direction = 'up'
        } else if (diff === 72) {
          xys = vector.connect([0, H - 1], [W - 1, 0])
          direction = 'down'
        } else {
          // not actually a diagonal, just two cells that sum to 90
          return { cells, type: 'thermo', color }
        }
        return {
          type: 'diagonal',
          direction,
          cells: xys.map((xy) => ({
            xy,
            index: board.geo.xy2index(xy),
            className: css.cell('line-diagonal', direction, 'color-' + color),
          })),
        }
      }
      return { cells, type: 'thermo', color }
    })

  // fill in the cells between the old "waypoint" cells, which are just the corners
  board.extras.lines = processedLines.map((line) => {
    let last_xy
    const line_xys = []
    if (line.type === 'thermo') {
      line.cells.forEach((point) => {
        if (last_xy) {
          vector
            .connect(last_xy, point.xy)
            .slice(1)
            .map((xy) => line_xys.push(xy))
        } else {
          line_xys.push(point.xy)
        }
        last_xy = point.xy
      })
      line.cells = line_xys.map((xy) => ({
        index: board.geo.xy2index(xy),
        className: 'line-thermo ' + 'color-' + line.color,
        xy,
      }))
    }

    return line
  })

  // TODO replace lines with canvas, which will make this calss obsolete
  board.extras.lines.forEach((line) => {
    const color = line.color
    line.cells.forEach((cell) => {
      if (forced_ends[cell.index] === color) {
        console.warn('potential classname problem #1 in build lines')
        cell.className += ' forced_end'
      }
    })
  })

  board.extras.lines.forEach((line) => {
    const { color } = line
    thermometer_colors[color] = thermometer_colors[color] || {}
    if (line.type === 'thermo') {
      let last_point
      line.cells.forEach((point) => {
        const { index } = point
        thermometer_colors[color][index] = thermometer_colors[color][index] || []
        if (last_point) {
          // TODO I think the from/to className is obsolete now that I'm using canvas
          console.warn('potential calssnmae issue #2 in build lines')
          point.className +=
            ' from from-' + dxy2text[vector.sign(vector.subtract(last_point.xy, point.xy))]
          last_point.className +=
            ' to to-' + dxy2text[vector.sign(vector.subtract(point.xy, last_point.xy))]
          thermometer_colors[color][index].push(last_point.index)
          thermometer_colors[color][last_point.index].push(index)
        }
        last_point = point
      })
    }
    line.cells.forEach((point) => (point._className = point.className))
  })

  buildThermometers(board, thermometer_colors, forced_ends)
}

const fixThermometer = (thermometer, u) => {
  // right now this only handles single forked bulbs because that's the only exception I've encountered
  const index2 = thermometer[u.index][0]
  delete thermometer[u.index]
  thermometer[index2].push(u.index)
}

const buildThermometers = (board, _colors, forced_ends) => {
  // build out the "this cell is greater than these" map used in checking thermometers
  const thermometers = {}
  board.extras.thermometers = []
  board.extras.marks.forEach((u) => {
    if (u.type !== 'thermo') {
      return
    }
    thermometers[u.color] = thermometers[u.color] || []
    const matched = thermometers[u.color].find((t) => t[u.index])
    if (matched) {
      fixThermometer(matched, u)
      return
    }
    let depth = 0
    const _thermo = {}
    const thermometer = _colors[u.color]
    if (!(thermometer && thermometer[u.index])) {
      console.warn('Cannot find thermometer')
      return
    }
    const chase = (index, last) => {
      depth++
      let is_end = forced_ends[index] === u.color
      !is_end &&
        thermometer[index].forEach((index2) => {
          if (index2 === last || depth > 100) {
            return
          }
          _thermo[index2] = _thermo[index2] || []
          _thermo[index2].push(index)
          is_end = true
          chase(index2, index)
        })
    }
    chase(u.index, undefined, [])
    thermometers[u.color].push(_thermo)
    board.extras.thermometers.push(_thermo)
  })
}
