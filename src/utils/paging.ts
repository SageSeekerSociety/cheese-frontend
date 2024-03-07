import { Page } from '@/types'
import { ref, Ref } from 'vue'

type PagingFetcher<T> = (pageStart?: number) => Promise<{ data: T[]; page: Page }>

/**
 * Infinite scroll hook
 *
 * @param fetcher function to fetch data
 * @param initialPageStart item id to start fetching from, undefined to start from the beginning
 */
export function usePaging<T>(fetcher: PagingFetcher<T>, initialPageStart?: number) {
  const data = ref<T[]>([]) as Ref<T[]>
  const pageCount = ref(0)
  const firstPageStart = ref(initialPageStart)
  const nextPageStart = ref(initialPageStart)
  const hasMore = ref(true)

  const refreshing = ref(false)
  const loadingMore = ref(false)
  const error = ref<Error | null>(null)

  async function loadMore() {
    if (!hasMore.value || loadingMore.value || refreshing.value) return
    loadingMore.value = true
    try {
      const { data: newData, page } = await fetcher(nextPageStart.value || 1)
      data.value = [...data.value, ...newData]
      pageCount.value++
      nextPageStart.value = page.next_start
      hasMore.value = page.has_more
    } catch (e) {
      if (e instanceof Error) {
        error.value = e
      } else if (typeof e === 'string') {
        error.value = new Error(e)
      } else {
        error.value = new Error('Unknown error')
      }
    } finally {
      loadingMore.value = false
    }
  }

  async function refresh() {
    if (refreshing.value) return
    refreshing.value = true
    try {
      const { data: newData, page } = await fetcher(firstPageStart.value)
      data.value = newData
      pageCount.value = 1
      nextPageStart.value = page.next_start
      hasMore.value = page.has_more
    } catch (e) {
      if (e instanceof Error) {
        error.value = e
      } else if (typeof e === 'string') {
        error.value = new Error(e)
      } else {
        error.value = new Error('Unknown error')
      }
    } finally {
      refreshing.value = false
    }
  }

  function reset(newPageStart = initialPageStart) {
    firstPageStart.value = newPageStart
    nextPageStart.value = newPageStart
    data.value = []
    pageCount.value = 0
    hasMore.value = true

    refreshing.value = false
    loadingMore.value = false
    error.value = null
  }

  return {
    data,
    loadMore,
    refresh,
    reset,
    refreshing,
    loadingMore,
    error,
    hasMore,
    pageCount,
    nextPageStart,
  }
}
