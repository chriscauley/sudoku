<template>
  <div class="app-view -game" v-if="$store.play.board" @contextmenu.prevent>
    <game-controls />
    <!-- <game-board /> -->
    <puzzle-admin-form />
  </div>
</template>

<script>
import { getClient } from '@unrest/vue-storage'

import PuzzleAdminForm from '@/components/PuzzleAdminForm.vue'
import GameControls from '@/components/Controls/index.vue'

const client = getClient()

export default {
  __route: {
    path: '/puzzle/ctc/:puzzle_id/',
  },
  components: { GameControls, PuzzleAdminForm },
  mounted() {
    const url = `puzzle/ctc/${this.$route.params.puzzle_id}/`
    client.get(url).then(({ puzzle }) => this.$store.play.startGame(puzzle))
  },
}
</script>
