import { cloneDeep, range, pick, last, uniqBy } from 'lodash'
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

// example puzzles:
// 7Qh3tBm4mj - ceiling and floor
const buildUnderlays = (underlays, geo) => {
  underlays = underlays.map((underlay) => {
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

  const underlay_indexes = {}
  underlays.forEach((u) => (underlay_indexes[u.index] = u))
  underlays.forEach((underlay) => {
    underlay.next_to = geo
      .index2pawn(underlay.index)
      .map((i) => underlay_indexes[i])
      .filter(Boolean)
    underlay.is_end = underlay.next_to.length === 1
  })
  return underlays
}

export default class Board {
  constructor(options) {
    window.B = this
    this.options = options
    this.geo = new Geo({ W: 9 })
    this.checker = new Checker(this)
    this.reset()

    // load saved game if exists
    Object.assign(this, saved_games.get(this.slug) || {})
    this.turn = this.actions.length
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
      constraints: ['row', 'col', 'box', 'complete'],
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
    ]

    if (this.ctc) {
      const {
        arrows = [],
        underlays = [],
        cages = [],
        cells = [],
        lines = [],
      } = this.ctc
      this.sudoku = []
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

      // lines need to know where underlays are to point thermometers
      const underlain = {}
      const broken_lines = []
      this.extras.underlays.forEach((u) => (underlain[u.index] = true))

      const { W, H } = this.geo
      const processedLines = lines.map((line) => {
        const { wayPoints } = line
        const cells = wayPoints.map((wp) => {
          const xy = wp.map((i) => Math.floor(i)).reverse()
          return { xy, index: this.geo.xy2index(xy) }
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
          }
          return {
            type: 'diagonal',
            direction,
            cells: xys.map((xy) => ({
              xy,
              index: this.geo.xy2index(xy),
              className: 'line-diagonal ' + direction,
            })),
          }
        }
        return { cells, type: 'thermo' }
      })

      this.extras.lines = processedLines.map((line) => {
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
            index: this.geo.xy2index(xy),
            className: 'line-thermo',
            xy,
          }))
        }

        // sometimes lines are entered wrong or broken up in CTC
        if (!underlain[line.cells[0].index]) {
          if (underlain[last(line.cells).index]) {
            // the thermometer was input backwards in ctc puzzle
            line.cells.reverse()
          } else {
            broken_lines.push(line)
          }
        }

        line.head = line.cells[0].index
        line.tail = last(line.cells).index
        return line
      })

      const mergeLines = (trash, keep) => {
        keep.cells = keep.cells.concat(trash.cells)
        keep.tail = trash.tail
        this.extras.lines = this.extras.lines.filter((line) => line !== trash)
        keep.cells = uniqBy(keep.cells, 'index')
      }

      // fix broken lines
      broken_lines.forEach((broken) => {
        this.extras.lines.forEach((line) => {
          if (line === broken) {
            return
          }
          if (line.tail === broken.head) {
            mergeLines(broken, line)
          } else if (line.tail === broken.head) {
            broken.cells.reverse()
            ;[broken.head, broken.tail] = [broken.tail, broken.head]
            mergeLines(broken, line)
          }
        })
      })

      this.extras.lines.forEach((line) => {
        if (line.type === 'thermo') {
          let last_point
          line.cells.forEach((point) => {
            if (last_point) {
              point.className +=
                ' from from-' +
                dxy2text[vector.sign(vector.subtract(last_point.xy, point.xy))]
              last_point.className +=
                ' to to-' +
                dxy2text[vector.sign(vector.subtract(point.xy, last_point.xy))]
            }
            last_point = point
          })
        }
        line.cells.forEach((point) => (point._className = point.className))
      })
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
    this.extras.lines.forEach((line) => {
      line.cells.forEach((point) => cells[point.index].underlays.push(point))
    })
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
      this.solve = {
        ms: (this.finish || new Date().valueOf()) - this.start,
        constraints,
        answer: this.geo.indexes.map((i) =>
          parseInt(this.answer[i] || this.sudoku[i]),
        ),
      }
      this.save()
    }
  }

  clearErrors() {
    this.extras.underlays.forEach(
      (underlay) => (underlay.className = underlay._className),
    )
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
