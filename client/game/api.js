import RestHook from '@unrest/react-rest-hook'

const icon_constraints = [
  'anti_knight',
  'anti_queen',
  'anti_king',
  'sudoku',
  'killer',
]
const groups = {
  sudoku: ['row', 'col', 'box', 'complete'],
  killer: ['killer_sudoku', 'killer_total'],
}

const group_keys = Object.keys(groups)

const groupConstraints = (puzzle) => {
  const counts = {}
  puzzle.display_constraints = puzzle.constraints.filter((c) => {
    if (icon_constraints.includes(c)) {
      return true
    }
    const group = group_keys.find((key) => groups[key].includes(c)) || 'other'
    counts[group] = (counts[group] || 0) + 1
    return false
  })
  group_keys.forEach((key) => {
    if (counts[key] >= groups[key].length) {
      puzzle.display_constraints.unshift(key)
    }
  })
}

const prepPuzzle = (puzzle) => {
  puzzle.external_url = `https://cracking-the-cryptic.web.app/sudoku/${puzzle.external_id}`
  puzzle.videos.forEach((v) => {
    v.url = `https://www.youtube.com/watch?v=${v.external_id}`
  })
  groupConstraints(puzzle)
}

export const withPuzzles = RestHook('/api/puzzle/', {
  prepData: ({ puzzles }) => {
    puzzles.map(prepPuzzle)
  },
})

export const withPuzzle = RestHook(
  '/api/puzzle/${match.params.source}/${match.params.slug}/',
  { prepData: ({ puzzle }) => prepPuzzle(puzzle) },
)
