import React from 'react'
import { Link } from 'react-router-dom'

const Index = () => {
  const maps = {
    j62Rm8qq9j: 'Simple',
    H9Jr7gQHtm: 'A Sudoku of Sublime Genius',
  }
  return (
    <div>
      <h2>Select a map</h2>
      <ul>
        {Object.entries(maps).map(([slug, name]) => (
          <li key={slug}>
            <Link to={`/ctc/${slug}`}>
              {name} ({slug})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Index
