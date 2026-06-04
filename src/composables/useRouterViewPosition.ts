// useRouterViewPosition.ts
import type { RouteRecordNormalized } from 'vue-router'

import { getCurrentInstance, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export function useRouterViewPosition() {
  const route = useRoute()
  const inst = getCurrentInstance()?.proxy as any

  const level = ref<number | null>(null) // 0,1,2,... 顶层为 0
  const viewName = ref<string | null>(null) // 'default' 或命名视图名
  const record = ref<RouteRecordNormalized | null>(null)

  function recompute() {
    level.value = null
    viewName.value = null
    record.value = null

    for (let i = 0; i < route.matched.length; i++) {
      const rec = route.matched[i]
      // rec.instances：{ [viewName]: ComponentPublicInstance | undefined }
      for (const [name, compInst] of Object.entries(rec.instances)) {
        console.log(name, compInst)
        if (compInst === inst) {
          level.value = i
          viewName.value = name
          record.value = rec
          return
        }
      }
    }
  }

  onMounted(recompute)
  watch(() => route.matched, recompute, { deep: true })

  return { level, viewName, record }
}
