import { inRange } from 'lodash'
import React from 'react'
import { Link } from 'react-router-dom'
import css from '@unrest/css'
import RestHook from '@unrest/react-rest-hook'

const withPuzzleAdmin = RestHook('/api/admin/puzzle/')
const assert = (bool, error) => {
  !bool && console.error(error)
}

const PuzzleRow = ({ puzzle }) => {
  return (
    <tr>
      <td>
        <Link
          to={`/puzzle/${puzzle.source}/${puzzle.external_id}/`}
          className={css.link()}
        >
          {puzzle.id}
        </Link>
      </td>
      <td>{puzzle.publish_date}</td>
      <td>{puzzle.data.ctc.arrows.length}</td>
      <td>{puzzle.flag}</td>
      <td>{puzzle.arrow_types}</td>
    </tr>
  )
}

const analyzeArrows = (items) => {
  items.forEach((item) => {
    const head_lengths = new Set()
    item.arrow_types = []
    item.data.ctc.arrows.forEach((a) => {
      assert(
        inRange(a.headLength, 0, 0.3001),
        `Puzzle has arrow headlength outside of 0-0.3 ${a.headLength}`,
      )
      assert(
        a.wayPoints.length === 0 || a.wayPoints.length === 2,
        `Arrow has ${a.wayPoints.length} waypoints ${item.external_id}`,
      )
      a.xys = []
      a.remainders = []
      a.wayPoints.forEach((wp) => {
        const coords = wp.slice().reverse()
        a.xys.push(coords.map((c) => Math.floor(c)))
        a.remainders.push(coords.map((c) => c - Math.floor(c)))
      })
      head_lengths.add(a.headLength)
    })
    assert(head_lengths.size < 2, 'Puzzle has headlengths of different sizes')
  })
}

class AdminTable extends React.Component {
  state = {
    per_page: 10,
    current_page: 1,
  }
  paginate() {
    let { puzzles } = this.props.api
    const page = {
      current: this.state.current_page,
      from: this.state.per_page * (this.state.current_page - 1),
      to: this.state.per_page * this.state.current_page,
    }
    if (this.state.arrows) {
      puzzles = puzzles.filter((p) => p.data.ctc.arrows.length)
    }
    page.items = puzzles.slice(page.from, page.to)
    page.total = page.items.length
    return page
  }
  render() {
    if (!this.props.api.puzzles) {
      return null
    }
    const CB = ({ name }) => (
      <input
        type="checkbox"
        checked={this.state[name]}
        className="mr-2"
        onChange={() => this.setState({ [name]: !this.state[name] })}
      />
    )
    const page = this.paginate()
    analyzeArrows(this.props.api.puzzles)
    return (
      <div>
        <table className="table">
          <thead>
            <tr>
              <th>id</th>
              <th>publish_date</th>
              <th>
                <CB name="arrows" />
                arrows
              </th>
              <th>flag</th>
              <th>arrow_types</th>
            </tr>
          </thead>
          <tbody>
            {page.items.map((puzzle) => (
              <PuzzleRow puzzle={puzzle} key={puzzle.id} />
            ))}
          </tbody>
        </table>
        <div>
          showing {page.from} - {page.to} out of {page.total}
        </div>
      </div>
    )
  }
}

export default withPuzzleAdmin(AdminTable)
