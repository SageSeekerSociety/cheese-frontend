import type { RouteHierarchyItem } from '@/types/title'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { extractParamNames, normalizeRouteParams } from '@/utils/route'

import { usePageTitleStore } from '@/stores/title'

export function usePageTitle() {
  const route = useRoute()
  const router = useRouter()
  const store = usePageTitleStore()
  const { t } = useI18n()

  const getRouteHierarchy = computed((): RouteHierarchyItem[] => {
    const matched = route.matched
    const normalizedParams = normalizeRouteParams(route.params)

    return matched
      .map((routeRecord) => {
        const meta = routeRecord.meta || {}
        const routeName = routeRecord.name

        const pathPattern = routeRecord.path
        const requiredParamNames = extractParamNames(pathPattern)

        const layerParams: Record<string, string> = {}
        requiredParamNames.forEach((paramName) => {
          if (normalizedParams[paramName]) {
            layerParams[paramName] = normalizedParams[paramName]
          }
        })

        let actualPath: string = route.path

        if (routeName) {
          try {
            const resolved = router.resolve({
              name: routeName,
              params: layerParams,
            })
            actualPath = resolved.path
          } catch (error) {
            console.warn(`路由解析失败 ${String(routeName)}:`, error)
            actualPath = pathPattern
            Object.entries(layerParams).forEach(([key, value]) => {
              actualPath = actualPath.replace(`:${key}`, value)
              actualPath = actualPath.replace(`:${key}?`, value)
            })
          }
        }

        let title = ''

        if (routeName && store.hasDynamicTitle(routeName)) {
          title = store.getDynamicTitle(routeName)!
        } else if (meta.titleKey && t) {
          try {
            title = t(meta.titleKey)
          } catch (error) {
            console.warn(`国际化标题获取失败，titleKey: ${meta.titleKey}:`, error)
            title = meta.title || String(routeName || 'Unknown')
          }
        } else if (meta.title) {
          title = meta.title
        } else if (meta.getDynamicTitle) {
          try {
            title = meta.getDynamicTitle(route)
          } catch (error) {
            console.warn(`getDynamicTitle执行失败:`, error)
          }
        }

        return {
          path: actualPath,
          originalPath: routeRecord.path,
          name: routeName,
          title,
          meta,
          isDynamic: routeName ? store.hasDynamicTitle(routeName) : false,
          route: routeRecord,
          params: layerParams,
        }
      })
      .reverse()
  })

  const fullTitle = computed((): string => {
    const hierarchy = getRouteHierarchy.value
    const titles = hierarchy.map((item) => item.title).filter(Boolean)

    if (titles.length === 0) return store.siteName

    return [...titles, store.siteName].join(store.separator)
  })

  const seoTitle = computed((): string => {
    const hierarchy = getRouteHierarchy.value
    const titles = hierarchy.map((item) => item.title).reverse()

    if (titles.length === 0) return store.siteName

    return [...titles, store.siteName].join(store.separator)
  })

  return {
    setSiteName: store.setSiteName,
    setSeparator: store.setSeparator,
    setDynamicTitle: (title: string, routeName?: string | symbol | null) => {
      store.setDynamicTitle(title, routeName || route.name)
    },
    setBatchDynamicTitles: store.setBatchDynamicTitles,
    clearDynamicTitle: (routeName?: string | symbol | null) => {
      store.clearDynamicTitle(routeName || route.name)
    },
    clearAllDynamicTitles: store.clearAllDynamicTitles,
    hasDynamicTitle: store.hasDynamicTitle,
    getDynamicTitle: store.getDynamicTitle,
    fullTitle: fullTitle,
    seoTitle: seoTitle,
    getRouteHierarchy: getRouteHierarchy,
    siteName: computed(() => store.siteName),
    separator: computed(() => store.separator),
    allDynamicTitles: computed(() => store.allDynamicTitles),
  }
}
