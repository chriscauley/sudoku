import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'
import { ConfigLink } from '../config'

export default function Nav() {
  return (
    <header className={css.nav.outer()}>
      <section className={css.nav.section()}>
        <Link to="/" className={css.nav.brand()}>
          Sudoku
        </Link>
      </section>
      <section
        className={css.nav.section('flex items-center text-3xl text-blue-500')}
      >
        <ConfigLink />
        <a
          className={css.icon('github mx-2')}
          href="https://github.com/chriscauley/sudoku/"
        />
      </section>
    </header>
  )
}
