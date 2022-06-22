<template>
  <div @click="resetting = true" :class="$css.abtn()">reset</div>
  <Teleport to="body">
    <unrest-modal v-if="resetting" @close="resetting = false">
      Are you sure you want to restart the game?
      <template #extra_actions>
        <div :class="$css.button.danger()" @click="reset">Reset</div>
      </template>
    </unrest-modal>
  </Teleport>
</template>

<script>
export default {
  data() {
    return { resetting: false }
  },
  methods: {
    reset() {
      this.$store.play.board.reset()
      this.resetting = false
    },
  },
}
</script>
