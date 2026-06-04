import type { AnalyticsDistribution, AnalyticsDistributionItem } from '@/network/api/spaces/types'

export const formatCount = (value?: number | null) => new Intl.NumberFormat('zh-CN').format(value || 0)

export const formatPercent = (value?: number | null, digits = 1) => `${((value || 0) * 100).toFixed(digits)}%`

export const withDistributionPercent = (distribution?: AnalyticsDistribution | null) => {
  const items = distribution?.items || []
  const total = items.reduce((sum, item) => sum + item.count, 0)

  return items.map<AnalyticsDistributionItem>((item) => ({
    ...item,
    percentage: item.percentage ?? (total > 0 ? item.count / total : 0),
  }))
}
