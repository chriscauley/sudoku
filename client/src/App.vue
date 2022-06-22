<template>
  <div class="app-content">
    <NavBar />
    <router-view />
    <unrest-ui />
  </div>
</template>

<script>
import NavBar from '@/components/NavBar'

export default {
  components: { NavBar },
}
</script>
