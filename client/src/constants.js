const key_map = {} // undo shift on event.key
const letters = 'abcdefghijklmnopqrstuvwxyz'.split('')
const number_symbols = ')!@#$%^&*('.split('')

number_symbols.forEach((key, i) => (key_map[key] = i.toString()))
letters.forEach((key) => (key_map[key.toUpperCase()] = key))

const arrows = ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown']
const numbers = '1234567890'.split('')

// keys that are passed into the board
const allowed_keys = arrows.concat(numbers)

export default {
  modes: ['answer', 'corner', 'centre', 'colour'],
  layers: ['colour', 'parity'],
  dark_colors: [8, 0],
  keyboard: {
    key_map,
    arrows,
    allowed_keys,
    numbers,
  },
  install(app) {
    app.config.globalProperties.$c = this
  }
}
