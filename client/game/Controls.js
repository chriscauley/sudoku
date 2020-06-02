import React from 'react'
import css from '@unrest/css'

import { _withGame } from './withGame'

const btn = (active) => css.button[active ? 'dark' : 'light']('mr-2 block')
const row = 'flex mb-1 flex-wrap'
const noop = () => {}

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

class BaseCheckControl extends React.Component {
  state = {}
  getState = () => {
    return {
      ...this.props.game.board.required_constraints,
      ...this.state,
    }
  }
  _onChange = (slug) => () => this.setState({ [slug]: !this.getState()[slug] })
  getConstraints = (state) =>
    this.props.game.board.constraints.map((slug) => ({
      checked: !!state[slug],
      onChange: this._onChange(slug),
      slug,
      title: slug.replace(/_/g, ' '),
    }))

  check = () => this.props.game.actions.check(this.getState())
  clear = () => this.props.game.actions.check()

  render() {
    const state = this.getState()
    return (
      <div className={'hoverdown'}>
        <div className={btn()} onClick={this.check}>
          check
        </div>
        <div className="hoverdown--target">
          {this.getConstraints(state).map((c) => (
            <label className={'w-full ' + btn(c.checked)} key={c.slug}>
              <input
                type="checkbox"
                onChange={c.onChange}
                checked={c.checked}
                className="mr-2"
              />
              {c.title}
            </label>
          ))}
          <hr />
          <div className={'w-full ' + btn()} onClick={this.clear}>
            clear
          </div>
        </div>
      </div>
    )
  }
}

const CheckControl = _withGame(BaseCheckControl)

const ActionButton = _withGame((props) => {
  return (
    <div className={btn()} onClick={props.game.actions[props.name]}>
      {props.name}
    </div>
  )
})

const Reset = _withGame((props) => {
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
          <Reset />
          <CheckControl />
          <ActionButton name="redo" />
          <ActionButton name="replay" />
          <ActionButton name="undo" />
        </div>
        <div className={row}>
          {modes.map((m) => (
            <div className={btn(mode === m)} key={m} onClick={onClick(m)}>
              {m}
            </div>
          ))}
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
