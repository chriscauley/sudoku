<template>
  <div v-if="show" :class="$css.abtn()" @click="$store.play.submitSolve">
    submit
  </div>
</template>

<script>
export default {
  computed: {
    show() {
      // only staff can submit solutions if board has a solve and user hasn't submitted a solve
      const { board } = this.$store.play
      const puzzle_id = this.$store.play.puzzle.id
      const { is_staff } = this.$auth.user
      const user_solved = this.$auth.user.solves?.find((s) => s.puzzle_id === puzzle_id)
      return is_staff && board.user_solve && !user_solved
    },
  },
}
</script>
