<template>
  <div class="action-group" aria-label="Color Layer">
    <div
      v-for="layer in ['color', 'parity']"
      :key="layer"
      :class="$css.abtn($store.ui.state.color_mode === layer)"
    >
      @click="$store.ui.save({ color_mode })" />
    </div>
  </div>
</template>
