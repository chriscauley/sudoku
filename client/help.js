import React from 'react'
import css from '@unrest/css'

const _parity = (name) => (
  <div>
    {`Mark ${name} `}(
    <a className={css.link()} href="#/help/parity/">
      see parity
    </a>
    )
  </div>
)

const rows = [
  ['0-9', 'Set selected cells to the number'],
  ['ctrl + 0-9', 'Pencil mark centre'],
  ['shift + 0-9', 'Pencil mark corner'],
  ['ctrl + shift + 0-9', 'Set color'],
  ['ctrl + z', 'Undo last move'],
  ['ctrl + y', 'Redo last move'],
  ['delete', 'Clear selected'],
  ['o or q', _parity('odd')],
  ['e or w', _parity('even')],
  ['arrows', 'Move cursor around puzzle'],
  ['ctrl + arrows', 'Select multiple cells'],
  ['click', 'Select square'],
  ['ctrl + click', 'Add/remove cells from selection'],
]

function KeyTable() {
  return (
    <table className="table table-striped">
      <tbody>
        {rows.map((r) => (
          <tr key={r[0]} className={r[2]}>
            <td>{r[0]}</td>
            <td>{r[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Hoverdown() {
  return (
    <div className="hoverdown fixed">
      <i className={css.icon('question-circle')} />
      <div className="hoverdown--target">
        <ul className="browser-default">
          <li>
            <a className={css.link()} href="#/help/">
              How to play
            </a>
          </li>
          <li>
            <a className={css.link()} href="#/about/ctc-differences/">
              Differences from CTC
            </a>
          </li>
          <li>
            <a className={css.link()} href="#/about/">
              About
            </a>
          </li>
        </ul>
        <KeyTable />
      </div>
    </div>
  )
}

const beaker = <i className={css.icon('beaker')} />

function View() {
  return (
    <div className="Help">
      <section>
        <h2>How to play</h2>
        <div>
          <p>
            The goal of sudoku is to fill in the grid with each row, column, and
            box having the numbers 1-9. Many maps have additional game rules,
            which can be viewed in the video description or spoken aloud in the
            video (click the "i" icon in the menu for details and a link to the
            video). If the additional rules are programmed into the game, they
            will appear as icons on the home page and as options in the checker.
            If there's a {beaker} icon or "other" listed in the checker, that
            means the game has additional rules that cannot be checked by the
            program.
          </p>
          <p>
            It's recommended that you watch the Cracking the Cryptic video while
            solving the puzzles (until you "get good") as these puzzles are
            generally quite hard. But the general strategy is to pencil mark the
            corners (shift + 1-9) and center (ctrl + 1-9) and mark the color of
            the cells (ctrl + shift + 1-9) with notes of where numbers can be.
          </p>
        </div>
      </section>
      <section>
        <h2>Parity</h2>
        Parity refers to whether a cell is even (2468) or odd (13579) and on
        many puzzles it's useful to track the parity of a cell. In "parity mode"
        cells are automatically highlighted based off the question, answer, or
        center pencil mark(s). When you press q, w, e, or o the center pencil
        mark of the square(s) is set to 2468 or 13579 accordingly and switch the
        display to parity mode.
      </section>
      <section>
        <h2>Color mode</h2>
        The game defaults to colour mode, where the background of a cell can be
        set. If you select "parity" cells will be automatically colored based
        off whether they are even (2468) or odd (13579). Setting the colour or
        parity of a cell will switch the game mode.
      </section>
      <section>
        <h2>Keys</h2>
        <KeyTable />
      </section>
    </div>
  )
}

export default {
  Hoverdown,
  View,
}
