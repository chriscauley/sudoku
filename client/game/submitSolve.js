import { post } from '@unrest/core'
import { connect } from '@unrest/react-auth'

export default ({ answer, puzzle, constraints }) => {
  return post('/api/schema/SolveForm/', {
    answer,
    puzzle,
    constraints,
  }).then(() => connect.markStale())
}
