import React from 'react'
import auth from '@unrest/react-auth'

import { _withGame } from '../withGame'
import ActionButton from './ActionButton'

function Submit({ game, auth }) {
  const { solves = [], is_staff } = auth.user || {}
  if (
    !is_staff ||
    !game.board.solve ||
    solves.find((s) => s.puzzle_id === game.board.puzzle_id)
  ) {
    return null
  }
  return <ActionButton name="submitSolve" />
}

export default auth.connect(_withGame(Submit))
