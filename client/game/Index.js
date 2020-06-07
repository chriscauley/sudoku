import React from 'react'
import { Link } from 'react-router-dom'
import RestHook from '@unrest/react-rest-hook'

import PuzzleLink from './PuzzleLink'

const withPuzzles = RestHook('/api/puzzle/')

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
