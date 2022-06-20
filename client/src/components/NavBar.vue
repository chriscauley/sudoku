<template>
  <div :class="css.nav.outer()">
    <div :class="css.nav.section()">
      <router-link to="/" :class="css.nav.brand()">
        <i v-if="$route.params.puzzle_id" :class="$css.icon('arrow-left')" />
        <template v-else>
          Numbers.wtf
        </template>
      </router-link>
      <div v-if="$route.params.puzzle_id">
        {{ $store.board?.title }}
      </div>
    </div>
    <div class="flex-grow" />
    <div :class="css.nav.section('-right')">
      <config-menu />
      <help-menu />
      <a :class="css.icon('github link _trigger')" :href="repo" />
      <unrest-auth-menu />
    </div>
  </div>
</template>

<script>
import css from '@unrest/css'

import ConfigMenu from './ConfigMenu'
import HelpMenu from './HelpMenu'

export default {
  components: { ConfigMenu, HelpMenu },
  data() {
    return { css, repo: "https://github.com/chriscauley/sudoku/" }
  },
}
</script>
