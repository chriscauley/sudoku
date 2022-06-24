import { cloneDeep } from 'lodash'

export default (board) => {
  board.extras.cages = cloneDeep(board.options.ctc.cages).map((cage) => {
    cage.indexes = []
    cage.first = { index: Infinity }
    cage.last = { index: 0 }
    cage.cells = cage.cells.map((xy) => {
      xy = xy.reverse()
      const index = board.geo.xy2index(xy)
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
      Object.entries(board.geo._text2dindex).forEach(([text, dindex]) => {
        if (!cage.indexes.includes(cell.index + dindex)) {
          cell.className += ' cage-' + text
        }
        cell._className = cell.className
      })
    })
    return cage
  })
}
