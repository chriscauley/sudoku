import React from 'react'

import keyboard from '../keyboard'
import { _withGame } from '../withGame'

import css from './css'
import getMode from './getMode'
import ActionButton from './ActionButton'
import Check from './Check'
import Reset from './Reset'
import Submit from './Submit'
import ColorMode from './ColorMode'

const noop = () => {}

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
        <div className={'flex flex-wrap pt-2'}>
          <div className="action-group">
            <ActionButton name="undo" />
            <ActionButton name="redo" />
            <ActionButton name="replay" />
          </div>
          <div className="action-group">
            <Reset />
            <Check />
            <Submit />
          </div>
        </div>
        <div className={'flex flex-wrap'}>
          <div className="action-group" data-title="Mouse Layer">
            {modes.map((m) => (
              <ActionButton
                key={m}
                name={m}
                active={mode === m}
                onClick={onClick(m)}
              />
            ))}
          </div>
          <ColorMode />
        </div>
        <div className={'flex flex-wrap'}>
          {keyboard.numbers.map((key) => (
            <div
              className={css.button.dark('mr-1 mb-1 text-lg mode-' + mode)}
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
