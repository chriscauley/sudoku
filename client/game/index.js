import classnames from 'classnames'
import React from 'react'
import { config as ur_config, afterFetch, handleError } from '@unrest/core'
import css from '@unrest/css'
import auth from '@unrest/react-auth'

import Index from './Index'
import withGame from './withGame'
import Hoverdown from './Hoverdown'
import PuzzleLink from './PuzzleLink'
import PuzzleSnapshot from './PuzzleSnapshot'
import VideoDescription from './VideoDescription'
import Controls, { getMode } from './Controls'
import PuzzleAdminForm from './PuzzleAdminForm'

const clickRef = React.createRef()

const getClassName = ({
  xy,
  hover,
  selected,
  selectedNeighbors,
  answer,
  error,
}) =>
  classnames(`cell x-${xy[0]} y-${xy[1]}`, selectedNeighbors, {
    selected,
    hover,
    answer: answer !== undefined,
    error,
  })

const KEY_MAP = {}

')!@#$%^&*('.split('').forEach((key, i) => (KEY_MAP[key] = i.toString()))
const ARROWS = ['ArrowUp', 'ArrowRight', 'ArrowLeft', 'ArrowDown']

const icon = (s, rest) => css.icon(s, 'px-2', rest)

'abcdefghijklmnopqrstuvwxyz'
  .split('')
  .forEach((key) => (KEY_MAP[key.toUpperCase()] = key))

// this can be GameComponent now (or whatever)
class CTC extends React.Component {
  state = {
    answer: {},
    selected: {},
  }
  constructor(props) {
    super(props)
    this.game_keys = '1234567890'.split('')
    this.allowed_keys = ARROWS.concat(this.game_keys)
    this.listeners = ['keydown', 'mousedown', 'mouseup', 'paste']
    this.listeners.forEach((s) => document.addEventListener(s, this[s]))
  }

  componentWillUnmount() {
    this.listeners.forEach((s) => document.removeEventListener(s, this[s]))
  }

