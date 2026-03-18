export type AnalyticsGroupBy = 'day' | 'week' | 'month'
export type AnalyticsSortOrder = 'asc' | 'desc'
export type AnalyticsApproveFilter = 'NONE' | 'APPROVED' | 'DISAPPROVED'
export type AnalyticsTaskApprovedFilter = AnalyticsApproveFilter | 'ALL'
export type AnalyticsRealNameFilter = 'all' | 'with' | 'without'
export type AnalyticsCompletionStatus =
  | 'NOT_SUBMITTED'
  | 'PENDING_REVIEW'
  | 'REJECTED_RESUBMITTABLE'
  | 'FAILED'
  | 'SUCCESS'
export type AnalyticsSection = 'overview' | 'alerts' | 'publishers' | 'tasks' | 'participants'
export type AnalyticsExportSection = 'publishers' | 'tasks' | 'participants'

export interface SpaceAnalyticsQueryState {
  from: string
  to: string
  categoryId?: number
  publisherId?: number
  taskApproved: AnalyticsTaskApprovedFilter
  groupBy: AnalyticsGroupBy
  sortBy?: string
  sortOrder?: AnalyticsSortOrder
  hasPendingReview?: boolean
  hasPendingApproval?: boolean
  participationApproved?: AnalyticsApproveFilter
  completionStatus?: AnalyticsCompletionStatus
  realName: AnalyticsRealNameFilter
}

type RawQuery = Record<string, unknown>

const DEFAULT_DAY_RANGE = 180
const APPROVE_VALUES: AnalyticsApproveFilter[] = ['NONE', 'APPROVED', 'DISAPPROVED']
const TASK_APPROVE_VALUES: AnalyticsTaskApprovedFilter[] = ['ALL', 'NONE', 'APPROVED', 'DISAPPROVED']
const GROUP_BY_VALUES: AnalyticsGroupBy[] = ['day', 'week', 'month']
const SORT_ORDER_VALUES: AnalyticsSortOrder[] = ['asc', 'desc']
const REAL_NAME_VALUES: AnalyticsRealNameFilter[] = ['all', 'with', 'without']
const COMPLETION_VALUES: AnalyticsCompletionStatus[] = [
  'NOT_SUBMITTED',
  'PENDING_REVIEW',
  'REJECTED_RESUBMITTABLE',
  'FAILED',
  'SUCCESS',
]

const pad = (value: number) => String(value).padStart(2, '0')

