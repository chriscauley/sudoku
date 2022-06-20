<template>
  <div class="Controls" @click.stop>
    <div class="flex flex-wrap pt-2">
      <div class="action-group">
        <div :class="[$css.abtn, 'action']">{time}</div>
        <reset-button />
        <check-button />
        <submit-button />
      </div>
      <div class="action-group">
        <div :class="$btn.abtn()" @click="game.undo">undo</div>
        <div :class="$btn.abtn()" @click="game.redo">redo</div>
        <div :class="$btn.abtn()" @click="game.redo">replay</div>
      </div>
    </div>
    <div class="flex flex-wrap">
      <div class="action-group" data-title="Mouse Layer">
        <div
          v-for="mode in $c.modes"
          :key="mode"
          :class="$abtn.abtn($store.ui.getMode()===mode)"
          @click="$store.ui.save({ mode })"
        >
          {{ mode }}
        </div>
      </div>
      <color-mode />
    </div>
    <div class={'flex flex-wrap'}>
      <div
        v-for="key in $c.keyboard.numbers"
        :key="key"
        :data-key="key"
        :class="$css.button.dark('mr-1 mb-1 text-lg mode-' + $store.ui.getMode())"
        @click="$todo('sendKey(key)')"
      />
      </div>
    </div>
  </div>
</template>

<script>
import CheckButton from './CheckButton.vue'
import ColorMode from './ColorMode.vue'
import ResetButton from './ResetButton.vue'
import SubmitButton from './SubmitButton.vue'

export default {
  name: "GameControls",
  components: { CheckButton, ColorMode, ResetButton, SubmitButton },
}
</script>
