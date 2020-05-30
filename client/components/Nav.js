import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'

export default function Nav() {
  return (
    <header className={css.nav.outer()}>
      <section className={css.nav.section()}>
        <Link to="/" className={css.nav.brand()}>
          Sudoku
        </Link>
      </section>
      <section className={css.nav.section('flex items-center')}>
        <a
          className="text-blue-500 fa fa-github text-3xl"
          href="https://github.com/chriscauley/sudoku/"
        />
      </section>
    </header>
  )
}
