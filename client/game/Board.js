import classNames from 'classnames'
import { cloneDeep, range, pick } from 'lodash'
import Storage from '@unrest/storage'

import Geo, { vector } from './Geo'
import Checker from './Checker'

const css = {
  xy: (xy) => `x-${xy[0]} y-${xy[1]}`,
}

export const saved_games = new Storage('saved games')
// const made_games = new Storage('made games')

const dxy2text = {
  '1,0': 'right',
  '-1,0': 'left',
  '0,1': 'down',
  '0,-1': 'up',
  '1,1': 'downright',
  '-1,1': 'downleft',
  '-1,-1': 'upleft',
  '1,-1': 'upright',
}

const extractColor = (color) => {
  const color_map = {
    '#A3E048': 'green',
    '#F7D038': 'yellow',
    '#34BBE6': 'blue',
    '#CFCFCF': 'gray',
  }

  color = color.toUpperCase()
  if (!color_map[color]) {
    console.warn('missing color', color)
    return 'gray'
  }
  return color_map[color]
}

class Gutter {
  constructor(options) {
    this.board = options.board
    this.g = options.g
    this.name = this.board.geo.g2text(this.g)
    this.is_column = this.g % 2 === 0
    this.SIZE = this.board.geo[this.is_column ? 'H' : 'W']
    this.values = range(this.SIZE).map(() => undefined)
    this.className = 'gutter gutter-' + this.name
  }
  get = (index) => this.values[index]
  set = (index, value) => (this.values[index] = value)
}

const buildGutters = (marks, board) => {
  board.gutters = range(4).map((g) => new Gutter({ board, g }))
  marks.forEach((mark) => {
    const xy = mark.xy
    if (board.geo.xyInGrid(xy)) {
      console.warn('Mark found in grid. Marks currently only work for gutter.')
      return
    }
    const gi = board.geo.xy2gi(xy)
    if (!gi) {
      console.warn('no gutter matching', xy)
      return
    }
    board.gutters[gi[0]].set(gi[1], mark.text)
  })
}

