import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'
import RestHook from '@unrest/react-rest-hook'
import auth from '@unrest/react-auth'

import { saved_games } from './Board'

const withPuzzles = RestHook('/api/puzzle/')

const PuzzleLink = (props) => {
  const { external_id, video_id, solved, videos } = props
  const first_video = videos[0] || {}
  const local_solve = saved_games.keys.includes(external_id)
  const icon = (s) => css.icon(s + ' text-xl mr-2')
  return (
    <div className="mb-2">
      {solved ? (
        <i
          className={icon('check text-green-500')}
          title={`solved ${solved}`}
        />
      ) : (
        local_solve && <span className={icon('warning text-yellow-500')} />
      )}
      {external_id ? (
        <Link to={`/puzzle/ctc/${external_id}/`} className={css.link()}>
          {first_video.title} #{external_id}
        </Link>
      ) : (
        <span>{first_video.title} (no puzzle)</span>
      )}
      <a
        href={`https://www.youtube.com/watch?v=${video_id}`}
        className={css.icon('youtube mx-2')}
      />
    </div>
  )
}

const Index = auth.connect((props) => {
  const { puzzles = [] } = props.api
  const solve_map = {}
  if (props.auth.user) {
    props.auth.user.solves.forEach((s) => (solve_map[s.puzzle_id] = s.created))
  }
  return (
    <div>
      <h2>Select a map</h2>
      <ul>
        <li>
          <Link to={'/new/'}>New</Link>
        </li>
        {puzzles.map((puzzle) => (
          <li key={puzzle.id}>
            <PuzzleLink {...puzzle} solved={solve_map[puzzle.id]} />
          </li>
        ))}
      </ul>
    </div>
  )
})

export default withPuzzles(Index)
