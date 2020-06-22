import { cloneDeep, range, pick } from 'lodash'
import Storage from '@unrest/storage'

import Animator from './Animator'
import Checker from './Checker'
import Geo from './Geo'
import { buildGutters } from './Gutter'
import { buildLines, buildMarks, buildArrows } from './ctc'

const PARITIES = {
  odd: ['1', '3', '5', '7', '9'],
  even: ['2', '4', '6', '8'],
}

export const saved_games = new Storage('saved games')
// const made_games = new Storage('made games')

export default class Board {
  constructor(options) {
    window.B = this
    options.required_constraints = options.required_constraints || []
    this.options = options
    this.geo = new Geo({ W: 9 })
    this.checker = new Checker(this)
    this.animator = new Animator(this)
    this.color_mode = 'colour'
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
      'between_sudoku_1',
      'arrow_sudoku',
      'multiple_solutions',
      'nonconsective_adjacent',
      'snake',
      'other',
    ]

    if (this.ctc) {
      const { cages = [], cells = [] } = this.ctc
      this.sudoku = []
      cells.forEach((row) =>
        row.forEach((cell) => this.sudoku.push(cell.value)),
      )

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

      this.gutter_marks = []
      this.extras.marks = []
      buildMarks(this)

      buildGutters(this.gutter_marks, this)
      buildArrows(this)
      buildLines(this)
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
    if (mode === 'parity') {
      this.color_mode = 'parity'
      action.was = cloneDeep(indexes.map((index) => this.centre[index]))
    } else if (mode !== 'delete') {
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
      this.color_mode = 'colour'
      // color always just sets value
      indexes.forEach((index) => (this.colour[index] = value))
    } else if (mode === 'answer') {
      indexes.forEach((index) => {
        // cannot write to sudoku squares
        if (this.sudoku[index] === undefined) {
          this.answer[index] = value
        }
      })
    } else if (mode === 'parity') {
      const allowed = PARITIES[value]
      indexes.forEach((index) => {
        if (
          this.answer[index] !== undefined ||
          this.sudoku[index] !== undefined
        ) {
          return
        }
        const centres = (this.centre[index] || []).filter((i) =>
          allowed.includes(i),
        )
        if (centres.length === 1) {
          this.answer[index] = centres[0]
        } else if (centres.length === 0) {
          this.centre[index] = allowed.slice()
        } else {
          this.centre[index] = centres
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
        'color_mode',
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
      extras: [],
    }))

    if (this.color_mode === 'parity') {
      const names = ['even', 'odd']
      cells.forEach((cell) => {
        delete cell.colour
        const matches = names.filter((name) => {
          const value = cell.question || cell.answer
          const values = value === undefined ? cell.centre : [value]
          return (
            PARITIES[name].find((num) => values.includes(num)) !== undefined
          )
        })
        if (matches.length === 1) {
          cell.colour = matches[0]
        }
      })
    }
    cells.forEach((cell) => {
      if (cell.colour !== undefined) {
        cell.extras.push({ className: 'colour colour-' + cell.colour })
      }
    })

    this.is_full = !cells.find(
      (c) => c.answer === undefined && c.question === undefined,
    )

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
    const valid = !this.required_constraints.find(
      (type) => !constraints.includes(type),
    )

    this.checker.check({ constraints })
    if (valid && this.errors.count === 0) {
      this.animator.animate({ constraints, checker: this.checker })
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
    let was = { [action.mode]: action.was }
    if (action.mode === 'parity') {
      was = { centre: action.was }
    } else if (action.mode === 'delete') {
      was = action.was
    }
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
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0')
    return `${Math.floor(seconds / 60)}:${s}`
  }

  makeSolve() {
    this.solve = this.solve || {
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
