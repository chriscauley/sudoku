import { fromCTC } from '../../client/game/ctc/buildArrows'

// ignore negative zeros, they are a quirk of jest
const cases = [
  // ctc#8D346R4gjB - diagonal gutter arrows
  [[-0.5, 4.5], [0, 4]],
  [[9.5, 2.5], [9, 3]],

  // qjGQffjL6B - these caused problems because they were in the wrong cell
  [[2.8, 7],[2.8, 6]],
  [[0.8,0],[0.8,1]],
  [[4, 4.8],[3, 4.8]],
  [[3,3.8],[4,3.8]],

  // RnT7bFHJ6h - these arrows are longer than two cells
  [[7.5,8.2],[7.5,6.5]],
  [[8.2,5.5],[6.5,5.5]],
]

test('wayPointsToArrows', () => {
  cases.forEach((wayPoints) => {
    expect(fromCTC({wayPoints}).className).toMatchSnapshot()
  })
})