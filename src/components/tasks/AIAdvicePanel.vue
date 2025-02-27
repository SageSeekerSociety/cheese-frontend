<template>
  <div class="d-flex flex-column gap-3">
    <!-- 添加浮动的 AI 对话按钮 -->
    <v-fade-transition>
      <v-fab
        class="ai-chat-fab"
        app
        color="primary"
        extended
        prepend-icon="mdi-creation"
        text="与 AI 助手对话"
        :active="!chatDialogOpen"
        @click="openGeneralChat"
      ></v-fab>
    </v-fade-transition>

    <v-alert
      type="warning"
      variant="tonal"
      density="compact"
      rounded="lg"
      class="border-0"
      icon="mdi-alert"
      color="amber-darken-2"
      text="本建议由 AI 生成，仅供参考。请结合实际情况二次验证内容准确性，如有疑问请咨询领域专家。"
    ></v-alert>

    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <div class="mt-4 text-body-1">AI 正在分析赛题，请稍候...</div>
    </v-card-text>

    <v-card-text v-else-if="error" class="text-center py-8">
      <v-icon color="error" size="64">mdi-alert-circle</v-icon>
      <div class="mt-4 text-body-1">获取建议失败：{{ error }}</div>
      <v-btn class="mt-4" color="primary" variant="flat" @click="$emit('retry')">重试</v-btn>
    </v-card-text>

    <template v-else>
      <v-container fluid class="pa-0">
        <v-row dense>
          <!-- 主题总结 -->
          <v-col cols="12" md="6">
            <v-card flat rounded="lg" class="pb-2 h-100 advice-card">
              <v-card-title class="bg-primary-lighten-4 rounded-t-lg text-subtitle-1 py-3 px-4 d-flex align-center">
                <v-icon size="20" class="me-2" color="primary">mdi-text-box-search</v-icon>
                <span class="font-weight-medium">主题总结</span>
              </v-card-title>
              <v-card-text class="px-4 pt-4">
                <div class="text-h6 text-primary mb-3 font-weight-medium">{{ advice?.topic_summary.title }}</div>
                <v-list density="compact" class="pa-0 bg-transparent">
                  <v-list-item
                    v-for="(point, index) in advice?.topic_summary.key_points"
                    :key="index"
                    class="pa-0 mb-2"
                  >
                    <template #prepend>
                      <v-icon color="primary" size="small" class="me-2">mdi-check-circle-outline</v-icon>
                    </template>
                    <v-list-item-title class="text-body-2">{{ point }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 知识领域 -->
          <v-col cols="12" md="6">
            <v-card flat rounded="lg" class="pb-2 h-100 advice-card">
              <v-card-title class="bg-primary-lighten-4 rounded-t-lg text-subtitle-1 py-3 px-4 d-flex align-center">
                <v-icon size="20" class="me-2" color="primary">mdi-lightbulb-on</v-icon>
                <span class="font-weight-medium">知识领域</span>
              </v-card-title>
              <v-card-text class="pa-4">
                <div class="d-flex flex-column gap-3">
                  <v-card
                    v-for="(field, index) in advice?.knowledge_fields"
                    :key="index"
                    flat
                    class="pa-3 rounded-lg knowledge-field-card border"
                  >
                    <div class="d-flex justify-space-between align-center mb-1">
                      <div class="text-subtitle-1 font-weight-medium text-primary">{{ field.name }}</div>
                      <v-btn
                        icon="mdi-comment-question"
                        variant="text"
                        density="comfortable"
                        color="primary"
                        @click="openChat('knowledge_fields', index)"
                      >
                      </v-btn>
                    </div>
                    <div class="text-body-2 text-medium-emphasis">{{ field.description }}</div>
                    <div v-if="field.followup_questions?.length" class="mt-3">
                      <div class="d-flex flex-wrap gap-1">
                        <v-chip
                          v-for="(q, i) in field.followup_questions"
                          :key="i"
                          size="small"
                          color="primary"
                          variant="flat"
                          class="text-caption"
                          @click="openChat('knowledge_fields', index, q)"
                        >
                          {{ q }}
                        </v-chip>
                      </div>
                    </div>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 学习路径 -->
          <v-col cols="12" md="6">
            <v-card flat rounded="lg" class="pb-2 h-100 advice-card">
              <v-card-title class="bg-primary-lighten-4 rounded-t-lg text-subtitle-1 py-3 px-4 d-flex align-center">
                <v-icon size="20" class="me-2" color="primary">mdi-map-marker-path</v-icon>
                <span class="font-weight-medium">学习路径</span>
              </v-card-title>
              <v-card-text class="pa-4">
                <v-timeline density="compact" align="start" side="end" class="learning-timeline pa-0">
                  <v-timeline-item
                    v-for="(path, index) in advice?.learning_paths"
                    :key="index"
                    dot-color="primary"
                    size="small"
                    class="mb-3"
                  >
                    <template #icon>
                      <v-avatar color="primary" size="22" class="path-step-number">
                        <span class="text-caption text-white">{{ index + 1 }}</span>
                      </v-avatar>
                    </template>
                    <div class="d-flex flex-column">
                      <div class="text-subtitle-2 font-weight-medium text-primary">{{ path.stage }}</div>
                      <div class="text-body-2">{{ path.description }}</div>
                      <div class="mt-2 d-flex flex-wrap gap-1">
                        <v-chip
                          v-for="(resource, i) in path.resources"
                          :key="i"
                          size="x-small"
                          variant="flat"
                          color="secondary"
                          :href="resource.url"
                          target="_blank"
                          prepend-icon="mdi-open-in-new"
                          class="text-caption py-1"
                        >
                          <v-icon start size="14">{{ getResourceIcon(resource.type) }}</v-icon>
                          {{ resource.name }}
                        </v-chip>
                      </div>
                      <div v-if="path.followup_questions?.length" class="mt-2">
                        <div class="d-flex flex-wrap gap-1">
                          <v-chip
                            v-for="(q, i) in path.followup_questions"
                            :key="i"
                            size="small"
                            color="primary"
                            variant="flat"
                            class="text-caption"
                            @click="openChat('learning_paths', index, q)"
                          >
                            {{ q }}
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 实践方法论 -->
          <v-col cols="12" md="6">
            <v-card flat rounded="lg" class="pb-2 h-100 advice-card">
              <v-card-title class="bg-primary-lighten-4 rounded-t-lg text-subtitle-1 py-3 px-4 d-flex align-center">
                <v-icon size="20" class="me-2" color="primary">mdi-puzzle</v-icon>
                <span class="font-weight-medium">实践方法论</span>
              </v-card-title>
              <v-card-text class="pa-4">
                <v-timeline density="compact" align="start" side="end" class="methodology-timeline pa-0">
                  <v-timeline-item
                    v-for="(step, index) in advice?.methodology"
                    :key="index"
                    dot-color="primary"
                    size="small"
                    class="mb-3"
                  >
                    <template #icon>
                      <v-avatar color="primary" size="22" class="step-number">
                        <span class="text-caption text-white">{{ index + 1 }}</span>
                      </v-avatar>
                    </template>
                    <div class="d-flex flex-column">
                      <div class="text-subtitle-2 font-weight-medium text-primary">{{ step.step }}</div>
                      <div class="text-body-2">{{ step.description }}</div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        <v-icon size="14" class="me-1">mdi-clock-outline</v-icon>
                        预计耗时：{{ step.estimated_time }}
                      </div>
                      <div v-if="step.followup_questions?.length" class="mt-2">
                        <div class="d-flex flex-wrap gap-1">
                          <v-chip
                            v-for="(q, i) in step.followup_questions"
                            :key="i"
                            size="small"
                            color="primary"
                            variant="flat"
                            class="text-caption"
                            @click="openChat('methodology', index, q)"
                          >
                            {{ q }}
                          </v-chip>
                        </div>
                      </div>
                    </div>
                  </v-timeline-item>
                </v-timeline>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- 团队协作建议 - 在大屏占据整行 -->
          <v-col v-if="submitterType === 'TEAM'" cols="12">
            <v-card flat rounded="lg" class="pb-2 advice-card">
              <v-card-title class="bg-primary-lighten-4 rounded-t-lg text-subtitle-1 py-3 px-4 d-flex align-center">
                <v-icon size="20" class="me-2" color="primary">mdi-account-group</v-icon>
                <span class="font-weight-medium">团队协作建议</span>
              </v-card-title>
              <v-card-text class="pa-4">
                <v-row dense>
                  <v-col v-for="(tip, index) in advice?.team_tips" :key="index" cols="12" sm="6" md="4">
                    <v-card flat class="rounded-lg border h-100 team-role-card">
                      <div class="position-relative pa-4">
                        <v-card-title class="px-0 pt-0 pb-2 text-subtitle-2 font-weight-medium text-primary">
                          {{ tip.role }}
                        </v-card-title>
                        <v-card-text class="px-0 py-1">
                          <div class="text-body-2">{{ tip.description }}</div>
                          <v-divider class="my-3" />
                          <div class="text-body-2">
                            <span class="font-weight-medium">协作要点：</span>
                            {{ tip.collaboration_tips }}
                          </div>
                          <div v-if="tip.followup_questions?.length" class="mt-3">
                            <div class="d-flex flex-wrap gap-1">
                              <v-chip
                                v-for="(q, i) in tip.followup_questions"
                                :key="i"
                                size="small"
                                color="primary"
                                variant="flat"
                                class="text-caption"
                                @click="openChat('team_tips', index, q)"
                              >
                                {{ q }}
                              </v-chip>
                            </div>
                          </div>
                        </v-card-text>
                        <v-avatar
                          color="primary"
                          size="24"
                          class="team-role-number position-absolute"
                          style="top: 0.75rem; right: 0.75rem"
                        >
                          <span class="text-caption text-white">{{ index + 1 }}</span>
                        </v-avatar>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>

    <!-- 对话框组件 -->
    <AIAdviceChatDialog
      ref="chatDialogRef"
      v-model="chatDialogOpen"
      :task-id="taskId"
      :context="selectedContext"
      @clear-context="clearContext"
    />
  </div>
</template>

<script setup lang="ts">
import type { TaskAIAdvice, TaskAIAdviceConversationContext } from '@/network/api/tasks/types'

import { nextTick, ref } from 'vue'

import AIAdviceChatDialog from './AIAdviceChatDialog.vue'

import { TaskSubmitterType } from '@/types'

const props = defineProps<{
  taskId: number
  submitterType: TaskSubmitterType
  loading: boolean
  error: string | null
  advice: TaskAIAdvice | null
}>()

defineEmits<{
  (e: 'retry'): void
}>()

const chatDialogRef = ref<InstanceType<typeof AIAdviceChatDialog> | null>(null)
const chatDialogOpen = ref(false)
const selectedContext = ref<TaskAIAdviceConversationContext | undefined>()

const getResourceIcon = (type: string) => {
  const icons: Record<string, string> = {
    video: 'mdi-video',
    article: 'mdi-book-open',
    course: 'mdi-school',
    github: 'mdi-github',
    paper: 'mdi-file-document',
    website: 'mdi-web',
  }
  return icons[type.toLowerCase()] || 'mdi-link'
}

const clearContext = () => {
  selectedContext.value = undefined
  console.trace('clearContext', selectedContext.value)
}

const getDisplayName = (section: TaskAIAdviceConversationContext['section'], index: number) => {
  if (section === 'knowledge_fields') {
    return props.advice?.knowledge_fields?.[index]?.name
  }
  if (section === 'learning_paths') {
    return props.advice?.learning_paths?.[index]?.stage
  }
  if (section === 'methodology') {
    return props.advice?.methodology?.[index]?.step
  }
  if (section === 'team_tips') {
    return props.advice?.team_tips?.[index]?.role
  }
  return null
}

const openChat = (section: TaskAIAdviceConversationContext['section'], index: number, question?: string) => {
  selectedContext.value = { section, index, displayName: getDisplayName(section, index) }

  // 如果传入了问题，使用nextTick确保对话框已打开后再发送
  nextTick(() => {
    chatDialogOpen.value = true
    nextTick(() => {
      if (question && chatDialogRef.value) {
        console.log('openChat', selectedContext.value)
        chatDialogRef.value.sendMessage(question)
      }
    })
  })
}

const openGeneralChat = () => {
  clearContext()
  chatDialogOpen.value = true
}
</script>

<style scoped>
.learning-timeline,
.methodology-timeline {
  max-height: 450px;
  overflow-y: auto;
}

.advice-card {
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), 0.1);
}

.advice-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.knowledge-field-card {
  border-color: rgba(var(--v-border-color), 0.1) !important;
  transition: all 0.2s ease;
}

.knowledge-field-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.team-role-card {
  border-color: rgba(var(--v-border-color), 0.1) !important;
  transition: all 0.2s ease;
}

.team-role-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
  background-color: rgba(var(--v-theme-primary), 0.02);
}

/* 自定义滚动条样式 */
.learning-timeline::-webkit-scrollbar,
.methodology-timeline::-webkit-scrollbar {
  width: 4px;
}

.learning-timeline::-webkit-scrollbar-track,
.methodology-timeline::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.learning-timeline::-webkit-scrollbar-thumb,
.methodology-timeline::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}

.path-step-number,
.step-number {
  box-shadow: 0 0 0 2px white;
}

.team-role-number {
  box-shadow: 0 0 0 2px white;
}

.ai-chat-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-chat-fab:hover {
  transform: scale(1.05);
}
</style>
