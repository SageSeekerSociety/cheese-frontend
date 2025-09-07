import { defineStore } from 'pinia'

export const usePageTitleStore = defineStore('pageTitle', {
  state: () => ({
    siteName: '知是社区',
    separator: ' - ',
    dynamicTitles: new Map<string | symbol, string>(),
    // 添加一个响应式触发器
    updateTrigger: 0,
  }),

  getters: {
    allDynamicTitles: (state) => Array.from(state.dynamicTitles.entries()),
    hasDynamicTitle:
      (state) =>
      (routeName: string | symbol | null | undefined): boolean => {
        return routeName ? state.dynamicTitles.has(routeName) : false
      },
    getDynamicTitle:
      (state) =>
      (routeName: string | symbol | null | undefined): string | undefined => {
        return routeName ? state.dynamicTitles.get(routeName) : undefined
      },
  },

  actions: {
    setSiteName(name: string): void {
      this.siteName = name
      this.triggerUpdate()
    },

    setSeparator(separator: string): void {
      this.separator = separator
      this.triggerUpdate()
    },

    setDynamicTitle(title: string, routeName: string | symbol | null | undefined): void {
      if (!routeName) {
        console.warn('无法设置动态标题：路由名称为空')
        return
      }
      this.dynamicTitles.set(routeName, title)
      this.triggerUpdate()
    },

    setBatchDynamicTitles(titleMap: Record<string, string>): void {
      Object.entries(titleMap).forEach(([routeName, title]) => {
        this.dynamicTitles.set(routeName, title)
      })
      this.triggerUpdate()
    },

    clearDynamicTitle(routeName: string | symbol | null | undefined): void {
      if (!routeName) return
      this.dynamicTitles.delete(routeName)
      this.triggerUpdate()
    },

    clearAllDynamicTitles(): void {
      this.dynamicTitles.clear()
      this.triggerUpdate()
    },

    // 触发响应式更新
    triggerUpdate(): void {
      this.updateTrigger++
    },
  },
})
