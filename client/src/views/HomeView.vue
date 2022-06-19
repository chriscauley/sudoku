<template>
  <div>
    Home!
    <div v-for="(page, i) in pages" :key="i">
      <div v-if="page?.items">
        <puzzle-link v-for="puzzle in page.items" :key="puzzle.id" :puzzle="puzzle" />
      </div>
      <div v-else>
        Loading...
      </div>
    </div>
  </div>
</template>

<script>
import { range } from 'lodash'

import PuzzleLink from '@/components/PuzzleLink.vue'

export default {
  __route: {
    path: '/',
    title: 'Home',
  },
  components: { PuzzleLink },
  data() {
    return { page_no: 1 }
  },
  computed: {
    pages() {
      const { page_no } = this
      return range(page_no, page_no + 1).map((page) =>
        this.$store.puzzle.getPage({ query: { page } }),
      )
    },
  },
}
</script>
