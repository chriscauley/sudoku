<template>
  <div :class="css.nav.outer()">
    <div :class="css.nav.section()">
      <router-link to="/" :class="css.nav.brand()">
        Numbers.wtf
      </router-link>
    </div>
    <div class="flex-grow" />
    <div class="css.nav.section()">
      <unrest-auth-menu />
    </div>
  </div>
</template>

<script>
import css from '@unrest/css'

export default {
  data() {
    return { css }
  },
}
</script>
