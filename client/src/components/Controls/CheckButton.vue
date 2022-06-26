<template>
  <div
    :class="[$css.abtn(), highlight, 'hoverdown left flush game-controls__check-button']"
    @click="check"
  >
    check
    <div class="hoverdown--target" @click.stop>
      <div class="flex w-full">
        <div v-for="(column, i) in columns" :key="i" class="flex-grow">
          <label v-for="c in column" :key="c.slug" :class="$css.abtn(c.checked)">
            <input type="checkbox" @change="c.onChange" :checked="c.checked" />
            {{ c.required ? '* ' : '' }}
            {{ c.title }}
          </label>
        </div>
      </div>
      <div class="border-double border-t-4 border-gray-600 flex flex-wrap">
        <div :class="$css.abtn()" @click="reset">Select All {{ is_staff ? 'Required' : '' }}</div>
        <div :class="$css.abtn()" @click="clear">
          Select None
        </div>
        <div v-if="is_staff" :class="$css.abtn()" @click="saveConstraints">
          <span>Save Constraints</span>
          <span>{{ diff }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { range } from 'lodash'
import { getClient } from '@unrest/vue-storage'

export default {
  computed: {
    diff() {
      const { required_constraints, constraints } = this.$store.play.board
      const _add = constraints.filter((c) => !required_constraints.includes(c)).length
      const _remove = required_constraints.filter((c) => !constraints.includes(c)).length
      return `(+${_add} / -${_remove})`
    },
    columns() {
      const per_column = 8
      return range(Math.ceil(this.options.length / per_column)).map((i) =>
        this.options.slice(i * per_column, (i + 1) * per_column),
      )
    },
    is_staff() {
      return this.$auth.user?.is_staff
    },
    options() {
      const { board } = this.$store.play
      const { constraints, required_constraints } = board
      const available = this.is_staff ? board.available_constraints : board.required_constraints
      return available.map((slug) => ({
        checked: constraints.includes(slug),
        onChange: () => this.$store.play.board.toggleConstraint(slug),
        required: required_constraints.includes(slug),
        slug,
        title: slug.replace(/_/g, ' '),
      }))
    },
    highlight() {
      const b = this.$store.play.board
      const { user_solve } = this.$store.play.board
      const first_empty = b.geo.indexes.find((i) => !b.sudoku[i] && !b.answer[i])
      const no_empty = first_empty === undefined
      return !user_solve && no_empty ? 'highlight-check' : ''
    },
  },
  methods: {
    check() {
      this.$store.play.board.check()
    },
    clear() {
      const { board } = this.$store.play
      board.constraints = []
      board.save()
    },
    saveConstraints() {
      const { board, puzzle } = this.$store.play
      const { constraints } = board
      const data = { required_constraints: constraints }
      const url = `schema/puzzle-data/${puzzle.id}/`
      getClient()
        .post(url, data)
        .then(() => this.$ui.toast.success('Puzzle saved'))
    },
    reset() {
      const { board } = this.$store.play
      board.constraints = board.required_constraints.slice()
      board.save()
    },
  },
}
</script>
