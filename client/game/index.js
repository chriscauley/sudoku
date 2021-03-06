import classnames from 'classnames'
import { debounce } from 'lodash'
import React from 'react'
import { postForm } from '@unrest/core'
import auth from '@unrest/react-auth'

import keyboard from './keyboard'
import Index from './Index'
import withGame from './withGame'
import Controls, { getMode } from './Controls'
import PuzzleAdminForm from './PuzzleAdminForm'

const clickRef = React.createRef()
const gameRef = React.createRef()
const animationRef = React.createRef()
const noRightClick = (e) => {
  e.preventDefault()
  return false
}

const dark_colors = [8, 0]

const getClassName = ({
  xy,
  hover,
  selected,
  selectedNeighbors,
  answer,
  error,
  colour,
}) =>
  classnames(`cell x-${xy[0]} y-${xy[1]}`, selectedNeighbors, {
    selected,
    hover,
    answer: answer !== undefined,
    error,
    darkbg: dark_colors.includes(colour),
  })

// this can be GameComponent now (or whatever)
class CTC extends React.Component {
  state = {
    answer: {},
    selected: {},
    cellSize: 24,
    boardStyle: { opacity: 0 },
  }
  componentDidMount = () => this.resize()

  resize = debounce(() => {
    const { current } = gameRef
    if (current) {
      const { offsetHeight, offsetWidth } = current
      const cellSize = Math.min(offsetWidth, offsetHeight) / 11
      const boardStyle = { height: cellSize * 9, width: cellSize * 9 }
      this.setState({ cellSize, boardStyle })
    }
  }, 100)

  constructor(props) {
    super(props)
    this.listeners = ['keydown', 'mousedown', 'mouseup', 'paste']
    this.listeners.forEach((s) => document.addEventListener(s, this[s]))
    window.addEventListener('resize', this.resize)
  }

  componentWillUnmount() {
    this.props.game.actions.unmount()
    this.listeners.forEach((s) => document.removeEventListener(s, this[s]))
    window.removeEventListener('resize', this.resize)
  }

  paste = (e) => {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i]
      if (!item.type.includes('image')) {
        console.warn('Discarding non-image paste data')
        continue
      }
      const screenshot = item.getAsFile()
      return postForm(
        `/api/schema/PuzzleDataForm/${this.props.api.puzzle.id}/`,
        { screenshot },
      )
    }
  }
  mouseup = () => this.setState({ dragging: false, removing: false })
  setParity(value) {
    const indexes = Object.keys(this.state.selected)
    this.props.game.actions.doAction({ value, mode: 'parity', indexes })
  }
  keydown = (e) => {
    const value = keyboard.key_map[e.key] || e.key
    if (keyboard.allowed_keys.includes(value)) {
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
    if (value === 'q' || value === 'o') {
      this.setParity('odd')
      return
    }
    if (value === 'w' || value === 'e') {
      this.setParity('even')
      return
    }
    const mode = getMode(e, this.state.mode)
    if (keyboard.arrows.includes(value)) {
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
    } else if (!keyboard.allowed_keys.includes(value)) {
      return
    }
    this.props.game.actions.doAction({ mode, indexes, value })
  }
  onMouseMove = (e) => this._move([e.clientX, e.clientY])

  mousedown = (e) => {
    if (e.button === 2) {
      // right mouse button
      return
    }
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
    const { hover, selected, cursor, cellSize, boardStyle } = this.state
    const { board } = this.props.game
    const { user = {} } = this.props.auth
    this.geo = board.geo
    board.geo.element = clickRef.current
    board.animation_canvas = animationRef.current
    const cells = board.toCells(selected)
    if (cells[cursor]) {
      cells[cursor].extras.push({ className: 'cursor' })
    }
    if (cells[hover]) {
      cells[hover].extras.push({ className: 'hover' })
    }
    return (
      <div className={'Game theme-ctc'} onContextMenu={noRightClick}>
        <div className="my4 flex justify-between items-center">
          {user.is_superuser && <PuzzleAdminForm />}
        </div>
        <div className="play-area">
          <div className="flex-cell">
            <Controls
              onClick={this.setMode}
              mode={this.state.mode}
              sendKey={this.sendKey}
              time={board.getTime()}
            />
          </div>
          <div className="flex-cell flex-grow">
            <div
              className="game-area"
              ref={gameRef}
              style={{ fontSize: cellSize, padding: cellSize }}
            >
              <div className="board" style={boardStyle}>
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
                  <canvas ref={animationRef} className="animation_canvas" />
                  {cells.map((cell) => (
                    <div key={cell.index} className={getClassName(cell)}>
                      {cell.question === undefined &&
                        cell.answer === undefined && (
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
      </div>
    )
  }
}

const connectAuth = (Component) => (props) => {
  return <Component auth={auth} {...props} />
}

export default {
  Index,
  CTC: connectAuth(withGame(CTC)),
}
