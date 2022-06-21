<template>
  <div>
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
