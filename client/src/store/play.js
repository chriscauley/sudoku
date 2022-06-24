import { reactive } from 'vue'
import { LocalStorage } from '@unrest/vue-storage'

import Board from '@/game/Board'

export default ({ store }) => {
  const _state = reactive({})
  const storage = LocalStorage('LOCAL_PLAYS')
  const update = () => store.ui.save({ hash: Math.random() })

  const save = (data) => {
    storage.save(data)
    update()
  }

  return {
    get board() {
      return _state.__board
    },
    get puzzle() {
      return _state.__puzzle
    },
    startGame: (puzzle) => {
      _state.__puzzle = puzzle
      return storage.fetchOne(puzzle.external_id).then((play) => {
        const options = {
          ...puzzle.data,
          id: puzzle.external_id,
          saved_game: play,
          save,
          update,
        }
        _state.__board = new Board(options)
        return _state.board
      })
    },
    unmount: () => {
      _state.__board = null
      _state.__puzzle = null
    },
  }
}
