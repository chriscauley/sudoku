<template>
  <div class="btn-group control-group" aria-label="Color Layer">
    <div
      v-for="layer in ['color', 'parity']"
      :key="layer"
      :class="$css.abtn($store.ui.state.color_mode === layer)"
    >
      {{ layer }}
    </div>
  </div>
</template>
