import React from 'react'
import { get } from 'lodash'
import ConfigHook from '@unrest/react-config-hook'

import fetchCTC from './fetchCTC'
import Board from './Board'

const schema = {}

const uiSchema = {}

const actions = {
  loadCTC: (store, slug) => {
    if (slug && store.state.slug !== slug) {
      store.setState({ slug })
      fetchCTC(slug).then((ctc) => store.actions.startGame({ ctc, slug }))
    }
  },
  load: (store, slug) => {
    if (slug && store.state.slug !== slug) {
      store.setState({ slug })
      store.actions.startGame({ slug })
    }
  },
  startGame: (store, { ctc, slug }) => {
    store.setState({
      board: new Board({ ctc, slug }),
    })
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
  check(store) {
    store.state.board.check()
    store.setState({ rando: Math.random() })
  },
  undo(store) {
    store.state.board.undo()
    store.setState({ rando: Math.random() })
  },
  replay(store) {
    store.state.board.replay(() => store.setState({ rando: Math.random() }))
  },
}

const _withGame = ConfigHook('game', {
  schema,
  uiSchema,
  actions,
  propName: 'game',
})

export default (Component) => {
  return _withGame(
    (props) => {
      const ctc_slug = get(props, 'match.params.ctc_slug')
      const { slug } = props
      props.game.actions.loadCTC(ctc_slug)
      props.game.actions.load(slug)
      if (!props.game.board) {
        return null
      }
      return <Component {...props} />
    },
    { propName: 'game' },
  )
}
