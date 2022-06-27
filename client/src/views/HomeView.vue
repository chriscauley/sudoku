<template>
  <div class="app-view">
    Home!
    <div v-for="(page, i) in pages" :key="i">
      <div v-if="page?.items">
        <puzzle-link v-for="puzzle in page.items" :key="puzzle.id" :puzzle="puzzle" />
      </div>
      <div v-else>
        Loading...
      </div>
    </div>
    <div class="btn -primary" @click="page_no++">
      <i class="fa fa-plus" />
      Load more
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
      const { getPage } = this.$store.puzzle
      return range(1, page_no + 1).map((page) => getPage({ query: { page, per_page: 50 } }))
    },
  },
}
</script>
