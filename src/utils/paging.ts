import type { Ref } from 'vue'
import type { Page } from '@/types'

import { ref, watch } from 'vue'

type FetchResult<T, C = number> = { data: T[]; page: Page<C> }

type PagingFetcher<T, P, C = number> = (pageStart?: C, customParams?: P) => Promise<FetchResult<T, C>>

export const createEmptyResult = <T, C = number>(): FetchResult<T, C> => {
  return {
    data: [],
    page: {
      pageSize: 0,
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
export function usePaging<T, P = void, C = number>(
  fetcher: PagingFetcher<T, P, C>,
  initialPageStart?: C,
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
      const { data: newData, page } = await fetcher(nextPageStart.value, customParams.value)
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
