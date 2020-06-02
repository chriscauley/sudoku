import { range, flatten, invert } from 'lodash'

const mod = (a, b) => ((a % b) + b) % b

export default class Geo {
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
    this._text2dindex = {
      top: -this.W,
      bottom: this.W,
      left: -1,
      right: 1,
    }
    this._dindex2text = invert(this._text2dindex)
  }
  // these are sudoku specific
  row2indexes = (y) => this._row2indexes[y]
  col2indexes = (x) => this._col2indexes[x]
  box2indexes = (box) => this._box2indexes[box]
  moveByText = (index, text) => {
    let [x, y] = this.index2xy(index)
    if (text === 'up') {
      y--
    } else if (text === 'down') {
      y++
    } else if (text === 'right') {
      x++
    } else if (text === 'left') {
      x--
    }
    return this.xy2index([mod(x, this.W), mod(y, this.H)])
  }
}
