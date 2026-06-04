<template>
  <div
    v-if="renderHeader()"
    v-scroll:#app-scrollable="onScroll"
    class="page-header text-high-emphasis"
    :class="{ 'page-header-mobile': $vuetify.display.mobile }"
    :style="{ '--app-page-header-bg-opacity': props.enableScrollEffect ? bgProgress : props.maxOpacity }"
  >
    <template v-if="$slots.default">
      <slot></slot>
    </template>

    <template v-else>
      <!-- 图标处理：可能是icon或图片 -->
      <template v-if="$vuetify.display.mdAndUp">
        <template v-if="displayIcon">
          <v-icon v-if="displayIcon.type === 'icon'" size="24">{{ displayIcon.value }}</v-icon>
          <v-img v-else-if="displayIcon.type === 'image'" :src="displayIcon.value" width="24" height="24" />
        </template>
        <span v-if="title" class="text-subtitle-1">{{ title }}</span>
        <template v-else>
          <template v-for="(item, index) in displayItems" :key="index">
            <router-link v-if="item.isClickable" :to="item.path" class="text-subtitle-1 breadcrumb-link">
              {{ item.title }}
            </router-link>
            <span v-else class="text-subtitle-1">{{ item.title }}</span>
            <v-icon v-if="index < displayItems.length - 1" size="16">mdi-chevron-right</v-icon>
          </template>
        </template>
      </template>
    </template>

    <template v-if="$slots.tabs">
      <div></div>
      <slot name="tabs"></slot>
    </template>
    <template v-else-if="tabsComponent">
      <div></div>
      <component :is="tabsComponent" />
    </template>
    <v-spacer></v-spacer>

    <div v-if="hasActions && $vuetify.display.mdAndUp" class="header-actions">
      <v-defaults-provider :defaults="{ VBtn: { color: 'on-surface', size: 'small', variant: 'text' } }">
        <component :is="actionsComponent" v-if="actionsComponent" />
        <slot name="actions"></slot>
      </v-defaults-provider>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouteIcon } from '@/types/title'

import { computed, ref, useSlots } from 'vue'
import { useDisplay } from 'vuetify'
import { clamp } from 'lodash-es'
import { storeToRefs } from 'pinia'

import { useBreadcrumb } from '@/composables/useBreadcrumb'

import { useNavigationStore } from '@/stores/navigation'

interface Props {
  // 自定义图标，不指定则使用面包屑的图标
  icon?: string
  title?: string
  // 指定面包屑的截取起始页面名称
  startFromRoute?: string
  // 是否启用滚动背景效果
  enableScrollEffect?: boolean
  // 背景透明度（滚动时达到的最大透明度）
  maxOpacity?: number
}

// 获取插槽
defineSlots<{
  default?: () => any
  actions?: () => any
  tabs?: () => any
}>()

const slots = useSlots()

const props = withDefaults(defineProps<Props>(), {
  enableScrollEffect: true,
  maxOpacity: 0.75,
})
const display = useDisplay()

const bgProgress = ref(0)
const { breadcrumbItems } = useBreadcrumb()
const headerStore = useNavigationStore()
const { actionsComponent, tabsComponent } = storeToRefs(headerStore)

const renderHeader = () => display.mdAndUp.value || !!tabsComponent.value || !!slots.tabs

// 计算显示的面包屑项目
const displayItems = computed(() => {
  if (props.startFromRoute) {
    const startIdx = breadcrumbItems.value.findIndex((item) => item.name === props.startFromRoute)
    if (startIdx !== -1) {
      return breadcrumbItems.value.slice(0, startIdx + 1).reverse()
    }
  }

  // 默认逻辑：找到最后一个 SpacesDetail 并从那里开始
  const lastIdx = breadcrumbItems.value.findLastIndex((item) => item.name === 'SpacesDetail')
  return breadcrumbItems.value.slice(0, lastIdx).reverse()
})

// 计算显示的图标
const displayIcon = computed((): RouteIcon | null => {
  if (props.icon) {
    return { type: 'icon', value: props.icon }
  }

  const firstItem = displayItems.value[0]
  if (firstItem?.icon) {
    return firstItem.icon
  }

  return null
})

// 是否有动作区域
const hasActions = computed(() => !!actionsComponent.value || !!slots.actions)

// 滚动效果
const onScroll = (e: Event) => {
  if (!props.enableScrollEffect) return

  const scrollTopPx = (e.target as HTMLElement).scrollTop
  bgProgress.value = clamp(scrollTopPx / 48, 0, props.maxOpacity)
}
</script>

<style lang="scss" scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), var(--app-page-header-bg-opacity, 0));
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;

  &.page-header-mobile {
    padding: 0;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-link {
  text-decoration: none;
  color: inherit;
  transition: color 0.2s;

  &:hover {
    color: rgb(var(--v-theme-primary));
  }
}
</style>
