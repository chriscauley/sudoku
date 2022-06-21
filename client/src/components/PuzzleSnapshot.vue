<template>
  <div v-if="puzzle.screenshot" class="puzzle-snapshot" :style="style">
    <div>Screenshot of original puzzle from {{ puzzle.source_name }}:</div>
    <img :src="puzzle.screenshot" />
    <a
      class="link block"
      :href="puzzle.external_url"
      target="_blank"
      rel="noreferrer"
    >
      Go to original puzzle
      <i :class="$css.icon('external-link ml-2')" />
    </a>
  </div>
  <iframe v-else :src="url" :style="style" />
</template>

<script>
export default {
  props: {
    puzzle: Object
  },
  computed: {
    url() {
      return `https://app.crackingthecryptic.com/sudoku/${this.puzzle.external_id}`
    },
    style() {
      return "width: 600px; min-height: 400px;"
    },
  },
}
</script>
