import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'

const titleMap: Record<string, string> = {}

export const setTitle = (title: string, route: RouteLocationNormalizedLoaded) => {
  titleMap[route.path] = title
  refreshTitle(route)
}

export const refreshTitle = (route: RouteLocationNormalized) => {
  const dynamicTitle = titleMap[route.path]
  const titles = route.matched
    .map((item) => item.meta.title)
    .filter((item) => item)
    .reverse()
  if (dynamicTitle) {
    titles.splice(0, 0, dynamicTitle)
  }
  titles.push('知是社区')
  document.title = titles.join(' - ')
}
