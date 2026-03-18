import { describe, expect, it } from 'vitest'

import {
  buildAnalyticsApiParams,
  buildAnalyticsExportUrl,
  createDefaultAnalyticsQuery,
  inferAnalyticsGroupBy,
  normalizeAnalyticsQuery,
} from '../utils'

describe('space analytics utils', () => {
  it('creates a default 180 day approved query window', () => {
    const query = createDefaultAnalyticsQuery(new Date('2026-03-19T12:00:00.000Z').getTime())

    expect(query.taskApproved).toBe('APPROVED')
    expect(query.to).toBe('2026-03-19')
    expect(query.from).toBe('2025-09-20')
  })

  it('infers groupBy from date range', () => {
    expect(inferAnalyticsGroupBy('2026-03-01', '2026-03-19')).toBe('day')
    expect(inferAnalyticsGroupBy('2025-09-20', '2026-03-19')).toBe('week')
    expect(inferAnalyticsGroupBy('2024-01-01', '2026-03-19')).toBe('month')
  })

  it('normalizes query and preserves supported values', () => {
    const query = normalizeAnalyticsQuery(
      {
        from: '2025-09-20',
        to: '2026-03-19',
        categoryId: '9',
        publisherId: '18',
        taskApproved: 'APPROVED',
        realName: 'with',
        hasPendingReview: 'true',
        completionStatus: 'SUCCESS',
      },
      new Date('2026-03-19T12:00:00.000Z').getTime()
    )

    expect(query.categoryId).toBe(9)
    expect(query.publisherId).toBe(18)
    expect(query.realName).toBe('with')
    expect(query.hasPendingReview).toBe(true)
    expect(query.completionStatus).toBe('SUCCESS')
  })

  it('supports ALL task approval filter without passing backend param', () => {
    const filters = normalizeAnalyticsQuery(
      {
        from: '2025-09-20',
        to: '2026-03-19',
        taskApproved: 'ALL',
      },
      new Date('2026-03-19T12:00:00.000Z').getTime()
    )

    expect(filters.taskApproved).toBe('ALL')
    expect(buildAnalyticsApiParams('overview', filters)).toEqual({
      from: new Date('2025-09-20T00:00:00.000Z').getTime(),
      to: new Date('2026-03-19T23:59:59.999Z').getTime(),
      groupBy: 'week',
    })
  })

  it('builds resource-specific params', () => {
    const filters = normalizeAnalyticsQuery(
      {
        from: '2025-09-20',
        to: '2026-03-19',
        categoryId: '9',
        publisherId: '18',
        taskApproved: 'APPROVED',
        groupBy: 'week',
        sortBy: 'taskCount',
        sortOrder: 'desc',
        realName: 'with',
        hasPendingReview: 'true',
        participationApproved: 'APPROVED',
      },
      new Date('2026-03-19T12:00:00.000Z').getTime()
    )

    expect(buildAnalyticsApiParams('overview', filters)).toEqual({
      from: new Date('2025-09-20T00:00:00.000Z').getTime(),
      to: new Date('2026-03-19T23:59:59.999Z').getTime(),
      categoryId: 9,
      publisherId: 18,
      taskApproved: 'APPROVED',
      groupBy: 'week',
    })

    expect(buildAnalyticsApiParams('publishers', filters)).toEqual({
      from: new Date('2025-09-20T00:00:00.000Z').getTime(),
      to: new Date('2026-03-19T23:59:59.999Z').getTime(),
      categoryId: 9,
      taskApproved: 'APPROVED',
      sortBy: 'taskCount',
      sortOrder: 'desc',
    })

    expect(buildAnalyticsApiParams('participants', filters)).toEqual({
      from: new Date('2025-09-20T00:00:00.000Z').getTime(),
      to: new Date('2026-03-19T23:59:59.999Z').getTime(),
      categoryId: 9,
      publisherId: 18,
      taskApproved: 'APPROVED',
      participationApproved: 'APPROVED',
      realName: 'with',
      groupBy: 'week',
    })
  })

  it('builds export urls from current filters', () => {
    const filters = normalizeAnalyticsQuery(
      {
        from: '2025-09-20',
        to: '2026-03-19',
        categoryId: '9',
        publisherId: '18',
        taskApproved: 'APPROVED',
        hasPendingApproval: 'true',
      },
      new Date('2026-03-19T12:00:00.000Z').getTime()
    )

    const url = new URL(buildAnalyticsExportUrl('/api', 42, 'tasks', filters), 'https://example.com')

    expect(url.pathname).toBe('/api/spaces/42/analytics/tasks/export')
    expect(Object.fromEntries(url.searchParams.entries())).toEqual({
      from: '1758326400000',
      to: '1773964799999',
      categoryId: '9',
      publisherId: '18',
      taskApproved: 'APPROVED',
      hasPendingApproval: 'true',
    })
  })
})
