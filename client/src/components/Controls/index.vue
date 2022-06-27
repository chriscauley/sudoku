<template>
  <div class="controls" @click.stop>
    <div class="control-row">
      <div class="btn-group control-group">
        <div :class="$css.abtn()">
          {{ time }}
        </div>
        <reset-button />
        <check-button />
        <submit-button />
      </div>
      <div class="btn-group control-group">
        <div :class="$css.abtn()" @click="$store.play.board.undo">undo</div>
        <div :class="$css.abtn()" @click="$store.play.board.redo">redo</div>
        <div :class="$css.abtn()" @click="$store.play.board.replay">replay</div>
      </div>
    </div>
    <div class="control-row">
      <div class="btn-group control-group" data-title="Mouse Layer">
        <div
          v-for="mode in $c.modes"
          :key="mode"
          :class="$css.abtn($store.ui.getMode() === mode)"
          @click="$store.ui.save({ mode })"
        >
          {{ mode }}
        </div>
      </div>
      <color-mode />
    </div>
    <div class="control-row">
      <div
        v-for="key in $c.keyboard.numbers"
        :key="key"
        :data-key="key"
        :class="$css.button.dark('mr-1 mb-1 text-lg mode-' + $store.ui.getMode())"
        @click="sendKey(key)"
      />
    </div>
  </div>
</template>

<script>
import CheckButton from './CheckButton.vue'
import ColorMode from './ColorMode.vue'
import ResetButton from './ResetButton.vue'
import SubmitButton from './SubmitButton.vue'

export default {
  name: 'GameControls',
  components: { CheckButton, ColorMode, ResetButton, SubmitButton },
  data() {
    const interval = setInterval(() => {
      this.time = this.$store.play.board.getTime()
    }, 100)
    return { time: null, interval }
  },
  unmounted() {
    clearInterval(this.interval)
  },
  methods: {
    sendKey(value) {
      const { selected } = this.$store.ui.state
      const indexes = Object.keys(selected)
      let mode = this.$store.ui.getMode()
      if (value === 'Delete' || value === 'Backspace') {
        mode = 'delete'
      } else if (!this.$c.keyboard.allowed_keys.includes(value)) {
        return
      }
      this.$store.play.board.doAction({ mode, indexes, value })
    },
  },
}
</script>
