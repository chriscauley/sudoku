import React from 'react'

import _getMode from './getMode'
export const getMode = getMode
import { _withGame } from '../withGame'
import css from './css'
import ActionButton from './ActionButton'
import Check from './Check'
import Reset from './Reset'
import Submit from './Submit'

const noop = () => {}

class Controls extends React.Component {
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
    const { keys, onClick = noop, sendKey = noop } = this.props
    const mode = getMode(this.state, this.props.mode)
    const modes = ['answer', 'corner', 'centre', 'colour']
    return (
      <div className="Controls" onClick={(e) => e.stopPropagation()}>
        <div className={css.row}>
          <Reset />
          <Check />
          <ActionButton name="redo" />
          <ActionButton name="replay" />
          <ActionButton name="undo" />
          <Submit />
        </div>
        <div className={css.row}>
          {modes.map((m) => (
            <div className={css.btn(mode === m)} key={m} onClick={onClick(m)}>
              {m}
            </div>
          ))}
        </div>
        <div className={css.row}>
          {keys.map((key) => (
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

export default Controls
