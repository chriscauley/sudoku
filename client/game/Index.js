import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'
import RestHook from '@unrest/react-rest-hook'

const withPuzzles = RestHook('/api/puzzle/')

const PuzzleLink = (props) => {
  const { external_id, video_id, title } = props
  return (
    <div className="mb-2">
      {external_id ? (
        <Link to={`/puzzle/ctc/${external_id}/`} className={css.link()}>
          {title} #{external_id}
        </Link>
      ) : (
        <span>{title} (no puzzle)</span>
      )}
      <a
        href={`https://www.youtube.com/watch?v=${video_id}`}
        className={css.icon('youtube mx-2')}
      />
    </div>
  )
}

const Index = (props) => {
  const { puzzles = [] } = props.api
  return (
    <div>
      <h2>Select a map</h2>
      <ul>
        <li>
          <Link to={'/new/'}>New</Link>
        </li>
        {puzzles.map((puzzle) => (
          <li key={puzzle.id}>
            <PuzzleLink {...puzzle} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default withPuzzles(Index)
