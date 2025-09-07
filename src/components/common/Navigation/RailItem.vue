<template>
  <v-card
    v-if="item.type === 'item'"
    :to="item.to"
    class="app-rail-item rounded-lg"
    :class="{ 'app-rail-item-cheese': item.icon === 'cheese' }"
  >
    <template v-if="item.img">
      <v-img :src="item.img" :aspect-ratio="1"></v-img>
    </template>
    <template v-else-if="item.icon === 'cheese'">
      <CheeseLogo width="36" height="36" class="cheese-icon" />
    </template>
    <template v-else>
      <v-icon size="small">{{ item.icon }}</v-icon>
      <div class="text-caption app-rail-item-text">{{ item.title }}</div>
    </template>
  </v-card>
  <template v-else>
    <v-divider></v-divider>
  </template>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue'

import { NavGenericItem } from './types'

import CheeseLogo from '@/assets/logo-plain.svg?component'

const navBarProps = defineProps<{
  item: NavGenericItem
}>()

const { item } = toRefs(navBarProps)
</script>

<style lang="scss">
.no-style-link {
  text-decoration: none;
  color: inherit;
}

.app-rail-item {
  width: 48px;
  height: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  --app-rail-item-background: 0.67;
  background-color: rgba(var(--v-theme-surface-light), var(--app-rail-item-background));
  color: rgba(var(--v-theme-on-surface), var(--v-medium-emphasis-opacity));
  transition: all 0.2s ease;
  gap: 2px;

  &:hover {
    --app-rail-item-background: 0.87;
    background-color: rgba(var(--v-theme-surface-light), var(--app-rail-item-background));
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    cursor: pointer;
  }

  &[aria-current] {
    --app-rail-item-background: 0.1;
    background-color: rgba(var(--v-theme-primary), var(--app-rail-item-background));
    color: rgba(var(--v-theme-primary), var(--v-high-emphasis-opacity));
  }

  &.app-rail-item-cheese {
    .cheese-icon {
      fill: rgb(var(--v-theme-on-surface));
      opacity: var(--v-medium-high-opacity);
      transition: all 0.2s ease;
    }

    &:hover {
      background: linear-gradient(to bottom, #ff9500, #ffe600);

      .cheese-icon {
        fill: rgb(var(--v-theme-on-primary));
        opacity: var(--v-high-emphasis-opacity);
      }
    }

    &[aria-current] {
      background: linear-gradient(to bottom, #ff9500, #ffe600);

      .cheese-icon {
        fill: rgb(var(--v-theme-on-primary));
        opacity: var(--v-high-emphasis-opacity);
      }
    }
  }

  .app-rail-item-text {
    line-height: 1;
  }
}
</style>
