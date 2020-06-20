import React from 'react'
import { debounce } from 'lodash'
import ConfigHook from '@unrest/react-config-hook'

import { withPuzzle } from './api'
import submitSolve, { submitPuzzle } from './submitSolve'
import Board from './Board'

const schema = {}

const uiSchema = {}

const actions = {
  load: debounce((store, slug, props) => {
    if (slug && store.state.slug !== slug) {
      const { flag, data, videos = [] } = props.api.puzzle
      const puzzle_id = props.api.puzzle.id
      const options = {
        puzzle_id,
        slug,
        flag,
        ...data,
        puzzle: props.api.puzzle,
      }
      if (videos.length > 0) {
        options.title = videos[0].title
      }
      store.setState({ slug })
      store.actions.startGame(options, props)
    }
  }),
  startGame: (store, options) => {
    store.setState({ board: new Board(options) })
  },
  doAction: (store, action) => {
    store.state.board.doAction(action)
    store.setState({ rando: Math.random() })
  },
  reset(store) {
    store.setState({
      resetting: true,
      timeout: setTimeout(() => store.setState({ resetting: false }), 5000),
    })
  },
  confirmReset(store) {
    clearTimeout(store.state.timeout)
    store.state.board.reset()
    store.setState({ board: store.state.board, resetting: false })
  },
  check(store, constraints) {
    store.state.board.check(constraints)
    store.setState({ rando: Math.random() })
  },
  undo(store) {
    store.state.board.undo()
    store.setState({ rando: Math.random() })
  },
  redo(store) {
    store.state.board.redo()
    store.setState({ rando: Math.random() })
  },
  replay(store) {
    store.state.board.replay(() => store.setState({ rando: Math.random() }))
  },
  submitSolve(store) {
    const { board } = store.state
    const answer = board.geo.indexes.map((i) =>
      parseInt(board.answer[i] || board.sudoku[i]),
    )
    const { constraints, puzzle_id } = board
    submitSolve({ constraints, puzzle: puzzle_id, answer }).then(() =>
      store.setState({ rando: Math.random() }),
    )
  },
  toggleConstraint(store, slug) {
    const { board } = store.state
    if (board.constraints.includes(slug)) {
      board.constraints = board.constraints.filter((c) => c !== slug)
    } else {
      board.constraints.push(slug)
    }
    board.save()
    store.setState({ rando: Math.random() })
  },
  savePuzzle(store, data) {
    submitPuzzle(store.state.board.puzzle_id, data).then(() => {
      Object.assign(store.state.board, data)
      store.state.board.save()
      store.setState({ rando: Math.random() })
    })
  },
  saveBoard(store, data = {}) {
    Object.assign(store.state.board, data)
    store.state.board.save()
    store.setState({ rando: Math.random() })
  },
}

export const _withGame = ConfigHook('game', {
  schema,
  uiSchema,
  actions,
  propName: 'game',
})

export default (Component) => {
  return withPuzzle(
    _withGame((props) => {
      const { loading, puzzle } = props.api
      if (loading || !puzzle) {
        return null
      }
      const { slug } = props.match.params
      props.game.actions.load(slug, props)
      if (!props.game.board) {
        return null
      }
      return <Component {...props} />
    }),
  )
}
