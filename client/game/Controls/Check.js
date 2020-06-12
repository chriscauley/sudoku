import React from 'react'
import auth from '@unrest/react-auth'

import { _withGame } from '../withGame'
import css from './css'

function CheckControl(props) {
  const { actions, board } = props.game
  const { user = {} } = props.auth
  const { constraints, required_constraints } = board
  const check = () => actions.check(constraints)
  const clear = () => actions.saveBoard({ constraints: [] })

  // TODO admin only
  const saveConstraints = (required_constraints = constraints) =>
    actions.savePuzzle({ required_constraints })
  const reset = () => actions.saveBoard({ constraints: required_constraints })

  const options = board.available_constraints.map((slug) => ({
    checked: constraints.includes(slug),
    onChange: () => actions.toggleConstraint(slug),
    required: required_constraints.includes(slug),
    slug,
    title: slug.replace(/_/g, ' '),
  }))

  const _add = constraints.filter((c) => !required_constraints.includes(c))
    .length
  const _remove = required_constraints.filter((c) => !constraints.includes(c))
    .length
  const _diff = (
    <span>
      (+{_add} / -{_remove})
    </span>
  )

  return (
    <div className={'hoverdown left flush'}>
      <div className={css.btn()} onClick={check}>
        check
      </div>
      <div className="hoverdown--target">
        <div className="hoverdown--two-columns">
          {options.map((c) => (
            <label className={'w-full ' + css.btn(c.checked)} key={c.slug}>
              <input
                type="checkbox"
                onChange={c.onChange}
                checked={c.checked}
                className="mr-2"
              />
              {c.required && '* '}
              {c.title}
            </label>
          ))}
          <div>
            <div className={'w-full ' + css.btn()} onClick={reset}>
              Reset to Required
            </div>
            <div className={'w-full ' + css.btn()} onClick={clear}>
              Clear All
            </div>
            {user.is_superuser && (
              <div
                className={'w-full ' + css.btn()}
                onClick={() => saveConstraints()}
              >
                Save Constraints {_diff}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default auth.connect(_withGame(CheckControl))
