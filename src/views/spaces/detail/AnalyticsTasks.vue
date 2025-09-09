<template>
  <v-container class="pa-0" fluid>
    <v-sheet flat rounded="lg">
      <v-toolbar :title="t('spaces.detail.analytics.title')" color="transparent" density="compact">
        <template #append>
          <v-btn icon="mdi-refresh" variant="text" :loading="loading" @click="loadAnalytics" />
        </template>
      </v-toolbar>

      <v-divider />

      <!-- Filters -->
      <v-container class="pt-4 pb-0">
        <v-row class="align-center">
          <v-col cols="12" md="2">
            <v-text-field v-model="from" type="date" label="From" density="compact" hide-details />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field v-model="to" type="date" label="To" density="compact" hide-details />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="taskStatus"
              :items="taskStatusItems"
              label="Task Status"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="categoryId" :items="categoryItems" label="Category" density="compact" hide-details />
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="realName" :items="realNameItems" label="RealName" density="compact" hide-details />
          </v-col>
          <v-col cols="12" md="2">
            <v-select v-model="publisherId" :items="publisherItems" label="Publisher" density="compact" hide-details />
          </v-col>
        </v-row>
        <v-row class="pb-2">
          <v-col cols="12" class="d-flex justify-end">
            <v-btn color="primary" variant="flat" class="mr-2" @click="applyFilters">Apply</v-btn>
            <v-btn variant="text" @click="resetFilters">Reset</v-btn>
          </v-col>
        </v-row>
      </v-container>

      <v-container v-if="loading && !analytics" class="d-flex justify-center align-center" style="min-height: 400px">
        <v-progress-circular indeterminate color="primary" size="64" />
      </v-container>

      <v-container v-else-if="analytics" class="py-6">
        <v-row>
          <!-- 任务分类分布 -->
          <v-col cols="12" md="6">
            <analytics-chart
              :title="analytics.taskCategoryDistribution.name"
              :data="analytics.taskCategoryDistribution.items"
              chart-type="pie"
            />
          </v-col>

          <!-- 任务状态分布 -->
          <v-col cols="12" md="6">
            <analytics-chart
              :title="analytics.taskStatusDistribution.name"
              :data="analytics.taskStatusDistribution.items"
              chart-type="pie"
            />
          </v-col>

          <!-- 参与者状态分布 -->
          <v-col cols="12" md="6">
            <analytics-chart
              :title="analytics.participantStatusDistribution.name"
              :data="analytics.participantStatusDistribution.items"
              chart-type="pie"
            />
          </v-col>

          <!-- 排名分布 -->
          <v-col cols="12" md="6">
            <analytics-chart
              :title="analytics.rankDistribution.name"
              :data="analytics.rankDistribution.items"
              chart-type="bar"
            />
          </v-col>
        </v-row>

        <!-- 参与者统计 -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card flat rounded="lg" class="border">
              <v-card-title class="pb-2">
                <v-icon class="mr-2">mdi-account-group</v-icon>
                参与者统计
              </v-card-title>
              <v-card-text>
                <!-- 统计概览 -->
                <v-row>
                  <v-col cols="12" md="6">
                    <v-sheet class="pa-3 border rounded">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="success" size="small" class="mr-2">mdi-check-circle</v-icon>
                        <span class="font-weight-medium">成功参与者</span>
                      </div>
                      <v-row dense>
                        <v-col cols="4">
                          <div class="text-h5 text-success">{{ analytics.successStudentStatistics.totalStudents }}</div>
                          <div class="text-caption text-medium-emphasis">总数</div>
                        </v-col>
                        <v-col cols="4">
                          <div class="text-h5 text-success">
                            {{ analytics.successStudentStatistics.totalStudentsWithRealName }}
                          </div>
                          <div class="text-caption text-medium-emphasis">实名</div>
                        </v-col>
                        <v-col cols="4">
                          <div class="text-h5 text-success">
                            {{
                              analytics.successStudentStatistics.totalStudents > 0
                                ? Math.round(
                                    (analytics.successStudentStatistics.totalStudentsWithRealName /
                                      analytics.successStudentStatistics.totalStudents) *
                                      100
                                  )
                                : 0
                            }}%
                          </div>
                          <div class="text-caption text-medium-emphasis">实名率</div>
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-sheet class="pa-3 border rounded">
                      <div class="d-flex align-center mb-2">
                        <v-icon color="error" size="small" class="mr-2">mdi-close-circle</v-icon>
                        <span class="font-weight-medium">未完成参与者</span>
                      </div>
                      <v-row dense>
                        <v-col cols="4">
                          <div class="text-h5 text-error">{{ analytics.unsuccessStudentStatistics.totalStudents }}</div>
                          <div class="text-caption text-medium-emphasis">总数</div>
                        </v-col>
                        <v-col cols="4">
                          <div class="text-h5 text-error">
                            {{ analytics.unsuccessStudentStatistics.totalStudentsWithRealName }}
                          </div>
                          <div class="text-caption text-medium-emphasis">实名</div>
                        </v-col>
                        <v-col cols="4">
                          <div class="text-h5 text-error">
                            {{
                              analytics.unsuccessStudentStatistics.totalStudents > 0
                                ? Math.round(
                                    (analytics.unsuccessStudentStatistics.totalStudentsWithRealName /
                                      analytics.unsuccessStudentStatistics.totalStudents) *
                                      100
                                  )
                                : 0
                            }}%
                          </div>
                          <div class="text-caption text-medium-emphasis">实名率</div>
                        </v-col>
                      </v-row>
                    </v-sheet>
                  </v-col>
                </v-row>
                
                <!-- 分布图表 -->
                <v-tabs v-model="participantTab" class="mt-4">
                  <v-tab value="success">成功参与者分布</v-tab>
                  <v-tab value="unsuccess">未完成参与者分布</v-tab>
                </v-tabs>
                
                <v-window v-model="participantTab">
                  <v-window-item value="success">
                    <v-row class="mt-4">
                      <v-col cols="12" md="4">
                        <analytics-chart
                          :title="analytics.successStudentStatistics.gradeDistribution.name"
                          :data="analytics.successStudentStatistics.gradeDistribution.items"
                          chart-type="pie"
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <analytics-chart
                          :title="analytics.successStudentStatistics.majorDistribution.name"
                          :data="analytics.successStudentStatistics.majorDistribution.items"
                          chart-type="pie"
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <analytics-chart
                          :title="analytics.successStudentStatistics.classNameDistribution.name"
                          :data="analytics.successStudentStatistics.classNameDistribution.items"
                          chart-type="pie"
                        />
                      </v-col>
                    </v-row>
                  </v-window-item>
                  
                  <v-window-item value="unsuccess">
                    <v-row class="mt-4">
                      <v-col cols="12" md="4">
                        <analytics-chart
                          :title="analytics.unsuccessStudentStatistics.gradeDistribution.name"
                          :data="analytics.unsuccessStudentStatistics.gradeDistribution.items"
                          chart-type="pie"
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <analytics-chart
                          :title="analytics.unsuccessStudentStatistics.majorDistribution.name"
                          :data="analytics.unsuccessStudentStatistics.majorDistribution.items"
                          chart-type="pie"
                        />
                      </v-col>
                      <v-col cols="12" md="4">
                        <analytics-chart
                          :title="analytics.unsuccessStudentStatistics.classNameDistribution.name"
                          :data="analytics.unsuccessStudentStatistics.classNameDistribution.items"
                          chart-type="pie"
                        />
                      </v-col>
                    </v-row>
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mt-4">
          <v-col cols="12">
            <v-card flat rounded="lg" class="border">
              <v-card-title class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-icon class="mr-2">mdi-clipboard-list</v-icon>
                  Tasks Overview
                </div>
                <div class="d-flex align-center">
                  <v-btn color="primary" variant="flat" :loading="exporting" @click="exportCsv">
                    <v-icon start>mdi-download</v-icon>
                    Export CSV
                  </v-btn>
                </div>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <v-data-table
                  :headers="publisherHeaders"
                  :items="publishers || []"
                  :loading="loadingPublishers"
                  items-per-page="10"
                  density="comfortable"
                >
                  <template #item.successRate="{ item }">
                    <v-chip
                      :color="getSuccessRateColor(item)"
                      variant="tonal"
                      size="small"
                    >
                      {{ calculateSuccessRate(item) }}%
                    </v-chip>
                  </template>
                  <template #item.taskCount="{ item }">
                    <span v-if="item.taskCount">{{ item.taskCount }}</span>
                    <span v-else class="text-medium-emphasis">-</span>
                  </template>
                </v-data-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-container v-else class="d-flex justify-center align-center" style="min-height: 400px">
        <v-empty-state icon="mdi-chart-line" title="暂无数据" text="当前空间还没有分析数据" />
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script setup lang="ts">
import type { PublisherParticipation, SpaceAnalyticsTasksData } from '@/network/api/spaces/types'

