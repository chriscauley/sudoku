import { reactive } from 'vue'

export default () => {
  const state = reactive({
    color_mode: 'color',
    mode: 'answer',
    selected: {},
    hash: 0,
  })
  const save = (data) => Object.assign(state, data)

  const keyUpDown = (event) => {
    const { ctrlKey, shiftKey } = event
    Object.assign(state, { ctrlKey, shiftKey })
  }
  document.addEventListener('keyup', keyUpDown)
  document.addEventListener('keydown', keyUpDown)

  return {
    state,
    save,
    watch: () => state.hash, // this is a bit of an anti-pattern
    getMode() {
      if (state.ctrlKey && state.shiftKey) {
        return 'colour'
      } else if (state.ctrlKey) {
        return 'centre'
      } else if (state.shiftKey) {
        return 'corner'
      }
      return state.mode
    },
  }
}
