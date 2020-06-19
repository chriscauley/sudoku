import React from 'react'

import { _withGame } from '../withGame'
import css from './css'

export default _withGame(function ColorMode(props) {
  const { color_mode } = props.game.board
  const set = (color_mode) => () => props.game.actions.saveBoard({ color_mode })
  return (
    <div className="hoverdown flush tight">
      <div className={css.btn(color_mode === 'parity')} onClick={set('parity')}>
        parity
      </div>
      <div className="hoverdown--target">
        <div
          className={css.btn(color_mode !== 'parity')}
          onClick={set('colour')}
        >
          colour
        </div>
      </div>
    </div>
  )
})
