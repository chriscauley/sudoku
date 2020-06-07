import { range, sum } from 'lodash'

const _err = (cage, test = () => true) => {
  cage.cells.filter(test).forEach((cell) => (cell.className += ' error'))
}

export default class Checker {
  constructor(board) {
    this.board = board
    this.geo = board.geo
  }

  reset() {
    this.errors = this.board.errors = {
      reasons: [],
      indexes: [],
      count: 0,
    }
  }

  check(options = {}) {
    this.reset()
    this.answers = this.geo.indexes.map(
      (index) =>
        parseInt(this.board.sudoku[index]) ||
        parseInt(this.board.answer[index]),
    )
    const { constraints = [] } = options
    constraints.forEach((constraint) => this[constraint]())
  }

  row = () => this.geo.i_rows.forEach((i) => this._checkSudoku('row', i))
  col = () => this.geo.i_cols.forEach((i) => this._checkSudoku('col', i))
  box = () => this.geo.i_boxes.forEach((i) => this._checkSudoku('box', i))

  anti_knight = () => this._validateAntiChess('knight')
  anti_king = () => this._validateAntiChess('king')
  anti_queen = () => this._validateAntiChess('queen')

  conservativePairs() {
    this.board.extras.underlays.forEach((underlay) => {
      const { index, orientation } = underlay
      const index2 = index - (orientation === 'h-split' ? 1 : this.geo.W)
      const diff = Math.abs(this.answers[index] - this.answer[index2])
      if (!isNaN(diff) && diff !== 1) {
        this.errors.count += 1
        this.errors.reasons.push(
          'Cells separated by bars must be consecutive pairs',
        )
        underlay.className += ' error'
      }
    })
  }

  thermo() {
    this.board.extras.lines.forEach((line) => {
      let last
      line.cells.forEach((point) => {
        const answer = this.answers[point.index]
        if (last && answer <= this.answers[last.index]) {
          this.errors.count += 1
          this.errors.reasons.push(
            `Numbers along a thermometer must go up from the bulb`,
          )
          this.errors.indexes.push(last.index)
          this.errors.indexes.push(point.index)
        }
        if (answer) {
          last = point
        }
      })
    })
  }