  paste = (e) => {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i]
      if (!item.type.includes('image')) {
        console.warn('Discarding non-image paste data')
        continue
      }
      const file = item.getAsFile()
      const formData = new FormData()
      formData.append('screenshot', file)
      return fetch(`/api/schema/PuzzleDataForm/${this.props.api.puzzle.id}/`, {
        method: 'POST',
        body: formData,
        headers: { 'X-CSRFToken': ur_config.getCSRF() },
      })
        .then(afterFetch, handleError)
        .then(() => this.props.api.refetch(this.props))
    }
  }
  mouseup = () => this.setState({ dragging: false, removing: false })
  keydown = (e) => {
    const value = KEY_MAP[e.key] || e.key
    if (this.allowed_keys.includes(value)) {
      e.preventDefault()
    }
    if (value === 'z' && e.ctrlKey) {
      this.props.game.actions.undo()
      return
    }
    if (value === 'y' && e.ctrlKey) {
      this.props.game.actions.redo()
      return
    }
    const mode = getMode(e, this.state.mode)
    if (ARROWS.includes(value)) {
      return this.sendArrow(value, e.ctrlKey)
    }
    this.sendKey(value, mode)
  }

  sendArrow(value, ctrlKey) {
    if (this.state.cursor === undefined) {
      return
    }
    const direction = value.toLowerCase().replace('arrow', '')
    const cursor = this.geo.moveByText(this.state.cursor, direction)
    const selected = ctrlKey ? this.state.selected : {}
    selected[cursor] = true
    this.setState({ selected, cursor, hover: null })
  }

  sendKey = (value, mode) => {
    const { selected } = this.state
    const indexes = Object.keys(selected)
    if (value === 'Delete' || value === 'Backspace') {
      mode = 'delete'
    } else if (!this.allowed_keys.includes(value)) {
      return
    }
    this.props.game.actions.doAction({ mode, indexes, value })
  }
  onMouseMove = (e) => this._move([e.clientX, e.clientY])

  mousedown = (e) => {
    const index = this.geo.pxy2index([e.clientX, e.clientY])
    if (e.target.closest('.Controls')) {
      return
    }
    let { selected } = this.state
    let removing = selected[index]
    if (e.ctrlKey) {
      if (removing) {
        delete selected[index]
      } else {
        selected[index] = true
      }
    } else {
      selected = { [index]: true }
      removing = false
    }
    this.setState({ dragging: true, removing, selected, cursor: index })
  }

  _move = (pxy) => {
    const hover = this.geo.pxy2index(pxy)
    const { selected, dragging, removing } = this.state
    const old_selected = selected[hover]
    const old_hover = this.state.hover
    if (dragging) {
      if (removing) {
        delete selected[hover]
      } else {
        selected[hover] = true
      }
    }
    if (old_hover !== hover || old_selected !== selected[hover]) {
      this.setState({ hover, selected })
    }
  }
  setMode = (mode) => () => this.setState({ mode })

  render() {
    const { hover, selected, cursor } = this.state
    const { puzzle } = this.props.api
    const { board } = this.props.game
    const { user = {} } = this.props.auth
    this.geo = board.geo
    board.geo.element = clickRef.current
    const cells = board.toCells(selected)
    if (cells[cursor]) {
      cells[cursor].extras.push({ className: 'cursor' })
    }
    if (cells[hover]) {
      cells[hover].extras.push({ className: 'hover' })
    }
    return (
      <div className="Game theme-ctc">
        <div className="my4 flex justify-between items-center">
          <div className="mr-4">
            {board.solve && 'Victory!'} @ {board.getTime()}
          </div>
          {user.is_superuser && <PuzzleAdminForm />}
          <PuzzleLink {...puzzle} is_superuser={user.is_superuser}>
            {puzzle.videos.map((video) => (
              <Hoverdown
                key={video.external_id}
                className="fixed md right inline-block"
                loaded={true}
                content={<VideoDescription video={video} />}
              >
                <i className={icon('info')} />
              </Hoverdown>
            ))}
            <Hoverdown
              className="fixed lg inline-block"
              content={<PuzzleSnapshot puzzle={puzzle} />}
            >
              <i
                className={icon(
                  puzzle.screenshot ? 'picture-o' : 'puzzle-piece',
                )}
              />
            </Hoverdown>
          </PuzzleLink>
        </div>
        <Controls
          keys={this.game_keys}
          onClick={this.setMode}
          mode={this.state.mode}
          sendKey={this.sendKey}
        />
        <div>
          <div className="game-area">
            <div className="board">
              {board.gutters.map((g) => (
                <div className={g.className} key={g.g}>
                  {g.values.map((v, i) => (
                    <span key={i}>{v}</span>
                  ))}
                </div>
              ))}
              <div className="sudoku cage-last display-boxes display-cells">
                <div
                  className="_canvas"
                  style={{ backgroundImage: board.bg_image }}
                />
                {cells.map((cell) => (
                  <div key={cell.index} className={getClassName(cell)}>
                    {cell.question === undefined && cell.answer === undefined && (
                      <>
                        <div className="corner">{cell.corner.join('')}</div>
                        <div className="centre">{cell.centre.join('')}</div>
                      </>
                    )}
                    {cell.question !== undefined ? (
                      <span className="question number">{cell.question}</span>
                    ) : (
                      <span className="answer number">{cell.answer}</span>
                    )}
                    {cell.cage && (
                      <span
                        className={cell.cage.className}
                        data-text={cell.cage.text}
                      />
                    )}
                    {cell.extras.map((extra, i) => (
                      <span key={i} className={extra.className} />
                    ))}
                  </div>
                ))}
              </div>
              <div
                className="clickMask"
                onMouseMove={this.onMouseMove}
                ref={clickRef}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default {
  Index,
  CTC: auth.connect(withGame(CTC)),
}
