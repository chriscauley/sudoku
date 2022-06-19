<template>
  <router-link :to="`/puzzle/ctc/${puzzle.external_id}/`" class="puzzle-link">
    <i v-if="puzzle.solved" class="fa fa-check -solved" :solved="solved" />
    <i v-else-if="puzzle.local_solve" class="icon -torphy" title="You have solved this puzzle" />
    <constraint-box
      :constraints="puzzle.constraints"
      :meta="puzzle.meta"
      :flag_icon="puzzle.flag_icon"
    />
    {{ puzzle.title }}
  </router-link>
</template>

<script>
import ConstraintBox from './ConstraintBox.vue'

export default {
  components: { ConstraintBox },
  props: {
    puzzle: Object,
  },
}
</script>
