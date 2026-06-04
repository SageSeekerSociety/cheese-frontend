<template>
  <v-bottom-navigation :elevation="0" bg-color="grey-lighten-5" grow>
    <v-btn v-for="item in showItems" :key="item.key" :to="item.to">
      <template v-if="item.icon">
        <v-icon>{{ item.icon }}</v-icon>
      </template>
      <template v-else-if="item.img">
        <v-avatar size="24">
          <v-img :src="item.img"></v-img>
        </v-avatar>
      </template>
      <span>{{ item.title }}</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue'

import { NavBarProps, NavItem } from './types'

const navBarProps = withDefaults(defineProps<NavBarProps>(), {
  items: () => [],
})

const { items } = toRefs(navBarProps)

const showItems = computed(() => {
  return items.value.filter(
    (item) => item.type === 'item' && item.permanent !== false && item.visibleOnMobile !== false
  ) as NavItem[]
})
</script>

<style lang="scss"></style>
