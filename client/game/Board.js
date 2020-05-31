import { cloneDeep, range, pick } from 'lodash'
import Storage from '@unrest/storage'

import Geo from './Geo'

const saved_games = new Storage('saved games')
// const made_games = new Storage('made games')

const dxy2text = {
  '1,0': 'right',
  '-1,0': 'left',
  '0,1': 'down',
  '0,-1': 'up',
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
      answer: {},
      corner: {},
      centre: {},
      colour: {},
      actions: [],
    })
    this.extras = Object.assign(this.extras || {}, {
      arrows: [],
    })
    if (this.ctc && !this.sudoku) {
      this.sudoku = this.sudoku = []
      const { cells } = this.ctc
      cells.forEach((row) =>
        row.forEach((cell) => this.sudoku.push(cell.value)),
      )
      if (this.ctc.arrows) {
        this.extras.arrows = this.ctc.arrows.map((arrow) => {
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
      }
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
    }))
    this.errors.indexes.forEach((index) => (cells[index].error = true))
    this.extras.arrows.forEach((arrow) => (cells[arrow.index].arrow = arrow))
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
    this.errors = {
      reasons: [],
      indexes: [],
      count: 0,
    }
  }

  check() {
    this.clearErrors()
    this._validateAnswers()
    range(this.geo.W).forEach((i) => {
      this._checkSudoku('row', i)
      this._checkSudoku('col', i)
      this._checkSudoku('box', i)
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

  _checkSudoku(type, type_no) {
    const indexes = this.geo[`${type}2indexes`](type_no)
    const bins = {}
    indexes.forEach((index) => {
      const number = this.sudoku[index] || this.answer[index]
      bins[number] = bins[number] || []
      bins[number].push(index)
    })
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
