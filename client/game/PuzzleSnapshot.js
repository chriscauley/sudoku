import React from 'react'
import css from '@unrest/css'

export default function PuzzleSnapshot(props) {
  const { puzzle } = props
  if (!puzzle.screenshot) {
    return <iframe src={puzzle.external_url} />
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
        <i className={css.icon('external_url')} />
      </a>
    </>
  )
}
