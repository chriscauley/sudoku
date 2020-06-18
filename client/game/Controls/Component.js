import React from 'react'

import keyboard from '../keyboard'
import { _withGame } from '../withGame'

import css from './css'
import getMode from './getMode'
import ActionButton from './ActionButton'
import Check from './Check'
import Reset from './Reset'
import Submit from './Submit'

const noop = () => {}

const ColorMode = _withGame((props) => {
  const { color_mode } = props.game.board
  const set = (color_mode) => () => props.game.actions.saveBoard({ color_mode })
  return (
    <div className="hoverdown flush">
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

export default class Controls extends React.Component {
  state = {}
  constructor(props) {
    super(props)
    this.listeners = ['keydown', 'keyup']
    this.listeners.forEach((s) => document.addEventListener(s, this.keyupdown))
  }

  componentWillUnmount() {
    this.listeners.forEach((s) =>
      document.removeEventListener(s, this.keyupdown),
    )
  }

  keyupdown = ({ shiftKey, ctrlKey }) => this.setState({ shiftKey, ctrlKey })
  render() {
    const { onClick = noop, sendKey = noop } = this.props
    const mode = getMode(this.state, this.props.mode)
    const modes = ['answer', 'corner', 'centre', 'colour']
    return (
      <div className="Controls" onClick={(e) => e.stopPropagation()}>
        <div className={css.row + ' pt-2'}>
          <ActionButton name="undo" />
          <ActionButton name="redo" />
          <ActionButton name="replay" />
          <Reset />
          <Check />
          <Submit />
        </div>
        <div className={css.row}>
          {modes.map((m) => (
            <div className={css.btn(mode === m)} key={m} onClick={onClick(m)}>
              {m}
            </div>
          ))}
          <ColorMode />
        </div>
        <div className={css.row}>
          {keyboard.numbers.map((key) => (
            <div
              className={css.button.dark('mr-2 mode-' + mode)}
              data-key={key}
              key={key}
              onClick={() => sendKey(key, mode)}
            />
          ))}
        </div>
      </div>
    )
  }
}
