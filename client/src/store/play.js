import { reactive } from 'vue'
import { LocalStorage, getClient } from '@unrest/vue-storage'
import auth from '@unrest/vue-auth'

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
      return _state.board
    },
    get puzzle() {
      return _state.puzzle
    },
    startGame: (puzzle) => {
      _state.puzzle = puzzle
      return storage.fetchOne(puzzle.external_id).then((play) => {
        const options = {
          ...puzzle.data,
          id: puzzle.external_id,
          saved_game: play,
          save,
          update,
        }
        _state.board = new Board(options)
        return _state.board
      })
    },
    unmount: () => {
      _state.board = null
      _state.puzzle = null
    },
    submitSolve: () => {
      const { board } = _state
      const answer = board.geo.indexes.map((i) => parseInt(board.answer[i] || board.sudoku[i]))
      const { constraints } = board
      const puzzle_id = _state.puzzle.id
      const client = getClient()
      const data = { constraints, puzzle: puzzle_id, answer }
      const url = 'schema/solve/'
      client.post(url, data).then(auth.refetch)
    },
  }
}
