import { describe, expect, it } from 'vitest'

import {
  buildMyParticipatingApiParams,
  buildMyPublishingApiParams,
  createDefaultParticipatingQuery,
  createDefaultPublishingQuery,
  normalizeParticipatingQuery,
  normalizePublishingQuery,
  serializeParticipatingQuery,
  serializePublishingQuery,
} from '../utils'

describe('member task query utils', () => {
  it('creates default publishing query', () => {
    expect(createDefaultPublishingQuery()).toEqual({
      approved: 'ALL',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
  })

  it('creates default participating query', () => {
    expect(createDefaultParticipatingQuery()).toEqual({
      approved: 'ALL',
      completionStatus: 'ALL',
      identityType: 'ALL',
      sortBy: 'joinedAt',
      sortOrder: 'desc',
    })
  })

  it('normalizes publishing query and omits ALL in api params', () => {
    const filters = normalizePublishingQuery({
      categoryId: '12',
      approved: 'ALL',
      hasPendingParticipantApproval: 'true',
      sortBy: 'pendingReviewCount',
    })

    expect(filters).toEqual({
      categoryId: 12,
      approved: 'ALL',
      hasPendingParticipantApproval: true,
      hasPendingReview: undefined,
      sortBy: 'pendingReviewCount',
      sortOrder: 'desc',
    })

    expect(buildMyPublishingApiParams(filters)).toEqual({
      categoryId: 12,
      hasPendingParticipantApproval: true,
      sortBy: 'pendingReviewCount',
      sortOrder: 'desc',
    })
  })

  it('normalizes participating query and omits ALL filters in api params', () => {
    const filters = normalizeParticipatingQuery({
      approved: 'ALL',
      completionStatus: 'REJECTED_RESUBMITTABLE',
      identityType: 'ALL',
      sortBy: 'latestSubmissionAt',
      sortOrder: 'asc',
    })

    expect(filters).toEqual({
      approved: 'ALL',
      completionStatus: 'REJECTED_RESUBMITTABLE',
      identityType: 'ALL',
      sortBy: 'latestSubmissionAt',
      sortOrder: 'asc',
    })

    expect(buildMyParticipatingApiParams(filters)).toEqual({
      completionStatus: 'REJECTED_RESUBMITTABLE',
      sortBy: 'latestSubmissionAt',
      sortOrder: 'asc',
    })
  })

  it('serializes only non-default member filters', () => {
    expect(
      serializePublishingQuery({
        categoryId: 3,
        approved: 'DISAPPROVED',
        hasPendingParticipantApproval: true,
        hasPendingReview: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
    ).toEqual({
      categoryId: '3',
      approved: 'DISAPPROVED',
      hasPendingParticipantApproval: 'true',
    })

    expect(
      serializeParticipatingQuery({
        approved: 'ALL',
        completionStatus: 'SUCCESS',
        identityType: 'TEAM',
        sortBy: 'joinedAt',
        sortOrder: 'desc',
      })
    ).toEqual({
      completionStatus: 'SUCCESS',
      identityType: 'TEAM',
    })
  })
})
