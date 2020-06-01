import React from 'react'
import { Link } from 'react-router-dom'
import RestHook from '@unrest/react-rest-hook'

const withPuzzles = RestHook('/api/puzzle/')

const Index = (props) => {
  const {puzzles=[]} = props.api
  return (
    <div>
      <h2>Select a map</h2>
      <ul>
        <li>
          <Link to={'/new/'}>New</Link>
        </li>
        {puzzles.map((puzzle) => (
          <li key={puzzle.id}>
            <Link to={`/ctc/${puzzle.external_id}`}>
              {puzzle.title} ({puzzle.external_id})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default withPuzzles(Index)
