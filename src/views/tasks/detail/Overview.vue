<template>
  <div>
    <!-- 赛题状态提示 -->
    <v-alert
      v-if="taskData?.approved === 'DISAPPROVED' && isSelfTask"
      type="error"
      class="mb-4"
      rounded="lg"
      title="审核未通过"
      text="您的赛题未通过审核"
    >
      <template #text>
        <div class="mt-2">
          <div class="font-weight-medium">驳回理由：</div>
          <div>{{ taskData.rejectReason }}</div>
        </div>
      </template>
    </v-alert>

    <!-- 个人任务参与限制提示 -->
    <v-alert
      v-if="
        taskData?.submitterType === 'USER' &&
        !canUserJoin &&
        !taskData?.joined &&
        userReasons.length > 0 &&
        !isDeadlinePassed
      "
      type="warning"
      class="mb-4"
      rounded="lg"
      title="暂时无法参与"
    >
      <template #text>
        <div class="mt-2">
          <div class="font-weight-medium">{{ userReasons[0]?.message || '您当前无法参与此赛题' }}</div>

          <!-- 等级不足提示 -->
          <div v-if="userReasons[0]?.code === 'USER_RANK_NOT_HIGH_ENOUGH'" class="mt-2 text-medium-emphasis">
            完成更多基础题目来提升您的等级，解锁更高难度的挑战。
          </div>

          <!-- 缺少实名信息提示 -->
          <div v-if="userReasons[0]?.code === 'USER_MISSING_REAL_NAME'" class="mt-2 text-medium-emphasis">
            <div class="d-flex align-center gap-2">
              <span>此赛题需要提供实名信息才能参与。</span>
              <v-btn color="primary" variant="tonal" size="small" :to="{ name: 'UserSettingsRealName' }">
                前往填写
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- 人数已满提示 -->
          <div v-if="userReasons[0]?.code === 'PARTICIPANT_LIMIT_REACHED'" class="mt-2 text-medium-emphasis">
            该赛题参与名额已满，请关注其他赛题。
          </div>
        </div>
      </template>
    </v-alert>

    <!-- 小队任务参与限制提示 -->
    <v-alert
      v-if="taskData?.submitterType === 'TEAM' && !canUserJoin && !taskData?.joined && !isDeadlinePassed"
      type="warning"
      class="mb-4"
      rounded="lg"
      title="小队不满足参与条件"
    >
      <template #text>
        <div class="mt-2">
          <!-- 没有小队的情况 -->
          <div v-if="noTeams" class="font-weight-medium">
            您需要创建或加入一个小队才能参与此赛题
            <div class="mt-2 d-flex align-center">
              <v-btn color="primary" variant="tonal" size="small" :to="{ name: 'HomeTeamsMine' }">
                前往管理我的小队
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </div>

          <!-- 有小队但都不符合条件的情况 -->
          <div v-else-if="hasTeamsButNoneEligible" class="font-weight-medium">
            您有 {{ teamCount }} 个小队，但没有符合条件的小队可以参与此赛题

            <v-expansion-panels variant="accordion" class="mt-3">
              <v-expansion-panel v-for="teamEligibility in teamEligibilityList" :key="teamEligibility.team.id">
                <v-expansion-panel-title class="py-2">
                  <div class="d-flex align-center">
                    <v-avatar size="24" class="mr-2">
                      <v-img
                        v-if="teamEligibility.team.avatarId"
                        :src="getAvatarUrl(teamEligibility.team.avatarId)"
                        alt="小队头像"
                      ></v-img>
                      <v-icon v-else>mdi-account-group</v-icon>
                    </v-avatar>
                    <span>{{ teamEligibility.team.name }}</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div v-for="(reason, index) in teamEligibility.eligibility.reasons" :key="index" class="mb-2">
                    <div class="font-weight-medium">
                      <v-icon color="warning" size="small" class="mr-1">mdi-alert-circle</v-icon>
                      {{ reason.message }}
                    </div>

                    <!-- 团队人数不满足要求 -->
                    <div v-if="reason.code === 'TEAM_SIZE_MIN_NOT_MET'" class="mt-1 text-medium-emphasis">
                      此赛题要求小队最少 {{ taskData.minTeamSize }} 人，请邀请更多成员加入您的小队。
                    </div>
                    <div v-if="reason.code === 'TEAM_SIZE_MAX_EXCEEDED'" class="mt-1 text-medium-emphasis">
                      此赛题要求小队最多 {{ taskData.maxTeamSize }} 人，您的小队人数超出限制。
                    </div>

                    <!-- 团队成员缺少实名信息 -->
                    <div v-if="reason.code === 'TEAM_MEMBER_MISSING_REAL_NAME'" class="mt-1">
                      <p class="text-medium-emphasis mb-2">
                        小队中有成员尚未提供实名信息，请通知相关成员完成实名验证。
                      </p>

                      <v-list
                        v-if="teamEligibility.team.memberRealNameStatus"
                        density="compact"
                        class="bg-grey-lighten-5 rounded-lg pa-0 mb-2"
                      >
                        <v-list-subheader class="text-caption font-weight-medium"
                          >未完成实名验证的成员：</v-list-subheader
                        >
                        <v-list-item
                          v-for="member in teamEligibility.team.memberRealNameStatus.filter((m) => !m.hasRealNameInfo)"
                          :key="member.memberId"
                          density="compact"
                          class="py-1"
                        >
                          <template #prepend>
                            <v-icon size="small" color="error" class="mr-2">mdi-account-alert</v-icon>
                          </template>
                          <v-list-item-title class="text-body-2">{{ member.userName }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </div>

                    <!-- 团队成员等级不足 -->
                    <div v-if="reason.code === 'TEAM_MEMBER_RANK_NOT_HIGH_ENOUGH'" class="mt-1 text-medium-emphasis">
                      小队中有成员等级不足，无法参与此难度的赛题。
                    </div>
                  </div>

                  <v-btn
                    color="primary"
                    variant="tonal"
                    size="small"
                    class="mt-2"
                    :to="{ name: 'TeamsDetailMembers', params: { teamId: teamEligibility.team.id } }"
                  >
                    管理此小队
                    <v-icon end>mdi-arrow-right</v-icon>
                  </v-btn>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <!-- 非小队原因导致的限制 -->
          <div v-else-if="userReasons.length > 0" class="font-weight-medium">
            {{ userReasons[0]?.message || '您当前无法参与此赛题' }}

            <!-- 根据不同原因显示不同提示 -->
            <div v-if="userReasons[0]?.code === 'USER_RANK_NOT_HIGH_ENOUGH'" class="mt-2 text-medium-emphasis">
              完成更多基础题目来提升您的等级，解锁更高难度的挑战。
            </div>

            <div v-if="userReasons[0]?.code === 'PARTICIPANT_LIMIT_REACHED'" class="mt-2 text-medium-emphasis">
              该赛题参与名额已满，请关注其他赛题。
            </div>
          </div>
        </div>
      </template>
    </v-alert>

    <v-row>
      <v-col cols="12" md="9" lg="8">
        <v-card flat rounded="lg" class="task-detail-card" border="sm">
          <v-card-item>
            <template #prepend>
              <div class="me-3">
                <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                  <v-icon color="primary" size="28">mdi-information-outline</v-icon>
                </v-avatar>
              </div>
            </template>
            <v-card-title class="text-h5 ps-0">赛题详情</v-card-title>
          </v-card-item>

          <v-card-text>
            <div class="task-description">
              <TipTapViewer v-if="isTipTapJson" :value="tipTapContent" />
              <div v-else-if="renderedMarkdown" class="markdown-body" v-html="renderedMarkdown" />
              <p v-else class="text-medium-emphasis">暂无赛题详情</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- 赛题视频 -->
        <v-card v-if="sanitizedVideoUrl" flat rounded="lg" class="mt-4 task-info-card" border="sm">
          <v-card-item>
            <template #prepend>
              <div class="me-3">
                <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                  <v-icon color="primary" size="28">mdi-video-outline</v-icon>
                </v-avatar>
              </div>
            </template>
            <v-card-title class="text-h5 ps-0">赛题视频</v-card-title>
          </v-card-item>
          <v-card-text>
            <div class="video-container">
              <iframe
                v-if="videoEmbedUrl"
                :src="videoEmbedUrl"
                frameborder="0"
                allowfullscreen
                style="width: 100%; aspect-ratio: 16/9; border-radius: 8px"
              />
              <div v-else class="d-flex align-center gap-2">
                <v-icon color="primary">mdi-open-in-new</v-icon>
                <a :href="sanitizedVideoUrl" target="_blank" rel="noopener">{{ sanitizedVideoUrl }}</a>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <v-card flat rounded="lg" class="mt-4 task-info-card" border="sm">
          <v-card-item>
            <template #prepend>
              <div class="me-3">
                <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                  <v-icon color="primary" size="28">mdi-information-outline</v-icon>
                </v-avatar>
              </div>
            </template>
            <v-card-title class="text-h5 ps-0">赛题信息</v-card-title>
          </v-card-item>

          <v-divider class="mx-6"></v-divider>

          <v-card-text class="px-6 py-4">
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">提交类型</div>
                <v-chip color="primary" variant="flat">
                  {{ taskData?.submitterType === 'USER' ? '个人任务' : '小队任务' }}
                </v-chip>
              </div>

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">难度等级</div>
                <div v-if="taskData?.space?.name?.includes('eTrip')">
                  <!-- 如果赛题属于 eTrip，则按照初级、中级、高级显示（分别对应 1,2,3） -->
                  <v-chip color="primary" variant="flat">
                    {{ taskData?.rank === 1 ? '初级' : taskData?.rank === 2 ? '中级' : '高级' }}
                  </v-chip>
                </div>
                <div v-else>
                  <v-rating
                    :model-value="rankStars"
                    color="amber"
                    half-increments
                    readonly
                    density="compact"
                  ></v-rating>
                </div>
              </div>

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">提交次数</div>
                <v-chip :color="taskData?.resubmittable ? 'success' : 'warning'" variant="flat">
                  {{ taskData?.resubmittable ? '可多次提交' : '仅可提交一次' }}
                </v-chip>
              </div>

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">
                  {{ taskData?.submitterType === 'TEAM' ? '队伍数量限制' : '参与者人数限制' }}
                </div>
                <div class="d-flex align-center">
                  <v-chip v-if="taskData?.participantLimit" color="primary" variant="flat">
                    {{ taskData.participantLimit }} {{ taskData?.submitterType === 'TEAM' ? '队' : '人' }}
                  </v-chip>
                  <span v-else class="text-primary font-weight-medium">不限</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3" lg="4">
        <v-card flat rounded="lg" class="task-info-card" border="sm">
          <v-card-item>
            <template #prepend>
              <div class="me-3">
                <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                  <v-icon color="primary" size="28">mdi-clock-outline</v-icon>
                </v-avatar>
              </div>
            </template>
            <v-card-title class="text-h5 ps-0">时间信息</v-card-title>
          </v-card-item>

          <v-divider class="mx-6"></v-divider>

          <v-card-text class="px-6 py-4">
            <div class="d-flex flex-column gap-3">
              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">报名截止时间</div>
                <div class="d-flex align-center">
                  <span class="text-primary font-weight-medium">
                    {{ formatTaskDate(taskData?.deadline) }}
                  </span>
                  <v-chip v-if="isDeadlineSoon(taskData?.deadline)" color="error" size="small" class="ms-2">
                    即将截止
                  </v-chip>
                </div>
              </div>

              <v-divider></v-divider>

              <div class="d-flex justify-space-between align-center">
                <div class="text-subtitle-1">默认提交期限</div>
                <div class="text-primary font-weight-medium">{{ taskData?.defaultDeadline || 0 }} 天</div>
              </div>

              <div v-if="taskData?.joined && taskUserDeadline" class="mt-2">
                <v-alert type="info" variant="tonal" density="comfortable" rounded="lg">
                  <template #text>
                    <div class="d-flex align-center justify-space-between">
                      <span>您的提交截止时间：</span>
                      <CountdownTimer :deadline="taskUserDeadline" label="" class="text-right" />
                    </div>
                  </template>
                </v-alert>
              </div>
            </div>
          </v-card-text>
        </v-card>
        <v-card flat rounded="lg" class="gradient-card cursor-pointer mt-4" elevation="0" @click="goToAIAdvice">
          <v-card-text class="pa-6">
            <div class="d-flex align-center gap-4">
              <v-avatar color="primary-lighten-4" size="56" class="elevation-0">
                <v-icon color="primary" size="32">mdi-robot</v-icon>
              </v-avatar>

              <div class="flex-grow-1">
                <div class="text-h5 font-weight-bold d-flex flex-wrap align-center gap-2">
                  <span>启星研导 <span class="text-primary">Navigator AI</span></span>
                </div>
                <div class="text-medium-emphasis">为您解析赛题核心，推荐学习路径，助力科研探索</div>
              </div>

              <v-btn
                color="primary"
                variant="tonal"
                rounded="pill"
                :to="{ name: 'TasksAIAdvice', params: { taskId: taskData?.id } }"
                class="px-4"
              >
                查看建议
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 赛题详情 -->
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/types'

import { computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { VBtn } from 'vuetify/components'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import { MarkdownRenderer } from '@/components/chat/services/markdownRenderer'
import { TaskParticipationInfo } from '@/network/api/tasks/types'
import AccountService from '@/services/account'

/** Markdown 渲染器实例，用于将非 TipTap 格式的赛题描述渲染为 HTML */
const markdownRenderer = new MarkdownRenderer()

const TipTapViewer = defineAsyncComponent(() => import('@/components/common/Editor/TipTapViewer.vue'))
const CountdownTimer = defineAsyncComponent(() => import('@/components/common/CountdownTimer.vue'))

const props = defineProps<{
  taskData: Task | null
  participationInfo: TaskParticipationInfo | null
}>()

const router = useRouter()

const formatTaskDate = (date: number | string | Date | undefined) => {
  if (!date) return '未设置'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const isDeadlineSoon = (date: number | string | Date | undefined) => {
  if (!date) return false
  const deadlineDate = dayjs(date)
  const now = dayjs()
  // 如果截止时间在3天内
  return deadlineDate.diff(now, 'day') <= 3 && deadlineDate.isAfter(now)
}

const isSelfTask = computed(() => {
  return props.taskData?.creator.id === AccountService.user?.id
})

/** 判断赛题描述是否为 TipTap JSON 格式（包含 type: 'doc' 的对象） */
const isTipTapJson = computed(() => {
  const raw = props.taskData?.description ?? ''
  if (!raw) return false
  try {
    const parsed = JSON.parse(raw)
    // TipTap JSON 是对象且包含 type: 'doc'
    return typeof parsed === 'object' && parsed !== null && parsed.type === 'doc'
  } catch {
    return false
  }
})

/** 解析 TipTap JSON 内容，解析失败时返回空文档结构 */
const tipTapContent = computed(() => {
  try {
    return JSON.parse(props.taskData?.description ?? '{}')
  } catch {
    return { type: 'doc', content: [] }
  }
})

/** 将非 TipTap 格式的赛题描述作为 Markdown 渲染为 HTML，TipTap 格式时返回空字符串 */
const renderedMarkdown = computed(() => {
  const raw = props.taskData?.description ?? ''
  if (!raw || isTipTapJson.value) return ''
  return markdownRenderer.render(raw)
})

const rankStars = computed(() => {
  return props.taskData?.rank ? props.taskData.rank : 0
})

/** 校验 videoUrl 是否为安全的 HTTP(S) 协议，防止 javascript:/data: XSS */
const sanitizedVideoUrl = computed(() => {
  const url = props.taskData?.videoUrl
  if (!url) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return url
    }
  } catch {
    // invalid URL
  }
  return null
})

const videoEmbedUrl = computed(() => {
  const url = props.taskData?.videoUrl
  if (!url) return null

  // Bilibili: https://www.bilibili.com/video/BVxxxx or https://b23.tv/xxxx
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[\w]+)/)
  if (bvMatch) {
    return `//player.bilibili.com/player.html?bvid=${bvMatch[1]}&autoplay=0`
  }

  // YouTube: https://www.youtube.com/watch?v=xxxx or https://youtu.be/xxxx
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (ytMatch) {
    return `//www.youtube.com/embed/${ytMatch[1]}`
  }

  return null
})

