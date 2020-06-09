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
    flag,
    children,
    meta,
  } = props
  const { solves = [], is_superuser } = props.auth.user || {}
  const solved = solves.find((s) => s.puzzle_id === id)

  const title = videos.length ? videos[0].title : '???'
  const local_solve = saved_games.keys.includes(external_id)
  const icon = (s) => css.icon(s + ' text-xl mr-2')
  return (
    <div className="mb-2">
      <span className={'fa flag flag-' + flag} />
      <ConstraintBox constraints={constraints} meta={meta} flag={flag} />
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
      {children}
    </div>
  )
}

export default auth.connect(PuzzleLink)
