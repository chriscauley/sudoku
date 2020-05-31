import { cloneDeep, range, pick, flatten } from 'lodash'
import Storage from '@unrest/storage'

const saved_games = new Storage('saved games')
// const made_games = new Storage('made games')

class Geo {
  constructor(options) {
    if (!options.W) {
      throw 'Geo requires a W (width)'
    }
    this.setSize(options)
    // html element for mouse event calculations
    // can be undefined during initialization and set later
    this.element = options.element
  }

  setSize({ W, H = W }) {
    this.W = W
    this.H = H
    this.AREA = W * H
    this.preCache()
  }

  pxy2xy = (pxy) => {
    if (!this.element) {
      return [-1, -1]
    }
    const { left, top, height } = this.element.getBoundingClientRect()
    const w_px = height / this.W
    const h_px = height / this.H
    return [
      Math.floor((pxy[0] - left) / h_px),
      Math.floor((pxy[1] - top) / w_px),
    ]
  }

  pxy2index = (pxy) => this.xy2index(this.pxy2xy(pxy))
  xy2index = (xy) => xy[0] + this.W * xy[1]
  index2xy = (index) => [index % this.W, Math.floor(index / this.W)]

  preCache = () => {
    const { W, H, xy2index } = this

    // sudoku specific
    this._row2indexes = range(H).map((y) =>
      range(W).map((x) => xy2index([x, y])),
    )
    this._col2indexes = range(W).map((x) =>
      range(H).map((y) => xy2index([x, y])),
    )

    // this is highly sudoku specific for now since it relies on boxes being square
    const box_count = 3 // boxes per row/col of game
    const box_width = 3 // rows/columns per box
    this._box2indexes = range(box_count * box_count).map((box) => {
      const x0 = (box % box_count) * box_width
      const y0 = Math.floor(box / box_count) * box_width
      return flatten(
        range(box_width).map((bx) =>
          range(box_width).map((by) => xy2index([x0 + bx, y0 + by])),
        ),
      )
    })
  }
  // these are sudoku specific
  row2indexes = (y) => this._row2indexes[y]
  col2indexes = (x) => this._col2indexes[x]
  box2indexes = (box) => this._box2indexes[box]
}

export default class Board {
  constructor(options) {
    window.B = this
    this.options = options
    this.geo = new Geo({ W: 9 })
    this.reset()

    // load saved game if exists
    Object.assign(this, saved_games.get(this.slug) || {})
  }

  reset() {
    Object.assign(this, cloneDeep(this.options), {
      answer: {},
      corner: {},
      centre: {},
      colour: {},
      actions: [],
    })
    if (this.ctc && !this.sudoku) {
      this.sudoku = this.sudoku = []
      const { cells } = this.ctc
      cells.forEach((row) =>
        row.forEach((cell) => this.sudoku.push(cell.value)),
      )
    }
    this.sudoku = this.sudoku || range(this.geo.AREA).map(() => {})
    this.clearErrors()
  }

  save() {
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

  doAction(action) {
    const { mode, indexes, value } = action
    this.actions.push(action)
    if (mode === 'delete') {
      // delete is not affected by the mode
      delete action.value
      this.deleteCells(indexes)
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
    return pick(this, [
      'sudoku',
      'answer',
      'corner',
      'centre',
      'colour',
      'actions',
    ])
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
    layers.forEach((layer) =>
      indexes.forEach((index) => delete this[layer][index]),
    )
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
