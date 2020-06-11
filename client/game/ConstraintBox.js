import React from 'react'
import { template } from 'lodash'

const icon_constraints = [
  'anti_knight',
  'anti_queen',
  'anti_king',
  'sudoku',
  'thermo',
  'sandwich',
  'arrow_sudoku',
  'other',
]

const groups = {
  sudoku: ['row', 'col', 'box', 'complete'],
  killer: ['killer_sudoku', 'killer_total'],
}

const slug2meta = {
  sudoku: 'givens',
  killer: 'cages',
  thermo: 'marks',
}

const title_templates = {
  sudoku:
    '${constraints.length === 1 ? "Classic " : ""}Sudoku with ${counts} givens',
  killer: 'Killer sudoku with ${counts} cages',
  thermo: 'Thermo sudoku with ${counts} thermometer cells',
  other: 'Experimental puzzle with custom rules',
}

const getTitle = (slug, counts, constraints) =>
  template(title_templates[slug] || slug)({ slug, counts, constraints })

const group_keys = Object.keys(groups)

export default function ConstraintBox({ constraints, meta, flag_icon }) {
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
  flag_icon && constraints.push(flag_icon)
  return (
    <>
      {constraints.map((c) => (
        <span
          className={`constraint constraint-${c} mr-2`}
          data-count={meta[slug2meta[c]]}
          title={getTitle(c, meta[slug2meta[c]], constraints)}
          key={c}
        />
      ))}
      {counts.unknown > 0 && (
        <span
          title={counts.unknown + ' other constraints'}
          className="other_constraint"
        >
          {counts.unknown === 1 ? '?' : '??'}
        </span>
      )}
    </>
  )
}
