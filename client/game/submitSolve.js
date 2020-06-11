import { post } from '@unrest/core'
import auth from '@unrest/react-auth'

export default ({ answer, puzzle, constraints }) => {
  return post('/api/schema/SolveForm/', {
    answer,
    puzzle,
    constraints,
  }).then(() => auth.connect.markStale())
}

export const submitPuzzle = (id, data) => {
  return post(`/api/schema/PuzzleDataForm/${id}/`, data)
}
