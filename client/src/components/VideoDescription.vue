<template>
  <div class="video-description">
    <h3 class="h3">{{ video.title }}</h3>
    <a class="video-description__link link" :href="video.url" target="_blank" rel="noreferrer">
      <i :class="$css.icon('youtube')" />
      Watch on YouTube
      <i :class="$css.icon('external-link')" />
    </a>

    <unrest-markdown :source="video.description" />
  </div>
</template>

<script>
export default {
  props: {
    video: Object,
  },
}
</script>

<style>
.video-description {
  display: block;
}
</style>
