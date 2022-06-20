<template>
  <div v-if="visible" :class="$css.nav.section()">
    {{ puzzle.videos[0]?.title }}
    <i v-for="video in puzzle.videos" :key="video.id" @click="show_video=video" class="fa fa-youtube-play _trigger" />
    <unrest-modal v-if="show_video" @close="show_video=null">
      <video-description :video="show_video" />
    </unrest-modal>
  </div>
</template>

<script>
import VideoDescription from './VideoDescription'

export default {
  components: { VideoDescription },
  data() {
    return { show_video: null }
  },
  computed: {
    puzzle() {
      return this.$store.play.puzzle
    },
    visible() {
      const { puzzle_id } = this.$route.params
      return puzzle_id && this.puzzle?.external_id === puzzle_id
    },
  },
}
</script>