<template>
  <div @click="resetting=true" :class="css.abtn()">
    reset
    <unrest-modal v-if="resetting" @close="resetting=false">
      Are you sure you want to restart the game?
      <template #extra_actions>
        <div :class="$css.button.danger()" @click="$store.game.confirmReset">Reset</div>
      </template>
    </unrest-modal>
  </div>
</template>

<script>
export default {
  data() {
   return { resetting: false }
  }
}
</script>
