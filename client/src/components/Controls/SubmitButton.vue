<template>
  <div v-if="show" :class="$css.abtn()" @click="$todo('submitSolve')">
    Submit
  </div>
</template>

<script>
export default {
  computed: {
    show() {
      const { is_staff } = this.$auth.user
      const is_solved = this.$store.game.board.solve
      // TODO solves.find((s) => s.puzzle_id === game.board.puzzle_id)
      const current_solve = true
      return is_staff && !is_solved && current_solve
    }
  }
}
</script>