import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { toast } from 'vuetify-sonner'

import AnalyticsChart from '@/components/analytics/AnalyticsChart.vue'
import { SpacesApi } from '@/network/api/spaces'
import accountService from '@/services/account'

const route = useRoute()
const { t } = useI18n()
const loading = ref(false)
const analytics = ref<SpaceAnalyticsTasksData | null>(null)
const publishers = ref<PublisherParticipation[] | null>(null)
const loadingPublishers = ref(false)
const exporting = ref(false)
const publisherHeaders = [
  { title: 'Task Name', value: 'publisherName', key: 'publisherName' },
  { title: 'Rank', value: 'taskCount', key: 'taskCount', align: 'center' },
  { title: 'Participants', value: 'participants', key: 'participants', align: 'center' },
  { title: 'Submissions', value: 'completedUsers', key: 'completedUsers', align: 'center' },
  { title: 'Success Rate', value: 'successRate', key: 'successRate', align: 'center' },
]

const from = ref<string>('')
const to = ref<string>('')
const taskStatus = ref<string>('')
const categoryId = ref<number | null>(null)
const realName = ref<'all' | 'with' | 'without'>('all')
const publisherId = ref<number | null>(null)

const taskStatusItems = ['ALL', 'NONE', 'APPROVED', 'DISAPPROVED'].map((v) => ({
  title: v,
  value: v === 'ALL' ? '' : v,
}))
const realNameItems = [
  { title: 'All', value: 'all' },
  { title: 'With', value: 'with' },
  { title: 'Without', value: 'without' },
]
const categoryItems = ref<{ title: string; value: number | null }[]>([{ title: 'All', value: null }])
const publisherItems = ref<{ title: string; value: number | null }[]>([{ title: 'All', value: null }])

