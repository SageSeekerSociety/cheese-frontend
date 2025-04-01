<template>
  <div>
    <v-card flat rounded="lg" class="mb-4 ai-advice-header-card">
      <v-card-text class="pa-6">
        <div class="d-flex align-center flex-wrap gap-4">
          <v-avatar color="primary-lighten-4" size="56" class="elevation-0">
            <v-icon color="primary" size="32">mdi-robot</v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <div class="text-h5 font-weight-bold d-flex flex-wrap align-center">
              启星研导 <span class="text-primary ml-2">Navigator AI</span>
            </div>
            <div class="text-medium-emphasis">为您解析赛题核心，推荐学习路径，助力科研探索</div>
          </div>

          <v-chip color="primary" variant="outlined" class="powered-by">
            <v-icon start>mdi-brain</v-icon>
            <div class="text-caption">Powered by 知启星 AI & DeepSeek-R1</div>
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <!-- 使用AIAdvicePanel组件，添加视觉容器 -->
    <AIAdvicePanel
      :task-id="taskData?.id || 0"
      :submitter-type="taskData?.submitterType || 'USER'"
      :loading="loading"
      :error="error"
      :advice="aiAdvice"
      @retry="fetchAIAdvice"
    />
  </div>
</template>

<script setup lang="ts">
import type { TaskAIAdvice } from '@/network/api/tasks/types'
import type { Task } from '@/types'

import { defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'

import { TasksApi } from '@/network/api/tasks'

const AIAdvicePanel = defineAsyncComponent(() => import('@/components/tasks/AIAdvicePanel.vue'))

const props = defineProps<{
  taskData: Task | null
}>()

// 状态
const aiAdvice = ref<TaskAIAdvice | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const pollingTimer = ref<number | null>(null)

// 轮询方法
const startPolling = () => {
  if (pollingTimer.value) return

  pollingTimer.value = window.setInterval(async () => {
    try {
      if (!props.taskData?.id) return

      const { data: statusData } = await TasksApi.getAIAdviceStatus(props.taskData.id)

      if (statusData.status === 'COMPLETED') {
        // 状态完成后，获取建议内容
        const { data: adviceData } = await TasksApi.getAIAdvice(props.taskData.id)
        aiAdvice.value = adviceData
        loading.value = false
        stopPolling()
      } else if (statusData.status === 'FAILED') {
        // 生成失败
        error.value = '生成建议失败，请重试'
        loading.value = false
        stopPolling()
      }
    } catch (err: any) {
      error.value = err instanceof Error ? err.message : '获取建议失败'
      loading.value = false
      stopPolling()
    }
  }, 2000) // 每2秒轮询一次
}

const stopPolling = () => {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value)
    pollingTimer.value = null
  }
}

const fetchAIAdvice = async () => {
  if (!props.taskData?.id) return

  loading.value = true
  error.value = null

  try {
    // 先尝试获取现有的建议
    try {
      const { data: existingAdvice } = await TasksApi.getAIAdvice(props.taskData.id)
      if (existingAdvice) {
        aiAdvice.value = existingAdvice
        loading.value = false
        return
      }
    } catch (err) {
      // 如果没有现有建议，继续请求生成
    }

    // 请求生成新建议
    const { data: requestData } = await TasksApi.requestAIAdvice(props.taskData.id)

    if (requestData.status === 'FAILED') {
      error.value = '生成建议失败，请重试'
      loading.value = false
    } else if (requestData.status === 'COMPLETED') {
      // 如果已经生成完成，直接获取结果
      const { data: adviceData } = await TasksApi.getAIAdvice(props.taskData.id)
      aiAdvice.value = adviceData
      loading.value = false
    } else {
      // 开始轮询
      startPolling()
    }
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : '获取建议失败'
    loading.value = false
  }
}

// 生命周期
onMounted(() => {
  fetchAIAdvice()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.ai-advice-header-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.04) 0%, rgba(var(--v-theme-primary), 0.12) 100%);
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.ai-advice-header-card:hover {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.08) !important;
}

.advice-content-card {
  background-color: var(--v-theme-surface);
  border: 1px solid rgba(var(--v-border-color), 0.1);
  transition: all 0.3s ease;
}

.powered-by {
  height: 28px;
}

@media (max-width: 600px) {
  .ai-advice-header-card .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>
