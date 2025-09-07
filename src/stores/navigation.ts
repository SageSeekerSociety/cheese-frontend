import type { Component } from 'vue'

import { ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', () => {
  const actionsComponent = shallowRef<Component | null>(null)
  const tabsComponent = shallowRef<Component | null>(null)

  // 二级导航抽屉状态管理
  const isSecondaryDrawerOpen = ref(false)

  function setActions(component: Component | null) {
    actionsComponent.value = component
  }

  function clearActions() {
    actionsComponent.value = null
  }

  function setTabs(component: Component | null) {
    tabsComponent.value = component
  }

  function clearTabs() {
    tabsComponent.value = null
  }

  function setSecondaryDrawerOpen(open: boolean) {
    isSecondaryDrawerOpen.value = open
  }

  function toggleSecondaryDrawer() {
    isSecondaryDrawerOpen.value = !isSecondaryDrawerOpen.value
  }

  function closeSecondaryDrawer() {
    isSecondaryDrawerOpen.value = false
  }

  return {
    actionsComponent,
    tabsComponent,
    isSecondaryDrawerOpen,
    setActions,
    clearActions,
    setTabs,
    clearTabs,
    setSecondaryDrawerOpen,
    toggleSecondaryDrawer,
    closeSecondaryDrawer,
  }
})