const taskUserDeadline = computed(() => {
  return props.taskData?.userDeadline
})

const isDeadlinePassed = computed(() => {
  if (!props.taskData?.deadline) return false
  return dayjs(props.taskData.deadline).isBefore(dayjs())
})

const canUserJoin = computed(() => {
  if (!props.taskData) return false

  // 对于个人任务，检查用户是否可以参与
  if (props.taskData.submitterType === 'USER') {
    return !!props.taskData.participationEligibility?.user?.eligible
  } else {
    return !!props.taskData.participationEligibility?.teams?.some((team) => team.eligibility.eligible)
  }
})

const userReasons = computed(() => {
  return props.taskData?.participationEligibility?.user?.reasons || []
})

const teamEligibilityList = computed(() => {
  return props.taskData?.participationEligibility?.teams || []
})

const teamCount = computed(() => {
  return teamEligibilityList.value.length
})

const noTeams = computed(() => {
  return teamCount.value === 0
})

const hasTeamsButNoneEligible = computed(() => {
  return teamCount.value > 0 && !teamEligibilityList.value.some((team) => team.eligibility.eligible)
})

const goToAIAdvice = () => {
  if (props.taskData) {
    router.push({
      name: 'TasksAIAdvice',
      params: { taskId: props.taskData.id },
    })
  }
}
</script>

