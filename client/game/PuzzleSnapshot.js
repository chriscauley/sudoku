import React from 'react'
import css from '@unrest/css'

import url from '../url'

export default function PuzzleSnapshot(props) {
  const { puzzle } = props
  if (!puzzle.screenshot) {
    return <iframe src={url(puzzle.external_url)} />
  }
  return (
    <>
      <div>Screenshot of original puzzle from {puzzle.source_name}:</div>
      <img src={puzzle.screenshot} />
      <a
        className="link block"
        href={puzzle.external_url}
        target="_blank"
        rel="noreferrer"
      >
        Go to original puzzle
        <i className={css.icon('external-link ml-2')} />
      </a>
    </>
  )
}
