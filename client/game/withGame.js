import React from 'react'
import { debounce } from 'lodash'
import ConfigHook from '@unrest/react-config-hook'
import RestHook from '@unrest/react-rest-hook'

import Board from './Board'

const withPuzzle = RestHook(
  '/api/puzzle/${match.params.source}/${match.params.slug}/',
)

const schema = {}

const uiSchema = {}

const actions = {
  load: debounce((store, slug, props) => {
    if (slug && store.state.slug !== slug) {
      const { ctc } = props.api.puzzle.data
      store.setState({ slug })
      store.actions.startGame({ slug, ctc }, props)
    }
  }),
  startGame: (store, { ctc, slug }) => {
    store.setState({ board: new Board({ ctc, slug }) })
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
  check(store, options) {
    const constraints = []
    Object.entries(options).forEach(([key, value]) => {
      if (value) {
        constraints.push(key)
      }
    })
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
