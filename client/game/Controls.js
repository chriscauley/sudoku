import React from 'react'
import css from '@unrest/css'
import auth from '@unrest/react-auth'

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

const CheckControl = _withGame((props) => {
  const { actions, board } = props.game
  const { constraints } = board
  const check = () => actions.check(constraints)
  const clear = () => actions.check()

  const options = board.available_constraints.map((slug) => ({
    checked: constraints.includes(slug),
    onChange: () => actions.toggleConstraint(slug),
    slug,
    title: slug.replace(/_/g, ' '),
  }))

  return (
    <div className={'hoverdown'}>
      <div className={btn()} onClick={check}>
        check
      </div>
      <div className="hoverdown--target">
        {options.map((c) => (
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
        <div className={'w-full ' + btn()} onClick={clear}>
          clear
        </div>
      </div>
    </div>
  )
})

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
    return <ActionButton name="submit" />
  }),
)

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