<style scoped>
.task-description {
  font-size: 1rem;
  line-height: 1.6;
}

/* Markdown 渲染内容样式 */
.markdown-body :deep(h1) {
  font-size: 1.75rem;
  margin: 1.5rem 0 1rem;
  font-weight: 700;
}
.markdown-body :deep(h2) {
  font-size: 1.5rem;
  margin: 1.25rem 0 0.75rem;
  font-weight: 600;
}
.markdown-body :deep(h3) {
  font-size: 1.25rem;
  margin: 1rem 0 0.5rem;
  font-weight: 600;
}
.markdown-body :deep(p) {
  margin: 0.5rem 0;
}
.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}
.markdown-body :deep(li) {
  margin: 0.25rem 0;
}
.markdown-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}
.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid rgba(var(--v-border-color), 1);
  padding: 0.5rem 0.75rem;
  text-align: left;
}
.markdown-body :deep(th) {
  background: rgba(var(--v-theme-primary), 0.06);
  font-weight: 600;
}
.markdown-body :deep(blockquote) {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding: 0.5rem 1rem;
  margin: 0.75rem 0;
  background: rgba(var(--v-theme-primary), 0.04);
  border-radius: 0 4px 4px 0;
}
.markdown-body :deep(code) {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.9em;
}
.markdown-body :deep(pre) {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.75rem 0;
}
.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
}
.markdown-body :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 0.75rem 0;
}
.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid rgba(var(--v-border-color), 1);
  margin: 1.5rem 0;
}

.task-detail-card,
.task-info-card {
  transition: all 0.3s ease;
}

.gradient-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.15) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.gradient-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1) !important;
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

.cursor-pointer {
  cursor: pointer;
}
</style>
