import React from 'react'
import css from '@unrest/css'

import withGame from './withGame'

const btn = (active) => css.button[active ? 'dark' : 'light']('mr-2')

export const getMode = ({ ctrlKey, shiftKey }, _default = 'answer') => {
  if (ctrlKey && shiftKey) {
    return 'colour'
  } else if (ctrlKey) {
    return 'centre'
  } else if (shiftKey) {
    return 'corner'
  }
  return _default
}

const ActionButton = withGame((props) => {
  return (
    <div className={btn()} onClick={props.game.actions[props.name]}>
      {props.name}
    </div>
  )
})

const row = 'flex mb-4 flex-wrap'
const noop = () => {}

const Reset = withGame((props) => {
  return props.game.resetting ? (
    <div
      className={css.button.danger('mr-2')}
      onClick={props.game.actions.confirmReset}
    >
      confirm?
    </div>
  ) : (
    <div className={btn()} onClick={props.game.actions.reset}>
      reset
    </div>
  )
})

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
        <div className={row}>
          {modes.map((m) => (
            <div className={btn(mode === m)} key={m} onClick={onClick(m)}>
              {m}
            </div>
          ))}
          <Reset />
          <ActionButton name="check" />
          <ActionButton name="undo" />
          <ActionButton name="replay" />
        </div>
        <div className={row}>
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
