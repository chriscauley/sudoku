import React from 'react'
import css from '@unrest/css'
import auth from '@unrest/react-auth'

import _getMode from './getMode'
import { _withGame } from '../withGame'
import btn from './btn'
import Check from './Check'
import Reset from './Reset'

export const getMode = _getMode
const row = 'flex mb-1 flex-wrap'
const noop = () => {}

const ActionButton = _withGame((props) => {
  return (
    <div className={btn()} onClick={props.game.actions[props.name]}>
      {props.name}
    </div>
  )
})

const SubmitButton = auth.connect(
  _withGame(({ game, auth }) => {
    const { solves = [] } = auth.user || {}
    if (
      !game.board.solve ||
      solves.find((s) => s.puzzle_id === game.board.puzzle_id)
    ) {
      return null
    }
    return <ActionButton name="submitSolve" />
  }),
)

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
          <Check />
          <ActionButton name="redo" />
          <ActionButton name="replay" />
          <ActionButton name="undo" />
          <SubmitButton />
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