export const formatUtcDate = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`

const isDateOnlyString = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return undefined
}

const toBoolean = (value: unknown) => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return undefined
}

const asEnum = <T extends string>(value: unknown, allowed: T[]) =>
  typeof value === 'string' && allowed.includes(value as T) ? (value as T) : undefined

const startOfUtcDayTimestamp = (value: string) => Date.parse(`${value}T00:00:00.000Z`)
const endOfUtcDayTimestamp = (value: string) => Date.parse(`${value}T23:59:59.999Z`)

const dayDiff = (from: string, to: string) => {
  const diffMs = startOfUtcDayTimestamp(to) - startOfUtcDayTimestamp(from)
  return Math.max(0, Math.round(diffMs / 86400000))
}

export const createDefaultAnalyticsQuery = (now = Date.now()) => {
  const toDate = new Date(now)
  const fromDate = new Date(now)
  fromDate.setUTCDate(fromDate.getUTCDate() - DEFAULT_DAY_RANGE)

  const to = formatUtcDate(toDate)
  const from = formatUtcDate(fromDate)

  return {
    from,
    to,
    taskApproved: 'APPROVED' as AnalyticsApproveFilter,
    groupBy: inferAnalyticsGroupBy(from, to),
    realName: 'all' as AnalyticsRealNameFilter,
  }
}

export const inferAnalyticsGroupBy = (from: string, to: string): AnalyticsGroupBy => {
  const diff = dayDiff(from, to)
  if (diff <= 45) return 'day'
  if (diff <= 366) return 'week'
  return 'month'
}

export const normalizeAnalyticsQuery = (query: RawQuery, now = Date.now()): SpaceAnalyticsQueryState => {
  const defaults = createDefaultAnalyticsQuery(now)
  const from = isDateOnlyString(query.from) ? query.from : defaults.from
  const to = isDateOnlyString(query.to) ? query.to : defaults.to

  return {
    from,
    to,
    categoryId: toNumber(query.categoryId),
    publisherId: toNumber(query.publisherId),
    taskApproved: asEnum(query.taskApproved, TASK_APPROVE_VALUES) ?? defaults.taskApproved,
    groupBy: asEnum(query.groupBy, GROUP_BY_VALUES) ?? inferAnalyticsGroupBy(from, to),
    sortBy: typeof query.sortBy === 'string' && query.sortBy ? query.sortBy : undefined,
    sortOrder: asEnum(query.sortOrder, SORT_ORDER_VALUES),
    hasPendingReview: toBoolean(query.hasPendingReview),
    hasPendingApproval: toBoolean(query.hasPendingApproval),
    participationApproved: asEnum(query.participationApproved, APPROVE_VALUES),
    completionStatus: asEnum(query.completionStatus, COMPLETION_VALUES),
    realName: asEnum(query.realName, REAL_NAME_VALUES) ?? defaults.realName,
  }
}

type AnalyticsApiParams = Record<string, string | number | boolean>

const withScopeParams = (filters: SpaceAnalyticsQueryState): AnalyticsApiParams => ({
  from: startOfUtcDayTimestamp(filters.from),
  to: endOfUtcDayTimestamp(filters.to),
  ...(filters.categoryId != null ? { categoryId: filters.categoryId } : {}),
  ...(filters.taskApproved && filters.taskApproved !== 'ALL' ? { taskApproved: filters.taskApproved } : {}),
})

export const buildAnalyticsApiParams = (
  section: AnalyticsSection,
  filters: SpaceAnalyticsQueryState
): AnalyticsApiParams => {
  if (section === 'alerts') {
    return {}
  }

  const scoped = withScopeParams(filters)

  if (section === 'overview') {
    return {
      ...scoped,
      ...(filters.publisherId != null ? { publisherId: filters.publisherId } : {}),
      groupBy: filters.groupBy,
    }
  }

  if (section === 'publishers') {
    return {
      ...scoped,
      ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
      ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
    }
  }

  if (section === 'tasks') {
    return {
      ...scoped,
      ...(filters.publisherId != null ? { publisherId: filters.publisherId } : {}),
      ...(filters.hasPendingReview != null ? { hasPendingReview: filters.hasPendingReview } : {}),
      ...(filters.hasPendingApproval != null ? { hasPendingApproval: filters.hasPendingApproval } : {}),
      ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
      ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
    }
  }

  return {
    ...scoped,
    ...(filters.publisherId != null ? { publisherId: filters.publisherId } : {}),
    ...(filters.participationApproved ? { participationApproved: filters.participationApproved } : {}),
    ...(filters.completionStatus ? { completionStatus: filters.completionStatus } : {}),
    ...(filters.realName ? { realName: filters.realName } : {}),
    groupBy: filters.groupBy,
  }
}

export const buildAnalyticsExportUrl = (
  apiBaseUrl: string,
  spaceId: number,
  section: AnalyticsExportSection,
  filters: SpaceAnalyticsQueryState
) => {
  const params = new URLSearchParams()
  const apiParams = buildAnalyticsApiParams(section, filters)

  Object.entries(apiParams).forEach(([key, value]) => {
    params.set(key, String(value))
  })

  return `${apiBaseUrl}/spaces/${spaceId}/analytics/${section}/export?${params.toString()}`
}

export const serializeAnalyticsQuery = (filters: Partial<SpaceAnalyticsQueryState>) => {
  const query: Record<string, string> = {}

  if (filters.from) query.from = filters.from
  if (filters.to) query.to = filters.to
  if (filters.categoryId != null) query.categoryId = String(filters.categoryId)
  if (filters.publisherId != null) query.publisherId = String(filters.publisherId)
  if (filters.taskApproved) query.taskApproved = filters.taskApproved
  if (filters.groupBy) query.groupBy = filters.groupBy
  if (filters.sortBy) query.sortBy = filters.sortBy
  if (filters.sortOrder) query.sortOrder = filters.sortOrder
  if (filters.hasPendingReview != null) query.hasPendingReview = String(filters.hasPendingReview)
  if (filters.hasPendingApproval != null) query.hasPendingApproval = String(filters.hasPendingApproval)
  if (filters.participationApproved) query.participationApproved = filters.participationApproved
  if (filters.completionStatus) query.completionStatus = filters.completionStatus
  if (filters.realName && filters.realName !== 'all') query.realName = filters.realName

  return query
}
