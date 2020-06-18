import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'
import config from '../config'

export default function Nav() {
  return (
    <header className={css.nav.outer()}>
      <section className={css.nav.section()}>
        <Link to="/" className={css.nav.brand()}>
          Sudoku
        </Link>
      </section>
      <section className={css.nav.section('flex items-center')}>
        <config.Hoverdown />
        <a
          className={css.icon('github mx-2 text-blue-500')}
          href="https://github.com/chriscauley/sudoku/"
        />
      </section>
    </header>
  )
}
