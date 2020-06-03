import { cloneDeep, range, pick, sum } from 'lodash'
import Storage from '@unrest/storage'

import Geo from './Geo'

const css = {
  xy: (xy) => `x-${xy[0]} y-${xy[1]}`,
}

const CHESS_PIECES = ['knight', 'king', 'queen']

const saved_games = new Storage('saved games')
// const made_games = new Storage('made games')

const dxy2text = {
  '1,0': 'right',
  '-1,0': 'left',
  '0,1': 'down',
  '0,-1': 'up',
}

// example puzzles:
// 7Qh3tBm4mj - ceiling and floor
const buildUnderlays = (underlays, geo) => {
  return underlays.map((underlay) => {
    const center = underlay.center.reverse()
    const ratio = underlay.width / underlay.height
    const xy = center.map((n) => Math.floor(n))
    const index = geo.xy2index(xy)
    let type = 'square'
    let orientation = ''
    if (ratio < 1) {
      type = 'wall'
      orientation = 'h-split'
    } else if (ratio > 1) {
      type = 'wall'
      orientation = 'v-split'
    }
    const className = `underlay ${orientation} ${type} ${css.xy(xy)}`
    return {
      index,
      offset: [xy[0] - center[0], xy[1] - center[1]],
      xy,
      type,
      orientation,
      color: underlay.backgroundColor,
      className,
      _className: className,
    }
  })
}

export default class Board {
  constructor(options) {
    window.B = this
    this.options = options
    this.geo = new Geo({ W: 9 })
    this.reset()

    // load saved game if exists
    Object.assign(this, saved_games.get(this.slug) || {})
    this.turn = this.actions.length
  }

  reset() {
    Object.assign(this, cloneDeep(this.options), {
      start: new Date().valueOf(),
      answer: {},
      corner: {},
      centre: {},
      colour: {},
      actions: [],
      extras: {},
    })

    this.constraints = [
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
    ]

    this.required_constraints = {
      row: true,
      col: true,
      box: true,
      complete: true,
    }

    if (this.ctc) {
      const { arrows = [], underlays = [], cages = [], cells = [] } = this.ctc
      this.sudoku = this.sudoku = []
      cells.forEach((row) =>
        row.forEach((cell) => this.sudoku.push(cell.value)),
      )
      this.extras.arrows = arrows.map((arrow) => {
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
      this.extras.underlays = buildUnderlays(underlays, this.geo)
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
        'finish',
        'sudoku',
        'answer',
        'corner',
        'centre',
        'colour',
        'actions',
        'frozen',
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
      colour: this.colour[index] || [],
      underlays: [],
    }))
    this.errors.indexes.forEach((index) => (cells[index].error = true))
    this.extras.arrows.forEach((arrow) => (cells[arrow.index].arrow = arrow))
    this.extras.cages.forEach((cage) =>
      cage.cells.forEach(
        (cage_cell) => (cells[cage_cell.index].cage = cage_cell),
      ),
    )
    this.extras.underlays.forEach((underlay) =>
      cells[underlay.index].underlays.push(underlay),
    )
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

  clearErrors() {
    this.extras.underlays.forEach(
      (underlay) => (underlay.className = underlay._className),
    )
    this.errors = {
      reasons: [],
      indexes: [],
      count: 0,
    }
    this.extras.cages.forEach((cage) =>
      cage.cells.forEach((cell) => (cell.className = cell._className)),
    )
  }

  getAnswer = (index) =>
    parseInt(this.sudoku[index]) || parseInt(this.answer[index])

  check(options = {}) {
    const {
      row,
      col,
      box,
      complete,
      killer_sudoku,
      killer_total,
      anti_9_queen,
    } = options
    this.clearErrors()
    complete && this._validateAnswers()
    range(this.geo.W).forEach((i) => {
      row && this._checkSudoku('row', i)
      col && this._checkSudoku('col', i)
      box && this._checkSudoku('box', i)
    })

    // validate killer cages
    const _err = (cage) =>
      cage.cells.forEach((cell) => (cell.className += ' error'))
    killer_total &&
      this.extras.cages.forEach((cage) => {
        const total = sum(cage.indexes.map(this.getAnswer))
        if (total !== parseInt(cage.value)) {
          this.errors.reasons.push(`Cage should be ${cage.value}, got ${total}`)
          this.errors.count++
          _err(cage)
        }
      })

    killer_sudoku &&
      this.extras.cages.forEach((cage) => {
        const bins = this._binAnswers(cage.indexes)
        Object.entries(bins).forEach(([number, indexes]) => {
          if (indexes.length > 1) {
            this.errors.reasons.push(
              `There are ${indexes.length} ${number}s in a killer cage.`,
            )
            this.errors.count++
            _err(cage)
          }
        })
      })

    CHESS_PIECES.filter((piece) => options['anti_' + piece]).forEach((piece) =>
      this._validateAntiChess(piece),
    )

    if (anti_9_queen) {
      const indexes = range(this.geo.AREA).filter(
        (index) => this.getAnswer(index) === 9,
      )
      this._validateAntiChess('queen', indexes)
    }

    options.consecutive_pairs &&
      this.extras.underlays.forEach((underlay) => {
        const { index, orientation } = underlay
        const index2 = index - (orientation === 'h-split' ? 1 : this.geo.W)
        const diff = Math.abs(this.getAnswer(index) - this.getAnswer(index2))
        if (!isNaN(diff) && diff !== 1) {
          this.errors.count += 1
          this.errors.reasons.push(
            'Cells separated by bars must be consecutive pairs',
          )
          underlay.className += ' error'
        }
      })

    // to qualify as a win they must check sudoku constraints (row, col, box)
    if (row && col && box && this.errors.count === 0) {
      this.finish = new Date().valueOf()
      this.save()
    }
  }

  _validateAntiChess = (piece, indexes = range(this.geo.AREA)) => {
    indexes.forEach((index) => {
      const number = this.getAnswer(index)
      if (number === undefined) {
        return
      }
      this.geo['index2' + piece](index).forEach((index2) => {
        const number2 = this.getAnswer(index2)
        if (number2 === number) {
          this.errors.count += 1
          this.errors.reasons.push(
            `There are ${number}s that can attack each other by ${piece}'s move.`,
          )
          this.errors.indexes.push(index)
        }
      })
    })
  }

  _validateAnswers() {
    const allowed = {}
    range(1, 10).map((i) => (allowed[i] = true))
    range(this.geo.AREA).forEach((index) => {
      const number = this.sudoku[index] || this.answer[index]
      if (!allowed[number]) {
        this.errors.count += 1
        this.errors.reasons.push(`No final answer can be ${number}`)
        this.errors.indexes.push(index)
      }
    })
  }

  _binAnswers(indexes) {
    const bins = {}
    indexes.forEach((index) => {
      const number = this.sudoku[index] || this.answer[index]
      if (number !== undefined) {
        bins[number] = bins[number] || []
        bins[number].push(index)
      }
    })
    return bins
  }

  _checkSudoku(type, type_no) {
    const bins = this._binAnswers(this.geo[`${type}2indexes`](type_no))
    Object.entries(bins).forEach(([number, indexes]) => {
      if (indexes.length > 1) {
        this.errors.count += indexes.length
        this.errors.reasons.push(
          `There are ${indexes.length} ${number}s in ${type} ${type_no}`,
        )
        this.errors.indexes = this.errors.indexes.concat(indexes)
      }
    })
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
    const { finish = new Date().valueOf(), start } = this
    const seconds = (finish - start) / 1000
    return `${Math.floor(seconds / 60)}m ${Math.floor(seconds % 60)}s`
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
