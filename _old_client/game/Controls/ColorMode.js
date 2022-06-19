import React from 'react'

import ActionButton from './ActionButton'
import { _withGame } from '../withGame'

export default _withGame(function ColorMode(props) {
  const { color_mode } = props.game.board
  const set = (color_mode) => () => props.game.actions.saveBoard({ color_mode })
  const layers = ['colour', 'parity']
  return (
    <div className="action-group" data-title="Color Layer">
      {layers.map((layer) => (
        <ActionButton
          active={color_mode === layer}
          onClick={set(layer)}
          name={layer}
          key={layer}
        />
      ))}
    </div>
  )
})
