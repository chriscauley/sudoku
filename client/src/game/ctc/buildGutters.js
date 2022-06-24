import { range } from 'lodash'

class Gutter {
  constructor(board, g) {
    this.name = board.geo.g2text(g)
    this.is_column = g % 2 === 0
    this.SIZE = board.geo[this.is_column ? 'H' : 'W']
    this.values = range(this.SIZE).map(() => undefined)
    this.class = 'gutter gutter-' + this.name
  }
  get = (index) => this.values[index]
  set = (index, value) => (this.values[index] = value)
}

// this may need to be in ctc.js
export default (marks, board) => {
  board.gutters = range(4).map((g) => new Gutter(board, g))
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
