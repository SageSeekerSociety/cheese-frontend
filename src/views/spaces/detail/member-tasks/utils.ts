import type { TaskSubmitterType } from '@/types'

export type MemberApproveFilter = 'ALL' | 'NONE' | 'APPROVED' | 'DISAPPROVED'
export type MemberCompletionFilter =
  | 'ALL'
  | 'NOT_SUBMITTED'
  | 'PENDING_REVIEW'
  | 'REJECTED_RESUBMITTABLE'
  | 'FAILED'
  | 'SUCCESS'
export type MemberIdentityFilter = 'ALL' | TaskSubmitterType
export type MemberSortOrder = 'asc' | 'desc'
export type MyPublishingSortBy = 'createdAt' | 'participantCount' | 'pendingReviewCount' | 'successRate'
export type MyParticipatingSortBy = 'joinedAt' | 'deadline' | 'latestSubmissionAt' | 'completionStatus'

type RawQuery = Record<string, unknown>

export interface MyPublishingQueryState {
  categoryId?: number
  approved: MemberApproveFilter
  hasPendingParticipantApproval?: boolean
  hasPendingReview?: boolean
  sortBy: MyPublishingSortBy
  sortOrder: MemberSortOrder
}

export interface MyParticipatingQueryState {
  approved: MemberApproveFilter
  completionStatus: MemberCompletionFilter
  identityType: MemberIdentityFilter
  sortBy: MyParticipatingSortBy
  sortOrder: MemberSortOrder
}

const APPROVE_VALUES: MemberApproveFilter[] = ['ALL', 'NONE', 'APPROVED', 'DISAPPROVED']
const COMPLETION_VALUES: MemberCompletionFilter[] = [
  'ALL',
  'NOT_SUBMITTED',
  'PENDING_REVIEW',
  'REJECTED_RESUBMITTABLE',
  'FAILED',
  'SUCCESS',
]
const IDENTITY_VALUES: MemberIdentityFilter[] = ['ALL', 'USER', 'TEAM']
const SORT_ORDER_VALUES: MemberSortOrder[] = ['asc', 'desc']
const PUBLISHING_SORT_VALUES: MyPublishingSortBy[] = [
  'createdAt',
  'participantCount',
  'pendingReviewCount',
  'successRate',
]
const PARTICIPATING_SORT_VALUES: MyParticipatingSortBy[] = [
  'joinedAt',
  'deadline',
  'latestSubmissionAt',
  'completionStatus',
]

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

export const createDefaultPublishingQuery = (): MyPublishingQueryState => ({
  approved: 'ALL',
  sortBy: 'createdAt',
  sortOrder: 'desc',
})

export const createDefaultParticipatingQuery = (): MyParticipatingQueryState => ({
  approved: 'ALL',
  completionStatus: 'ALL',
  identityType: 'ALL',
  sortBy: 'joinedAt',
  sortOrder: 'desc',
})

export const normalizePublishingQuery = (query: RawQuery): MyPublishingQueryState => {
  const defaults = createDefaultPublishingQuery()

  return {
    categoryId: toNumber(query.categoryId),
    approved: asEnum(query.approved, APPROVE_VALUES) ?? defaults.approved,
    hasPendingParticipantApproval: toBoolean(query.hasPendingParticipantApproval),
    hasPendingReview: toBoolean(query.hasPendingReview),
    sortBy: asEnum(query.sortBy, PUBLISHING_SORT_VALUES) ?? defaults.sortBy,
    sortOrder: asEnum(query.sortOrder, SORT_ORDER_VALUES) ?? defaults.sortOrder,
  }
}

export const normalizeParticipatingQuery = (query: RawQuery): MyParticipatingQueryState => {
  const defaults = createDefaultParticipatingQuery()

  return {
    approved: asEnum(query.approved, APPROVE_VALUES) ?? defaults.approved,
    completionStatus: asEnum(query.completionStatus, COMPLETION_VALUES) ?? defaults.completionStatus,
    identityType: asEnum(query.identityType, IDENTITY_VALUES) ?? defaults.identityType,
    sortBy: asEnum(query.sortBy, PARTICIPATING_SORT_VALUES) ?? defaults.sortBy,
    sortOrder: asEnum(query.sortOrder, SORT_ORDER_VALUES) ?? defaults.sortOrder,
  }
}

export const serializePublishingQuery = (filters: MyPublishingQueryState) => {
  const defaults = createDefaultPublishingQuery()
  const query: Record<string, string> = {}

  if (filters.categoryId != null) query.categoryId = String(filters.categoryId)
  if (filters.approved !== defaults.approved) query.approved = filters.approved
  if (filters.hasPendingParticipantApproval != null) {
    query.hasPendingParticipantApproval = String(filters.hasPendingParticipantApproval)
  }
  if (filters.hasPendingReview != null) query.hasPendingReview = String(filters.hasPendingReview)
  if (filters.sortBy !== defaults.sortBy) query.sortBy = filters.sortBy
  if (filters.sortOrder !== defaults.sortOrder) query.sortOrder = filters.sortOrder

  return query
}

export const serializeParticipatingQuery = (filters: MyParticipatingQueryState) => {
  const defaults = createDefaultParticipatingQuery()
  const query: Record<string, string> = {}

  if (filters.approved !== defaults.approved) query.approved = filters.approved
  if (filters.completionStatus !== defaults.completionStatus) query.completionStatus = filters.completionStatus
  if (filters.identityType !== defaults.identityType) query.identityType = filters.identityType
  if (filters.sortBy !== defaults.sortBy) query.sortBy = filters.sortBy
  if (filters.sortOrder !== defaults.sortOrder) query.sortOrder = filters.sortOrder

  return query
}

export const buildMyPublishingApiParams = (filters: MyPublishingQueryState) => ({
  ...(filters.categoryId != null ? { categoryId: filters.categoryId } : {}),
  ...(filters.approved !== 'ALL' ? { approved: filters.approved } : {}),
  ...(filters.hasPendingParticipantApproval != null
    ? { hasPendingParticipantApproval: filters.hasPendingParticipantApproval }
    : {}),
  ...(filters.hasPendingReview != null ? { hasPendingReview: filters.hasPendingReview } : {}),
  sortBy: filters.sortBy,
  sortOrder: filters.sortOrder,
})

export const buildMyParticipatingApiParams = (filters: MyParticipatingQueryState) => ({
  ...(filters.approved !== 'ALL' ? { approved: filters.approved } : {}),
  ...(filters.completionStatus !== 'ALL' ? { completionStatus: filters.completionStatus } : {}),
  ...(filters.identityType !== 'ALL' ? { identityType: filters.identityType } : {}),
  sortBy: filters.sortBy,
  sortOrder: filters.sortOrder,
})