  _validateAntiChess = (piece, indexes = this.geo.indexes) => {
    indexes.forEach((index) => {
      const number = this.answers[index]
      if (number === undefined) {
        return
      }
      this.geo['index2' + piece](index).forEach((index2) => {
        const number2 = this.answers[index2]
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

  complete() {
    const allowed = {}
    range(1, 10).map((i) => (allowed[i] = true))
    this.geo.indexes.forEach((index) => {
      const answer = this.answers[index]
      if (!allowed[answer]) {
        this.errors.count += 1
        this.errors.reasons.push(`No final answer can be ${answer}`)
        this.errors.indexes.push(index)
      }
    })
  }

  _binAnswers(indexes) {
    const bins = {}
    indexes.forEach((index) => {
      const answer = this.answers[index]
      if (answer !== undefined) {
        bins[answer] = bins[answer] || []
        bins[answer].push(index)
      }
    })
    return bins
  }

  _checkSudoku(type, type_no) {
    const bins = this._binAnswers(this.geo[`${type}2indexes`](type_no))
    Object.entries(bins).forEach(([answer, indexes]) => {
      if (indexes.length > 1) {
        this.errors.count += indexes.length
        this.errors.reasons.push(
          `There are ${indexes.length} ${answer}s in ${type} ${type_no}`,
        )
        this.errors.indexes = this.errors.indexes.concat(indexes)
      }
    })
  }

  // validate killer cages
  killer_total() {
    this.extras.cages.forEach((cage) => {
      const total = sum(cage.indexes.map(this.getAnswer))
      if (total !== parseInt(cage.value)) {
        this.errors.reasons.push(`Cage should be ${cage.value}, got ${total}`)
        this.errors.count++
        _err(cage)
      }
    })
  }

  killer_sudoku() {
    this.extras.cages.forEach((cage) => {
      const bins = this._binAnswers(cage.indexes)
      Object.entries(bins).forEach(([answer, indexes]) => {
        if (indexes.length > 1) {
          this.errors.reasons.push(
            `There are ${indexes.length} ${answer}s in a killer cage.`,
          )
          this.errors.count++
          _err(cage)
        }
      })
    })
  }

  anti_9_queen() {
    const indexes = this.answers
      .map((a, i) => (a === 9 ? i : undefined))
      .filter((i) => i !== undefined)
    this._validateAntiChess('queen', indexes)
  }

  unique_diagonals() {
    const lines = this.board.extras.lines.filter((l) => l.type === 'diagonal')
    lines.forEach((line) => {
      const bins = this._binAnswers(line.cells.map((p) => p.index))
      Object.entries(bins).forEach(([answer, indexes]) => {
        if (!isNaN(answer) && indexes.length > 1) {
          this.errors.reasons.push(
            `There are ${indexes.length} ${answer}s on a diagonal.`,
          )
          this.errors.count++
          indexes.forEach((i) => this.errors.indexes.push(i))
        }
      })
    })
  }

  validateConsecutive(indexes, reason) {
    const answers = indexes
      .map((i) => this.answers[i])
      .filter((a) => !isNaN(a))
      .sort()
    let last = answers[0]
    answers.slice(1).find((next) => {
      if (Math.abs(last - next) !== 1) {
        this.addError(indexes, reason)
        return true
      }
      last = next
    })
  }

  validateUnique(indexes, reason) {
    const answers_used = {}
    indexes.forEach((index) => {
      const answer = this.answers[index]
      if (!isNaN(answer) && answers_used[answer] !== undefined) {
        this.addError([index, answers_used[answer]], reason)
      }
      answers_used[answer] = index
    })
  }

  addError(indexes, reason) {
    this.errors.count++
    this.errors.indexes = this.errors.indexes.concat(indexes)
    this.errors.reasons.push(reason)
  }

  consecutive_regions() {
    this.getRegionIndexes().forEach((indexes) => {
      this.validateConsecutive(
        indexes,
        'Regions can only contain consecutive digits',
      )
    })
  }

  unique_regions() {
    this.getRegionIndexes().forEach((indexes) => {
      this.validateUnique(indexes, 'Regions cannot repeat digits')
    })
  }

  getRegionIndexes() {
    if (this.board.extras.cages.length > 0) {
      return this.board.extras.cages.map((cage) =>
        cage.cells.map((cell) => cell.index),
      )
    }
    const ends = this.board.extras.underlays.filter((u) => u.is_end)
    const checked = {}
    ends
      .map((end) => {
        if (checked[end.index]) {
          return
        }
        let last = end
        let i = 0
        const indexes = []
        while (i < this.geo.AREA) {
          indexes.push(last.index)
          checked[last.index] = true
          const next = last.next_to.find((u) => !checked[u.index])
          if (!next) {
            break
          }
          last = next
          i++
        }
        return indexes
      })
      .filter(Boolean)
  }

  increasing_or_decreasing() {
    const ends = this.board.extras.underlays.filter((u) => u.is_end)
    const checked = {}
    ends.forEach((end) => {
      if (checked[end.index]) {
        return
      }
      let last = end
      let i = 0
      const indexes = []
      while (i < this.geo.AREA) {
        indexes.push(last.index)
        checked[last.index] = true
        const next = last.next_to.find((u) => !checked[u.index])
        if (!next) {
          break
        }
        last = next
        i++
      }
      const answers = indexes
        .map((i) => this.answers[i])
        .filter((a) => !isNaN(a))
      if (answers.length < 2) {
        return
      }
      last = answers[0]
      const signs = answers.slice(1).map((answer) => {
        const sign = Math.sign(answer - last)
        last = answer
        return sign
      })
      if (Math.abs(sum(signs)) !== signs.length) {
        this.errors.indexes = this.errors.indexes.concat(indexes)
        this.errors.count += 1
        this.errors.reasons.push(
          'Not all numbers in a region are increasing or decreasing',
        )
      }
    })
  }

  other() {}
}
