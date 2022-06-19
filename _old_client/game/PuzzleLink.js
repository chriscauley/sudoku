import React from 'react'
import { Link } from 'react-router-dom'
import auth from '@unrest/react-auth'
import css from '@unrest/css'

import ConstraintBox from './ConstraintBox'
import { saved_games } from './Board'

export default function PuzzleLink(props) {
  const {
    external_id,
    videos,
    id,
    Tag = Link,
    constraints,
    flag_icon,
    children,
    meta,
  } = props
  const solves = auth.use().user?.solves || []
  const solved = solves.find((s) => s.puzzle_id === id)

  const title = videos.length ? videos[0].title : '???'
  const local_solve = saved_games.keys.includes(external_id)
  const icon = (s) => css.icon(s + ' mr-2')
  return (
    <div className="mb-2 icons">
      {solved && (
        <i className={icon('check solved-icon')} title={`solved ${solved}`} />
      )}
      {!solved && local_solve && (
        <span
          className={icon('trophy solved-icon')}
          title="You have solved this puzzle"
        />
      )}
      <ConstraintBox
        constraints={constraints}
        meta={meta}
        flag_icon={flag_icon}
      />
      <Tag to={`/puzzle/ctc/${external_id}/`} className={css.link()}>
        {title}
      </Tag>
      {children}
    </div>
  )
}

