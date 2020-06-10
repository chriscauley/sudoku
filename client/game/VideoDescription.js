import React from 'react'
import css from '@unrest/css'
import Markdown from 'react-markdown'

export default function VideoDescription({ video }) {
  return (
    <>
      <h3>{video.title}</h3>
      <a
        className="link mb-4 border-b block text-lg"
        href={video.url}
        target="_blank"
        rel="noreferrer"
      >
        <i className={css.icon('youtube mr-2 text-black')} />
        Watch on YouTube
        <i className={css.icon('external-link ml-2')} />
      </a>

      <Markdown className="whitespace-normal" linkTarget={() => '_blank'}>
        {video.description}
      </Markdown>
    </>
  )
}
