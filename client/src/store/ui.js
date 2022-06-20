import { reactive } from 'vue'

export default () => {
  const state = reactive({})
  const save = (data) => Object.assign(state, data)

  const keyUpDown = (event) => {
    const { ctrlKey, shiftKey } = event
    state.save({ ctrlKey, shiftKey })
  }
  document.addEventListener('keyup', keyUpDown)
  document.addEventListener('keydown', keyUpDown)

  return {
    state,
    save,
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