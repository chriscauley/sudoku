import React from 'react'
import auth from '@unrest/react-auth'
import { range } from 'lodash'

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
  const highlight = board.is_full && !board.solve ? ' highlight-check' : ' '
  const available = user.is_staff
    ? board.available_constraints
    : board.required_constraints

  const options = available.map((slug) => ({
    checked: constraints.includes(slug),
    onChange: () => actions.toggleConstraint(slug),
    required: required_constraints.includes(slug),
    slug,
    title: slug.replace(/_/g, ' '),
  }))

  const per_column = 8
  const columns = range(Math.ceil(options.length / per_column)).map((i) =>
    options.slice(i * per_column, (i + 1) * per_column),
  )

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
      <div className={css.btn() + highlight} onClick={check}>
        check
      </div>
      <div className="hoverdown--target -ml-14">
        <div className="flex w-full">
          {columns.map((column, i) => (
            <div className="flex-grow" key={i}>
              {column.map((c) => (
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
            </div>
          ))}
        </div>
        <div className="border-double border-t-4 border-gray-600 flex flex-wrap">
          <div className={'flex-grow ' + css.btn()} onClick={reset}>
            Select All {user.is_staff && 'Required'}
          </div>
          <div className={'flex-grow ' + css.btn()} onClick={clear}>
            Select None
          </div>
          {user.is_staff && (
            <div
              className={'flex-grow mr-0 ' + css.btn()}
              onClick={() => saveConstraints()}
            >
              Save Constraints {_diff}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default auth.connect(_withGame(CheckControl))