const spaceId = Number(route.params.spaceId)
const participantTab = ref('success')

const loadAnalytics = async () => {
  loading.value = true
  try {
    const params: Record<string, any> = {
      successBy: 'completion',
      realName: realName.value,
    }
    if (from.value) params.from = new Date(from.value).getTime()
    if (to.value) params.to = new Date(to.value).getTime()
    if (taskStatus.value) params.taskStatus = taskStatus.value
    if (categoryId.value != null) params.categoryId = categoryId.value
    if (publisherId.value != null) params.publisherId = publisherId.value
    const { data } = await SpacesApi.getAnalyticsTasks(spaceId, params)
    analytics.value = data
  } catch (error) {
    console.error('获取分析数据失败:', error)
    toast.error('获取分析数据失败')
  } finally {
    loading.value = false
  }
}

const loadPublishers = async () => {
  loadingPublishers.value = true
  try {
    // Load tasks overview instead of publishers participation
    const { data } = await SpacesApi.getPublishersParticipation(spaceId, 'completion')
    publishers.value = data
  } finally {
    loadingPublishers.value = false
  }
}

const exportCsv = async () => {
  exporting.value = true
  try {
    // Use accountService for consistency (imported with lowercase)
    const token = accountService.accessToken
    const qs: Record<string, any> = {
      format: 'csv',
      successBy: 'completion',
      realName: realName.value,
    }
    if (from.value) qs.from = new Date(from.value).getTime()
    if (to.value) qs.to = new Date(to.value).getTime()
    if (taskStatus.value) qs.taskStatus = taskStatus.value
    if (categoryId.value != null) qs.categoryId = categoryId.value
    if (publisherId.value != null) qs.publisherId = publisherId.value
    const query = new URLSearchParams(qs as any).toString()
    const resp = await fetch(
      `${import.meta.env.VITE_NEW_API_BASE_URL}/spaces/${spaceId}/participants/export?${query}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    )
    if (!resp.ok) {
      console.error('CSV导出失败:', resp.status, resp.statusText)
      return
    }
    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `space-${spaceId}-participants.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}

const loadCategories = async () => {
  try {
    const { data } = await SpacesApi.listCategories(spaceId)
    categoryItems.value = [
      { title: 'All', value: null },
      ...data.categories.map((cat) => ({ title: cat.name, value: cat.id })),
    ]
  } catch (error) {
    console.error('Failed to load categories:', error)
  }
}

const loadPublishersList = async () => {
  try {
    // For now, we don't pre-load publishers to avoid circular dependency
    // Publishers can be loaded from space members or tasks API in the future
    // Keep the default 'All' option only
    publisherItems.value = [{ title: 'All', value: null }]
  } catch (error) {
    console.error('Failed to load publishers:', error)
  }
}

// Helper functions for task table
const calculateSuccessRate = (item: any) => {
  if (item.participants === 0) return '0'
  return ((item.completedUsers / item.participants) * 100).toFixed(1)
}

const getSuccessRateColor = (item: any) => {
  const rate = item.participants > 0 ? (item.completedUsers / item.participants) * 100 : 0
  if (rate >= 80) return 'success'
  if (rate >= 60) return 'warning'
  return 'error'
}

onMounted(async () => {
  // Load filters data first
  await loadCategories()
  // Then load analytics data
  loadAnalytics()
  loadPublishers()
})

const applyFilters = () => {
  loadAnalytics()
  loadPublishers()
}

const resetFilters = () => {
  from.value = ''
  to.value = ''
  taskStatus.value = ''
  categoryId.value = null
  realName.value = 'all'
  publisherId.value = null
  loadAnalytics()
  loadPublishers()
}
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
