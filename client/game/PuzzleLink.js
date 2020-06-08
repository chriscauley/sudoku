import React from 'react'
import { Link } from 'react-router-dom'
import auth from '@unrest/react-auth'
import css from '@unrest/css'

import { saved_games } from './Board'

const allowed_constraints = ['anti_knight', 'anti_queen', 'anti_king', 'sudoku', 'thermo', 'sandwich']

const groups = {
  sudoku: ['row', 'col', 'box', 'complete'],
  killer: ['killer_sudoku', 'killer_total'],
}

const group_keys = Object.keys(groups)

const Constraints = ({ constraints }) => {
  const counts = {}
  constraints = constraints.filter((c) => {
    if (allowed_constraints.includes(c)) {
      return true
    }
    const group = group_keys.find((key) => groups[key].includes(c)) || 'other'
    counts[group] = (counts[group] || 0) + 1
    return false
  })
  group_keys.forEach((key) => {
    if (counts[key] >= groups[key].length) {
      constraints.unshift(key)
    }
  })
  return (
    <>
      {constraints.map((c) => (
        <span className={`constraint constraint-${c} mr-2`} key={c} />
      ))}
      {counts.other > 0 && (
        <span className="other_constraint">+{counts.other}</span>
      )}
    </>
  )
}

const PuzzleLink = (props) => {
  const { external_id, videos, id, Tag = Link, constraints } = props
  const { solves = [], is_superuser } = props.auth.user || {}
  const solved = solves.find((s) => s.puzzle_id === id)

  const title = videos.length ? videos[0].title : '???'
  const local_solve = saved_games.keys.includes(external_id)
  const icon = (s) => css.icon(s + ' text-xl mr-2')
  return (
    <div className="mb-2">
      <Constraints constraints={constraints} />
      {solved ? (
        <i
          className={icon('check text-green-500')}
          title={`solved ${solved}`}
        />
      ) : (
        local_solve && <span className={icon('warning text-yellow-500')} />
      )}
      <Tag to={`/puzzle/ctc/${external_id}/`} className={css.link()}>
        {title} #{external_id}
      </Tag>
      {videos.map((video) => (
        <a
          key={video.external_id}
          href={`https://www.youtube.com/watch?v=${video.external_id}`}
          title={video.title}
          target="_blank"
          rel="noreferrer"
          className={icon('youtube mx-2')}
        />
      ))}
      <a
        href={`https://cracking-the-cryptic.web.app/sudoku/${external_id}`}
        target="_blank"
        rel="noreferrer"
        className={icon('external-link')}
      />
      {is_superuser && (
        <a href={`/admin/puzzle/puzzle/${id}`} className={icon('admin')} />
      )}
    </div>
  )
}

export default auth.connect(PuzzleLink)
