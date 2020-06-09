import { range, sum, inRange } from 'lodash'

const _err = (cage, test = () => true) => {
  cage.cells.filter(test).forEach((cell) => (cell.className += ' error'))
}

const _slice = (array, indexes) => indexes.map((i) => array[i])

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
    constraints.forEach((constraint) => {
      if (typeof this[constraint] !== 'function') {
        throw 'Cannot find checker function ' + constraint
      }
      this[constraint]()
    })
  }

  row = () => this.geo.i_rows.forEach((i) => this._checkSudoku('row', i))
  col = () => this.geo.i_cols.forEach((i) => this._checkSudoku('col', i))
  box = () => this.geo.i_boxes.forEach((i) => this._checkSudoku('box', i))

  anti_knight = () => this._validateAntiChess('knight')
  anti_king = () => this._validateAntiChess('king')
  anti_queen = () => this._validateAntiChess('queen')

  consecutive_pairs() {
    this.board.extras.marks.forEach((mark) => {
      const { index, orientation } = mark
      const index2 = index - (orientation === 'h-split' ? 1 : this.geo.W)
      const diff = Math.abs(this.answers[index] - this.answers[index2])
      if (!isNaN(diff) && diff !== 1) {
        this.addError(
          [index, index2],
          'Cells separated by bars must be consecutive pairs',
        )
      }
    })
  }

  thermo() {
    const reason =
      'All numbers in thermometer should get larger from bulb to tip'
    this.board.extras.thermometers.forEach((thermometer) => {
      Object.entries(thermometer).forEach(([index, lessers]) => {
        lessers.forEach((lesser_index) => {
          if (this.answers[index] <= this.answers[lesser_index]) {
            this.addError([index, lesser_index], reason)
          }
        })
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
    const ends = this.board.extras.marks.filter((u) => u.is_end)
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
    const ends = this.board.extras.marks.filter((u) => u.is_end)
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

  // TODO highly sudoku specific
  validateMagicSquare(indexes) {
    const index_sets = [
      ['row', range(3).map((i) => indexes.slice(i * 3, (i + 1) * 3))],
      [
        'column',
        range(3).map((i) => [indexes[i], indexes[i + 3], indexes[i + 6]]),
      ],
      [
        'diagonal',
        [
          _slice(indexes, [0, 4, 8]), //diagonal down
          _slice(indexes, [2, 4, 6]), //diagonal up
        ],
      ],
    ]
    index_sets.forEach(([name, index_set]) => {
      index_set.forEach((indexes) => {
        const total = sum(indexes.map((i) => this.answers[i]))
        if (!isNaN(total) && total !== 15) {
          this.addError(
            indexes,
            `A ${name} in the magic square does not sum to 15`,
          )
        }
      })
    })
  }

  // TODO highly sudoku specific
  magic_square() {
    let indexes = this.board.extras.marks.map((u) => u.index).sort()
    if (indexes.length === 25) {
      // this is a 5x5 magic square, cut it down
      indexes = _slice(indexes, [0, 2, 4, 10, 12, 14, 20, 22, 24])
    }
    this.validateMagicSquare(indexes)
    this.validateUnique(indexes, 'Magic square cannot contain repeat numbers')
  }

  hasAnswer = (index) => !isNaN(this.answers[index])

  between_sudoku() {
    const marked_indexes = this.board.extras.marks.map((u) => u.index).sort()

    // TODO the first part of this is figuring out which which regions to check and should be cached on board
    marked_indexes.filter(this.hasAnswer).forEach((index) => {
      const slices = [
        'index2row',
        'index2col',
        'index2updiagonal',
        'index2downdiagonal',
      ]
      slices.forEach((name) => {
        let indexes = this.geo[name](index)
        indexes = indexes.slice(indexes.indexOf(index) + 1)
        const index2 = indexes.find((i) => marked_indexes.includes(i))
        if (index2 === undefined || !this.hasAnswer(index2)) {
          return
        }
        indexes = indexes.slice(0, indexes.indexOf(index2))

        // now we can actually check for one number between
        const a1 = this.answers[index]
        const a2 = this.answers[index2]
        const answers = indexes.map((i) => this.answers[i])
        if (answers.find((a) => isNaN(a)) !== undefined) {
          return
        }
        const matched_index = indexes.find((index) =>
          inRange(this.answers[index], a1, a2),
        )
        if (matched_index === undefined) {
          this.addError(
            [index, index2, ...indexes],
            'At least one number between the marked cells must be between their values.',
          )
        }
      })
    })
  }

  other() {}
  arrow_sudoku() {}
  sandwich() {}
}
