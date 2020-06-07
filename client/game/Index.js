import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'
import RestHook from '@unrest/react-rest-hook'
import auth from '@unrest/react-auth'

import PuzzleLink from './PuzzleLink'
import { saved_games } from './Board'

const withPuzzles = RestHook('/api/puzzle/')

const Index = auth.connect((props) => {
  const { puzzles = [] } = props.api
  const { user = {} } = props.auth
  return (
    <div>
      <h2>Select a map</h2>
      <ul>
        <li>
          <Link to={'/new/'}>New</Link>
        </li>
        {puzzles.map((puzzle) => (
          <li key={puzzle.id}>
            <PuzzleLink
              {...puzzle}
            />
          </li>
        ))}
      </ul>
    </div>
  )
})

export default withPuzzles(Index)
