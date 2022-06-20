<template>
  <unrest-dropdown placement="bottom" class="config-menu">
    <i :class="$css.icon('gear _trigger')" />
    <template #content>
      <div class="dropdown-items" @click.stop style="width: unset">
        <div class="dropdown-item">
          <unrest-form
            :schema="$store.config.schema"
            :state="$store.config.state"
            @change="() => $store.config.save($store.config.state)"
            >
            <template #actions>{{" "}}</template>
          </unrest-form>
        </div>
      </div>
    </template>
  </unrest-dropdown>
</template>