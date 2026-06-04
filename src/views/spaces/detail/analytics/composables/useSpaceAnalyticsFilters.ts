import type { RouteLocationNamedRaw } from 'vue-router'

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { normalizeAnalyticsQuery, serializeAnalyticsQuery } from '../utils'

export const useSpaceAnalyticsFilters = () => {
  const route = useRoute()
  const router = useRouter()

  const filters = computed(() => normalizeAnalyticsQuery(route.query as Record<string, unknown>))
  const spaceId = computed(() => Number(route.params.spaceId))

  const replaceFilters = async (partial: Record<string, unknown>) => {
    const nextFilters = normalizeAnalyticsQuery(
      {
        ...serializeAnalyticsQuery(filters.value),
        ...partial,
      },
      Date.now()
    )

    await router.replace({
      query: serializeAnalyticsQuery(nextFilters),
    })
  }

  const pushToSection = async (name: string, partial: Record<string, unknown> = {}) => {
    const nextFilters = normalizeAnalyticsQuery(
      {
        ...serializeAnalyticsQuery(filters.value),
        ...partial,
      },
      Date.now()
    )

    const target: RouteLocationNamedRaw = {
      name,
      params: { spaceId: spaceId.value },
      query: serializeAnalyticsQuery(nextFilters),
    }

    await router.push(target)
  }

  const resetFilters = async () => {
    const nextFilters = normalizeAnalyticsQuery({}, Date.now())
    await router.replace({
      query: serializeAnalyticsQuery(nextFilters),
    })
  }

  return {
    route,
    router,
    spaceId,
    filters,
    pushToSection,
    replaceFilters,
    resetFilters,
  }
}
