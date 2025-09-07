<template>
  <v-navigation-drawer
    v-model="drawerModel"
    :permanent="permanent"
    :temporary="temporary"
    :class="drawerClass"
    :color="color"
    :border="border"
    v-bind="$attrs"
  >
    <slot></slot>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { storeToRefs } from 'pinia'

import { useNavigationStore } from '@/stores/navigation'

interface Props {
  // 是否在桌面端强制使用临时抽屉模式，默认 false
  forceMobile?: boolean
  // 自定义颜色，默认为 grey-lighten-5
  color?: string
  // 自定义边框，默认为 sm
  border?: string
  // 自定义类名
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  forceMobile: false,
  color: 'grey-lighten-5',
  border: 'sm',
  customClass: '',
})

const { mdAndUp } = useDisplay()
const navigationStore = useNavigationStore()
const { isSecondaryDrawerOpen } = storeToRefs(navigationStore)
const { closeSecondaryDrawer } = navigationStore

// 计算是否为桌面端模式
const isDesktop = computed(() => mdAndUp.value && !props.forceMobile)

// 计算是否使用 permanent 模式
const permanent = computed(() => isDesktop.value)

// 计算是否使用 temporary 模式
const temporary = computed(() => !isDesktop.value)

// 双向绑定的抽屉模型
const drawerModel = computed({
  get: () => (isDesktop.value ? true : isSecondaryDrawerOpen.value),
  set: (value: boolean) => {
    if (!isDesktop.value) {
      navigationStore.setSecondaryDrawerOpen(value)
    }
  },
})

// 计算抽屉的 CSS 类
const drawerClass = computed(() => {
  const classes = ['page-sidebar', 'border-e-0', 'border-b-0']
  if (!isDesktop.value) {
    classes.push('rounded-0')
  }
  if (props.customClass) {
    classes.push(props.customClass)
  }
  return classes.join(' ')
})

// 路由变化时自动关闭移动端抽屉
import { useRouter } from 'vue-router'
import { is } from '@babel/types'
const router = useRouter()

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    if (!isDesktop.value) {
      closeSecondaryDrawer()
    }
  }
)
</script>
