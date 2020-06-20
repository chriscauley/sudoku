import React from 'react'
import css from '@unrest/css'

import { _withGame } from './withGame'
import Hoverdown from './Hoverdown'
import PuzzleSnapshot from './PuzzleSnapshot'
import VideoDescription from './VideoDescription'

function GameMenu({ puzzle }) {
  return (
    <>
      {puzzle.videos.map((video) => (
        <Hoverdown
          key={video.external_id}
          className="fixed md right inline-block"
          loaded={true}
          content={<VideoDescription video={video} />}
        >
          <i className={css.icon('info')} />
        </Hoverdown>
      ))}
      <Hoverdown
        className="fixed lg inline-block"
        content={<PuzzleSnapshot puzzle={puzzle} />}
      >
        <i
          className={css.icon(puzzle.screenshot ? 'picture-o' : 'puzzle-piece')}
        />
      </Hoverdown>
    </>
  )
}

export default GameMenu
