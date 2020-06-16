import React from 'react'
import { Link } from 'react-router-dom'
import auth from '@unrest/react-auth'
import css from '@unrest/css'

import ConstraintBox from './ConstraintBox'
import { saved_games } from './Board'

const PuzzleLink = (props) => {
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
  const { solves = [] } = props.auth.user || {}
  const solved = solves.find((s) => s.puzzle_id === id)

  const title = videos.length ? videos[0].title : '???'
  const _local_solve = saved_games.keys.includes(external_id)
  const icon = (s) => css.icon(s + ' text-xl mr-2')
  return (
    <div className="mb-2">
      <ConstraintBox
        constraints={constraints}
        meta={meta}
        flag_icon={flag_icon}
      />
      {solved && (
        <i
          className={icon('check text-green-500')}
          title={`solved ${solved}`}
        />
      )}
      <Tag to={`/puzzle/ctc/${external_id}/`} className={css.link()}>
        {title} #{external_id}
      </Tag>
      {children}
    </div>
  )
}

export default auth.connect(PuzzleLink)