// currently only thermometers & diagonals
// forked thermometer #H7n7NhH26M
// lots of theremometers #J7pMMgrLL3
const buildLines = (lines, board) => {
  const thermometer_colors = {}
  const forced_ends = {} // used in "shall we play a game" #Z4gGYPtBWNw

  const { W, H } = board.geo
  const processedLines = lines
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
            className: classNames('line-diagonal', direction, 'color-' + color),
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
        thermometer_colors[color][index] =
          thermometer_colors[color][index] || []
        if (last_point) {
          point.className +=
            ' from from-' +
            dxy2text[vector.sign(vector.subtract(last_point.xy, point.xy))]
          last_point.className +=
            ' to to-' +
            dxy2text[vector.sign(vector.subtract(point.xy, last_point.xy))]
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

// example puzzles:
// H7n7NhH26M - crazy thermometers
// 7Qh3tBm4mj - ceiling and floor
const buildMarks = (marks, geo) => {
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
    const className = classNames(
      `mark ${orientation} ${type} color-${color}`,
      css.xy(xy),
      { rounded: mark.rounded },
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

export default class Board {
  constructor(options) {
    window.B = this
    options.required_constraints = options.required_constraints || []
    this.options = options
    this.geo = new Geo({ W: 9 })
    this.checker = new Checker(this)
    this.reset()

    // load saved game if exists
    Object.assign(this, saved_games.get(this.slug) || {})
    this.turn = this.actions.length
    if (this.finish) {
      this.makeSolve()
    }

    // uncomment to debug
    // this.geo.indexes.forEach((index) => (this.corner[index] = [index]))
    this.draw()
  }

  draw() {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1000
    const sx = canvas.width / this.geo.W
    const sy = canvas.height / this.geo.H
    const ctx = canvas.getContext('2d')
    ctx.lineWidth = sx / 7
    ctx.lineCap = 'round'
    this.ctc.lines.forEach((line) => {
      const wayPoints = line.wayPoints.map((wp) => wp.reverse())
      const wp0 = wayPoints[0]
      if (!wp0) {
        return
      }
      ctx.beginPath()
      ctx.moveTo(wp0[0] * sx, wp0[1] * sy)
      ctx.strokeStyle = line.color
      wayPoints.slice(1).forEach((wp) => {
        ctx.lineTo(wp[0] * sx, wp[1] * sy)
      })
      ctx.stroke()
    })
    this.bg_image = `url(${canvas.toDataURL()})`
  }

  reset() {
    this.checker.reset()
    Object.assign(this, cloneDeep(this.options), {
      start: new Date().valueOf(),
      answer: {},
      corner: {},
      centre: {},
      colour: {},
      actions: [],
      extras: {},
      constraints: this.required_constraints || [
        'row',
        'col',
        'box',
        'complete',
      ],
    })
    delete this.solve

    this.available_constraints = [
      'row',
      'col',
      'box',
      'complete',
      'killer_sudoku',
      'killer_total',
      'anti_knight',
      'anti_king',
      // 'anti_queen', not currently used anywhere
      'anti_9_queen',
      'consecutive_pairs',
      'thermo',
      'unique_diagonals',
      'consecutive_regions',
      'unique_regions',
      'increasing_or_decreasing',
      'magic_square',
      'sandwich',
      'between_sudoku',
      'arrow_sudoku',
      'other',
    ]

    if (this.ctc) {
      const {
        arrows = [],
        underlays = [],
        overlays = [],
        cages = [],
        cells = [],
        lines = [],
      } = this.ctc
      this.sudoku = []
      cells.forEach((row) =>
        row.forEach((cell) => this.sudoku.push(cell.value)),
      )

      // #hg764Pd67f has lots of arrows in grid
      // #p6Pb99bbDr has arrows not in grid
      this.extras.arrows = arrows
        .map((arrow) => {
          const [xy1, xy2] = arrow.wayPoints
          const xy = xy1.map((n) => Math.floor(n)).reverse()
          const dxy = [-Math.sign(xy1[1] - xy2[1]), -Math.sign(xy1[0] - xy2[0])]
          const dir = dxy2text[dxy]
          return {
            dindex: dxy[0] + dxy[1] * this.geo.W,
            index: this.geo.xy2index(xy),
            xy,
            dxy,
            className: `arrow arrow-${dir} dxy-${dxy.join(
              '',
            )} fa fa-chevron-${dir}`,
          }
        })
        .filter((a) => this.geo.xyInGrid(a.xy))

      this.extras.cages = cages.map((cage) => {
        cage.indexes = []
        cage.first = { index: Infinity }
        cage.last = { index: 0 }
        cage.cells = cage.cells.map((xy) => {
          xy = xy.reverse()
          const index = this.geo.xy2index(xy)
          const cell = { xy, index, className: 'cage' }
          cage.indexes.push(index)
          if (cage.first.index > cell.index) {
            cage.first = cell
          }
          if (cage.last.index < cell.index) {
            cage.last = cell
          }
          return cell
        })
        cage.first.className += ' cage-first'
        cage.last.className += ' cage-last'
        cage.first.text = cage.last.text = cage.value
        cage.cells.forEach((cell) => {
          Object.entries(this.geo._text2dindex).forEach(([text, dindex]) => {
            if (!cage.indexes.includes(cell.index + dindex)) {
              cell.className += ' cage-' + text
            }
            cell._className = cell.className
          })
        })
        return cage
      })

      const gutter_marks = []
      this.extras.marks = []
      // ctc doesn't seem to differentiate much with underlays/overlays
      buildMarks(underlays.concat(overlays), this.geo).forEach((mark) => {
        if (mark.type === 'gutter') {
          gutter_marks.push(mark)
        } else {
          this.extras.marks.push(mark)
        }
      })

      buildGutters(gutter_marks, this)

      buildLines(lines, this)
    }

    this.turn = this.actions.length
    this.sudoku = this.sudoku || range(this.geo.AREA).map(() => {})
    this.clearErrors()
  }

  save() {
    if (this.frozen) {
      return
    }
    const json = this.toJson()
    delete json.sudoku
    saved_games.set(this.slug, json)
  }

  save_new() {
    const json = this.toJson()
    json.sudoku = range(this.geo.AREA).map(() => {})
    // Object.entries(json.answer).forEach(([key, value]) => {
    //   console.log(key, value)
    // })
  }

  doAction(action, safe = false) {
    if (this.frozen && !safe) {
      console.warn('unfreezing')
      delete this.frozen
    }
    const { mode, indexes, value } = action
    if (mode !== 'delete') {
      action.was = cloneDeep(indexes.map((index) => this[mode][index]))
    }
    this.actions.push(action)
    this.turn++
    if (mode === 'delete') {
      // delete is not affected by the mode
      delete action.value
      action.was = cloneDeep(this.deleteCells(indexes))
    } else if (mode === 'centre' || mode === 'corner') {
      this._toggle(mode, indexes, value)
    } else if (mode === 'colour') {
      // color always just sets value
      indexes.map((index) => (this.colour[index] = value))
    } else if (mode === 'answer') {
      indexes.map((index) => {
        // cannot write to sudoku squares
        if (this.sudoku[index] === undefined) {
          this.answer[index] = value
        }
      })
    }
    this.save()
  }

  toJson() {
    return cloneDeep(
      pick(this, [
        'start',
        'sudoku',
        'answer',
        'corner',
        'centre',
        'colour',
        'actions',
        'frozen',
        'solve',
        'constraints',
      ]),
    )
  }

  _toggle(mode, indexes, value) {
    indexes.map((index) => {
      // cannot write to sudoku or answer squares
      if (
        this.sudoku[index] === undefined &&
        this.answer[index] === undefined
      ) {
        this[mode][index] = arrayToggle(this[mode][index] || [], value)
      }
    })
  }

  deleteCells(indexes) {
    let layers = ['answer', 'centre', 'corner']
    const first_match = layers.find((layer) =>
      indexes.find((index) => this[layer][index] !== undefined),
    )
    if (!first_match) {
      layers = ['colour']
    }
    const was = {}
    layers.forEach((layer) => {
      was[layer] = indexes.map((index) => this[layer][index])
      indexes.forEach((index) => delete this[layer][index])
    })
    return was
  }

  toCells = (selected) => {
    const cells = this.sudoku.map((question, index) => ({
      index,
      xy: this.geo.index2xy(index),
      question,
      selected: selected[index],
      selectedNeighbors: this.getSelectedNeighbors(index, selected),
      answer: this.answer[index],
      centre: this.centre[index] || [],
      corner: this.corner[index] || [],
      colour: this.colour[index],
      marks: [],
      extras: [{ className: 'colour colour-' + this.colour[index] }],
    }))
    this.errors.indexes.forEach((index) => (cells[index].error = true))
    this.extras.cages.forEach((cage) =>
      cage.cells.forEach(
        (cage_cell) => (cells[cage_cell.index].cage = cage_cell),
      ),
    )
    this.extras.arrows.forEach((arrow) => cells[arrow.index].extras.push(arrow))
    this.extras.marks.forEach((mark) => cells[mark.index].extras.push(mark))
    return cells
  }
  getSelectedNeighbors = (index, selected) => {
    if (!selected[index]) {
      return []
    }
    return [-this.geo.W, 1, this.geo.W, -1].map((dindex) =>
      selected[index + dindex] ? 0 : `selected-${dindex}`,
    )
  }

  check(constraints) {
    this.clearErrors()

    // to qualify as a win they must check sudoku constraints (row, col, box)
    const required = ['row', 'col', 'box', 'complete']
    const valid = !required.find((type) => !constraints.includes(type))

    this.checker.check({ constraints })
    if (valid && this.errors.count === 0) {
      this.makeSolve()
      this.save()
    }
  }

  clearErrors() {
    this.extras.marks.forEach((mark) => (mark.className = mark._className))
    this.extras.lines.forEach((line) =>
      line.cells.forEach((point) => (point.className = point._className)),
    )
    this.extras.cages.forEach((cage) =>
      cage.cells.forEach((cell) => (cell.className = cell._className)),
    )
  }

  freeze() {
    this.frozen = this.frozen || this.toJson()
  }

  redo() {
    if (!this.frozen || this.frozen.actions.length === this.turn) {
      return
    }

    this.doAction(this.frozen.actions[this.turn], true)
  }

  undo() {
    if (!this.actions.length) {
      return
    }
    this.freeze()
    const action = this.actions.pop()
    this.turn--
    const was =
      action.mode === 'delete' ? action.was : { [action.mode]: action.was }
    Object.entries(was).map(([layer, values]) => {
      action.indexes.forEach((index, i) => {
        const is_empty = Array.isArray(values[i]) && values[i].length === 0
        if (values[i] === null || is_empty) {
          delete this[layer][index]
        } else {
          this[layer][index] = values[i]
        }
      })
    })
  }

  replay(callback) {
    this.freeze()
    this.step_callback = callback
    this.reset()
    clearTimeout(this.timeout)
    this.timeout = setTimeout(this.stepReplay, 200)
  }

  stepReplay = () => {
    if (this.turn === this.frozen.actions.length) {
      return
    }
    clearTimeout(this.timeout)
    this.redo()
    this.step_callback()
    this.timeout = setTimeout(this.stepReplay, 200)
  }

  getTime() {
    const { solve = {}, start } = this
    const seconds = (solve.ms ? solve.ms : new Date().valueOf() - start) / 1000
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
  }

  makeSolve() {
    this.solve = {
      ms: (this.finish || new Date().valueOf()) - this.start,
      constraints: this.constraints,
      answer: this.geo.indexes.map((i) =>
        parseInt(this.answer[i] || this.sudoku[i]),
      ),
    }
  }
}

const arrayToggle = (values, value) => {
  if (values.includes(value)) {
    values = values.filter((v) => v !== value)
  } else {
    values.push(value)
    values.sort()
  }
  return values
}
