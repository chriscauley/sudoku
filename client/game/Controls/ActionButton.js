import React from 'react'

import { _withGame } from '../withGame'
import css from './css'

export default _withGame((props) => {
  return (
    <div className={css.btn()} onClick={props.game.actions[props.name]}>
      {props.name}
    </div>
  )
})
