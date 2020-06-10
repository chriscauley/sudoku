import React from 'react'

const icon_constraints = [
  'anti_knight',
  'anti_queen',
  'anti_king',
  'sudoku',
  'thermo',
  'sandwich',
  'arrow_sudoku',
  'other'
]

const icon_flags = ['bad_render', 'no_rules', 'vanilla', 'new']

const groups = {
  sudoku: ['row', 'col', 'box', 'complete'],
  killer: ['killer_sudoku', 'killer_total'],
}

const slug2meta = {
  sudoku: 'givens',
  killer: 'cages',
}

const group_keys = Object.keys(groups)

export default function ConstraintBox({ constraints, meta, flag }) {
  const counts = {}
  constraints = constraints.filter((c) => {
    if (icon_constraints.includes(c)) {
      return true
    }
    const group = group_keys.find((key) => groups[key].includes(c)) || 'unknown'
    counts[group] = (counts[group] || 0) + 1
    return false
  })
  group_keys.forEach((key) => {
    if (counts[key] >= groups[key].length) {
      constraints.unshift(key)
    }
  })
  if (icon_flags.includes(flag)) {
    constraints.push(flag + ' flag')
  }
  return (
    <>
      {constraints.map((c) => (
        <span
          className={`constraint constraint-${c} mr-2`}
          data-count={meta[slug2meta[c]]}
          key={c}
        />
      ))}
      {counts.unknown > 0 && (
        <span className="other_constraint">+{counts.unknown}</span>
      )}
    </>
  )
}
