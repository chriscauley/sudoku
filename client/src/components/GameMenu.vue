<template>
  <div v-if="visible" :class="$css.nav.section()">
    {{ puzzle.videos[0]?.title }}
    <i
      v-for="video in puzzle.videos"
      :key="video.id"
      @click="show_video=video"
      class="fa fa-youtube-play _trigger"
      title="Description from youtube video"
    />
    <unrest-modal v-if="show_video" @close="show_video=null">
      <video-description :video="show_video" />
    </unrest-modal>
    <i class="fa fa-puzzle-piece _trigger" @click="show_snapshot=true" />
    <unrest-modal v-if="show_snapshot" @close="show_snapshot=false">
      <puzzle-snapshot :puzzle="puzzle" />
    </unrest-modal>
  </div>
</template>

<script>
import PuzzleSnapshot from './PuzzleSnapshot'
import VideoDescription from './VideoDescription'

export default {
  components: { PuzzleSnapshot, VideoDescription },
  data() {
    return { show_video: null, show_snapshot: false }
  },
  computed: {
    puzzle() {
      console.log(this.$store.play.puzzle)
      return this.$store.play.puzzle
    },
    visible() {
      const { puzzle_id } = this.$route.params
      return puzzle_id && this.puzzle?.external_id === puzzle_id
    },
  },
}
</script>