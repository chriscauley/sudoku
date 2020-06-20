import React from 'react'

import { _withGame } from '../withGame'
import css from './css'

export default _withGame(({ name, game, active, onClick }) => (
  <div
    className={css.btn(active) + ' action'}
    onClick={onClick || game.actions[name]}
  >
    {name}
  </div>
))
