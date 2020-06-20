import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'

import GameMenu from '../game/Menu'
import { _withGame } from '../game/withGame'
import config from '../config'
import help from '../help'

function Nav(props) {
  const { board } = props.game
  //const title = videos.length ? videos[0].title : '???'

  return (
    <header className={css.nav.outer()}>
      <section className={css.nav.section('left')}>
        <Link to="/" className={css.nav.brand()}>
          {board ? <i className={css.icon('arrow-left')} /> : 'Sudoku'}
        </Link>
        {board && <span className="puzzle-title">{board.title}</span>}
      </section>
      <section className={css.nav.section('flex items-center')}>
        {board && <GameMenu puzzle={board.puzzle} />}
        <config.Hoverdown />
        <help.Hoverdown />
        <a
          className={css.icon('github mx-2 text-blue-500')}
          href="https://github.com/chriscauley/sudoku/"
        />
      </section>
    </header>
  )
}

export default _withGame(Nav)
