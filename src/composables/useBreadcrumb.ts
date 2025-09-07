import type { ComputedRef } from 'vue'
import type { BreadcrumbItem } from '@/types/title'

import { computed } from 'vue'

import { usePageTitle } from './usePageTitle'

export function useBreadcrumb() {
  const { getRouteHierarchy } = usePageTitle()

  const breadcrumbItems: ComputedRef<BreadcrumbItem[]> = computed(() => {
    return getRouteHierarchy.value
      .filter((item) => item.title && !item.meta.disableBreadcrumbLink)
      .map((item, index, array) => ({
        title: item.title,
        icon: item.meta.icon,
        path: item.path,
        name: item.name,
        isLast: index === array.length - 1,
        isClickable: !item.meta.disableBreadcrumbLink,
      }))
  })

  return {
    breadcrumbItems: breadcrumbItems,
  }
}
