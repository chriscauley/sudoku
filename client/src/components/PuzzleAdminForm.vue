<template>
  <div class="puzzle-admin-form">
    <unrest-schema-form :form_name="`schema/puzzle-admin/${puzzle_id}`" :success="success">
      <template #extra_actions>
        <a :href="`/admin/puzzle/puzzle/${puzzle_id}/`" class="link">
          <i :class="$css.icon('database')" />
          admin
        </a>
      </template>
    </unrest-schema-form>
  </div>
</template>

<script>
export default {
  data() {
    return { puzzle_id: this.$route.params.puzzle_id }
  },
  methods: {
    success() {
      this.$ui.toast.success('Puzzle flag saved successfully')
    },
  },
}
</script>
