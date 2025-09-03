import type { Page, Space } from '@/types'

export type PostSpaceRequestData = {
  name: string
  intro?: string
  avatarId?: number
  announcements?: string
  taskTemplates?: string
}

export type PatchSpaceRequestData = {
  name?: string
  intro?: string
  avatarId?: number
  announcements?: string
  taskTemplates?: string
  classificationTopics?: number[]
  defaultCategoryId?: number
}

export type PostSpaceAdminRequestData = {
  userId: number
  role: 'OWNER' | 'ADMIN'
}

export type PatchSpaceAdminRequestData = {
  role: 'OWNER' | 'ADMIN'
}

export type GetSpacesResponseData = {
  spaces: Space[]
  page: Page
}

export type PostSpaceCategoryRequestData = {
  name: string
  description?: string | null
  displayOrder?: number
}

export type PatchSpaceCategoryRequestData = Partial<PostSpaceCategoryRequestData>

// Analytics Types
export type AnalyticsDistributionItem = {
  count: number
  percentage: number
  label: string
  rangeStart: null | number
  rangeEnd: null | number
}

export type AnalyticsDistribution = {
  name: string
  type: 'DISCRETE' | 'CONTINUOUS'
  items: AnalyticsDistributionItem[]
}

export type AnalyticsStudentStatistics = {
  totalStudents: number
  totalStudentsWithRealName: number
  gradeDistribution: AnalyticsDistribution
  majorDistribution: AnalyticsDistribution
  classNameDistribution: AnalyticsDistribution
}

export type SpaceAnalyticsTasksData = {
  taskCategoryDistribution: AnalyticsDistribution
  taskStatusDistribution: AnalyticsDistribution
  participantStatusDistribution: AnalyticsDistribution
  successStudentStatistics: AnalyticsStudentStatistics
  unsuccessStudentStatistics: AnalyticsStudentStatistics
  rankDistribution: AnalyticsDistribution
}

export type PublisherParticipation = {
  publisherId: number
  publisherName: string
  participants: number
  completedUsers: number
  taskCount: number
}
