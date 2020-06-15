import React from 'react'
import { Link } from 'react-router-dom'
import { withPuzzles } from './api'
import auth from '@unrest/react-auth'

import PuzzleLink from './PuzzleLink'

const Index = (props) => {
  const { puzzles = [] } = props.api
  const { user = {} } = props.auth
  const _filter = (puzzle) => user.is_staff || puzzle.flag === 'valid'
  return (
    <>
      <h2>Select a map</h2>
      <ul>
        <li>
          <Link to={'/new/'}>New</Link>
        </li>
        {puzzles.filter(_filter).map((puzzle) => (
          <li key={puzzle.id}>
            {puzzle.flag !== 'valid' && <b className="float-left mr-2">[{puzzle.flag.toUpperCase()}] </b>}
            <PuzzleLink {...puzzle} />
          </li>
        ))}
      </ul>
    </>
  )
}

export default auth.connect(withPuzzles(Index))
