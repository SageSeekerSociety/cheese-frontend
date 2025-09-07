import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router'

export interface RouteIcon {
  type: 'icon' | 'image'
  value: string
}

export interface RouteMetaTitle {
  title?: string
  titleKey?: string
  icon?: RouteIcon
  isDynamic?: boolean
  getDynamicTitle?: (route: RouteLocationNormalized) => string
  disableBreadcrumbLink?: boolean
  isFullPage?: boolean
}

export interface RouteHierarchyItem {
  path: string
  originalPath: string
  name: string | symbol | null | undefined
  title: string
  meta: RouteMetaTitle
  isDynamic: boolean
  route: RouteRecordNormalized
  params: Record<string, string>
}

export interface BreadcrumbItem {
  title: string
  icon?: RouteIcon
  path: string
  name: string | symbol | null | undefined
  isLast: boolean
  isClickable: boolean
}

declare module 'vue-router' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RouteMeta extends RouteMetaTitle {}
}
