<template>
  <router-link :to="`/puzzle/ctc/${puzzle.external_id}/`" class="puzzle-link">
    <b v-if="show_flag">[{{ puzzle.flag.toUpperCase() }}]</b>
    <i v-if="puzzle.solved" class="fa fa-check -solved" :solved="solved" />
    <i v-else-if="puzzle.local_solve" class="icon -torphy" title="You have solved this puzzle" />
    <constraint-box :constraints="puzzle.constraints" :meta="puzzle.meta" />
    <span class="link">{{ title }}</span>
  </router-link>
</template>

<script>
import ConstraintBox from './ConstraintBox.vue'

export default {
  components: { ConstraintBox },
  props: {
    puzzle: Object,
  },
  computed: {
    title() {
      return this.puzzle.videos[0]?.title || '???'
    },
    show_flag() {
      return this.$auth.user?.is_superuser && this.puzzle.flag !== 'valid'
    },
  },
}
</script>
