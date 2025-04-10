import type { Ref } from 'vue'
import type { Page } from '@/types'

import { ref, watch } from 'vue'

type FetchResult<T> = { data: T[]; page: Page }

type PagingFetcher<T, P> = (pageStart?: number, customParams?: P) => Promise<FetchResult<T>>

export const createEmptyResult = <T>(): FetchResult<T> => {
  return {
    data: [],
    page: {
      pageStart: 0,
      pageSize: 0,
      nextStart: 0,
      hasMore: false,
    },
  }
}

/**
 * Infinite scroll hook
 *
 * @param fetcher 获取数据的函数
 * @param initialPageStart 开始获取的项目ID,undefined 表示从头开始
 * @param initialCustomParams 初始自定义参数
 */
export function usePaging<T, P extends Record<string, any>>(
  fetcher: PagingFetcher<T, P>,
  initialPageStart?: number,
  initialCustomParams: P = {} as P
) {
  const data = ref<T[]>([]) as Ref<T[]>
  const pageCount = ref(0)
  const firstPageStart = ref(initialPageStart)
  const nextPageStart = ref(initialPageStart)
  const hasMore = ref(true)

  const refreshing = ref(false)
  const loadingMore = ref(false)
  const error = ref<Error | null>(null)

  // 使用泛型 P 作为 customParams 的类型
  const customParams = ref<P>(initialCustomParams)

  async function loadMore() {
    if (!hasMore.value || loadingMore.value || refreshing.value) return
    loadingMore.value = true
    try {
      const { data: newData, page } = await fetcher(nextPageStart.value || 1, customParams.value)
      data.value = [...data.value, ...newData]
      pageCount.value++
      nextPageStart.value = page.nextStart
      hasMore.value = page.hasMore
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
      const { data: newData, page } = await fetcher(firstPageStart.value, customParams.value)
      data.value = newData
      pageCount.value = 1
      nextPageStart.value = page.nextStart
      hasMore.value = page.hasMore
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

  function reset(newPageStart = initialPageStart, newCustomParams?: P) {
    firstPageStart.value = newPageStart
    nextPageStart.value = newPageStart
    data.value = []
    pageCount.value = 0
    hasMore.value = true

    refreshing.value = false
    loadingMore.value = false
    error.value = null

    if (newCustomParams) {
      customParams.value = newCustomParams
    }
  }

  // 监听自定义参数的变化
  watch(
    customParams,
    () => {
      reset(initialPageStart, customParams.value)
      refresh()
    },
    { deep: true }
  )

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
    customParams,
  }
}
