import React from 'react'
import { Link } from 'react-router-dom'
import auth from '@unrest/react-auth'
import css from '@unrest/css'

import { saved_games } from './Board'

const icon_constraints = [
  'anti_knight',
  'anti_queen',
  'anti_king',
  'sudoku',
  'thermo',
  'sandwich',
  'arrow_sudoku',
]

const groups = {
  sudoku: ['row', 'col', 'box', 'complete'],
  killer: ['killer_sudoku', 'killer_total'],
}

const group_keys = Object.keys(groups)

export default ({ constraints }) => {
  const counts = {}
  constraints = constraints.filter((c) => {
    if (icon_constraints.includes(c)) {
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
