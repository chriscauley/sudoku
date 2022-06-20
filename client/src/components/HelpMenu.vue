<template>
  <unrest-dropdown :items="items" placement="bottom">
    <i :class="$css.icon('question-circle _trigger')" />
  </unrest-dropdown>
</template>

<script>
import KeyTable from "./KeyTable.vue"

export default {
  setup() {
    return {
      items: [
        { text: "How to Play", to: "/help/" },
        { text: "Differences from CTC", to: "/about/ctc-differences/" },
        { text: "About", to: "/about/" },
        { tagName: KeyTable },
      ]
    }
  }
}
</script>
