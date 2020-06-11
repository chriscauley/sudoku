import React from 'react'
import { withRouter } from 'react-router-dom'
import css from '@unrest/css'

import withGame from './withGame'
import SchemaForm from './SchemaForm'

function PuzzleAdminForm(props) {
  const { flag, puzzle_id } = props.game.board
  return (
    <div className="PuzzleAdminForm">
      <SchemaForm
        form_name={`PuzzleAdminForm/${puzzle_id}`}
        autosubmit={true}
        customButton={true}
        initial={{ flag }}
      />
      <a href={`/admin/puzzle/puzzle/${puzzle_id}`} className={css.link()} />
    </div>
  )
}

export default withRouter(withGame(PuzzleAdminForm))
