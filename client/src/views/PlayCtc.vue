<template>
  <div>
    Woo!
  </div>
</template>

<script>
import { getClient } from '@unrest/vue-storage'

const client = getClient()

export default {
  __route: {
    path: '/puzzle/ctc/:puzzle_id/',
  },
  mounted() {
    const url = `puzzle/ctc/${this.$route.params.puzzle_id}/`
    client.get(url).then(({ puzzle }) => this.$store.play.startGame(puzzle))
  },
}
</script>