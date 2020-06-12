import React from 'react'
import css from './css'

import { _withGame } from '../withGame'

export default _withGame(function Reset(props) {
  return props.game.resetting ? (
    <div
      className={css.button.danger('mr-2')}
      onClick={props.game.actions.confirmReset}
    >
      confirm?
    </div>
  ) : (
    <div className={css.btn()} onClick={props.game.actions.reset}>
      reset
    </div>
  )
})
