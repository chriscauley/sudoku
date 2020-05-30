import React from 'react'
import ConfigHook from '@unrest/react-config-hook'

import fetchCTC from './fetchCTC'
import Board from './Board'

const schema = {}

const uiSchema = {}

let current

const actions = {
  loadCTC: (store, slug) => {
    if (current !== slug) {
      current = slug
      fetchCTC(slug).then((ctc) => store.actions.startGame({ ctc, slug }))
    }
  },
  startGame: (store, { ctc, slug }) => {
    ctc.slug = slug
    store.setState({
      board: new Board({ ctc }),
    })
  },
  doAction: (store, action) => {
    store.state.board.doAction(action)
    store.setState({ rando: Math.random() })
  },
}

const _withGame = ConfigHook('game', { schema, uiSchema, actions })

export default (Component) => {
  return _withGame(
    (props) => {
      const { slug } = props.match.params
      props.game.actions.loadCTC(slug)
      if (!props.game.board || current !== slug) {
        return null
      }
      return <Component {...props} />
    },
    { propName: 'game' },
  )
}
