<template>
  <v-container class="pa-0" fluid>
    <v-sheet flat rounded="lg">
      <v-toolbar :title="t('spaces.detail.analytics.title')" color="transparent" density="compact">
        <template #append>
          <v-btn icon="mdi-refresh" variant="text" :loading="loading" @click="loadAnalytics" />
        </template>
      </v-toolbar>

      <v-divider />

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

        <!-- 成功学生统计 -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card flat rounded="lg" class="border">
              <v-card-title class="pb-2">
                <v-icon class="mr-2" color="success">mdi-check-circle</v-icon>
                成功学生统计
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-sheet class="pa-4 text-center border rounded">
                      <div class="text-h4 text-success">{{ analytics.successStudentStatistics.totalStudents }}</div>
                      <div class="text-body-2 text-medium-emphasis">总成功学生数</div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-sheet class="pa-4 text-center border rounded">
                      <div class="text-h4 text-success">
                        {{ analytics.successStudentStatistics.totalStudentsWithRealName }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">有实名学生数</div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-sheet class="pa-4 text-center border rounded">
                      <div class="text-h4 text-success">
                        {{
                          Math.round(
                            (analytics.successStudentStatistics.totalStudentsWithRealName /
                              analytics.successStudentStatistics.totalStudents) *
                              100
                          )
                        }}%
                      </div>
                      <div class="text-body-2 text-medium-emphasis">实名率</div>
                    </v-sheet>
                  </v-col>
                </v-row>
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
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- 失败学生统计 -->
        <v-row class="mt-4">
          <v-col cols="12">
            <v-card flat rounded="lg" class="border">
              <v-card-title class="pb-2">
                <v-icon class="mr-2" color="error">mdi-close-circle</v-icon>
                失败学生统计
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-sheet class="pa-4 text-center border rounded">
                      <div class="text-h4 text-error">{{ analytics.unsuccessStudentStatistics.totalStudents }}</div>
                      <div class="text-body-2 text-medium-emphasis">总失败学生数</div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-sheet class="pa-4 text-center border rounded">
                      <div class="text-h4 text-error">
                        {{ analytics.unsuccessStudentStatistics.totalStudentsWithRealName }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">有实名学生数</div>
                    </v-sheet>
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-sheet class="pa-4 text-center border rounded">
                      <div class="text-h4 text-error">
                        {{
                          Math.round(
                            (analytics.unsuccessStudentStatistics.totalStudentsWithRealName /
                              analytics.unsuccessStudentStatistics.totalStudents) *
                              100
                          )
                        }}%
                      </div>
                      <div class="text-body-2 text-medium-emphasis">实名率</div>
                    </v-sheet>
                  </v-col>
                </v-row>
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
import type { SpaceAnalyticsTasksData } from '@/network/api/spaces/types'

import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { toast } from 'vuetify-sonner'

import AnalyticsChart from '@/components/analytics/AnalyticsChart.vue'
import { SpacesApi } from '@/network/api/spaces'

const route = useRoute()
const { t } = useI18n()
const loading = ref(false)
const analytics = ref<SpaceAnalyticsTasksData | null>(null)

const spaceId = Number(route.params.spaceId)

const loadAnalytics = async () => {
  loading.value = true
  try {
    const { data } = await SpacesApi.getAnalyticsTasks(spaceId)
    analytics.value = data
  } catch (error) {
    console.error('获取分析数据失败:', error)
    toast.error('获取分析数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAnalytics()
})
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}
</style>
