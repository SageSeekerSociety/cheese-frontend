<template>
  <div class="conversation-view h-100">
    <div v-if="loading" class="d-flex justify-center align-center h-100">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <div v-else-if="error" class="d-flex justify-center align-center h-100">
      <v-alert type="error" title="加载失败" :text="error"></v-alert>
    </div>

    <!-- 对话内容区域 -->
    <div v-else ref="messagesAreaRef" class="conversation-container h-100 w-100">
      <div class="message-list py-4 w-100">
        <ChatMessage v-for="message in messages" :key="message.id" :message="message" class="mb-4" />
      </div>

      <div class="input-area-wrapper w-100">
        <div class="input-area">
          <ChatInput
            v-model="inputMessage"
            :loading="isSending"
            @send="handleSendMessage"
            @stop="handleStopGeneration"
          />
        </div>
        <div class="text-caption text-medium-emphasis text-center py-2">AI 回答仅供参考，请注意核实。</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAssistantChat } from '@/composables/useAssistantChat'

import ChatInput from '@/components/assistant/ChatInput.vue'
import ChatMessage from '@/components/assistant/ChatMessage.vue'
import { assistantService } from '@/services/assistantService'

interface Props {
  conversationId: string
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()

const activeConversationId = computed(() =>
  (props.conversationId || (route.params.conversationId as string) || '').toString()
)

const loading = ref(true)
const error = ref('')
const inputMessage = ref('')
const messagesAreaRef = ref<HTMLElement | null>(null)

const { messages, isSending, loadHistory, sendMessage, stopGeneration, registerScrollContainer, resetMessages } =
  useAssistantChat({
    loadHistory: async () => {
      const conversationId = activeConversationId.value
      if (!conversationId) return []
      return assistantService.loadConversationMessages(conversationId)
    },
    streamMessage: (options) => {
      const conversationId = activeConversationId.value
      if (!conversationId) {
        throw new Error('缺少对话ID，无法发送消息')
      }
      return assistantService.streamConversationMessage(conversationId, options)
    },
  })

watch(
  messagesAreaRef,
  (el) => {
    registerScrollContainer(el ?? null)
  },
  { immediate: true }
)

const cleanupInitialMessageQuery = () => {
  if (!('initialMessage' in route.query)) return
  const query = { ...route.query }
  delete query.initialMessage
  void router.replace({ path: route.path, query })
}

const trySendInitialMessage = () => {
  const value = route.query.initialMessage
  if (typeof value !== 'string') return
  const message = value.trim()
  cleanupInitialMessageQuery()
  if (!message) return
  inputMessage.value = ''
  void sendMessage(message)
}

const refreshConversation = async () => {
  const conversationId = activeConversationId.value
  if (!conversationId) {
    resetMessages()
    loading.value = false
    error.value = ''
    cleanupInitialMessageQuery()
    return
  }

  loading.value = true
  error.value = ''
  resetMessages()

  try {
    await loadHistory()
    trySendInitialMessage()
  } catch (err) {
    console.error('加载对话失败:', err)
    error.value = '加载对话失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void refreshConversation()
})

watch(
  () => activeConversationId.value,
  () => {
    void refreshConversation()
  }
)

watch(
  () => route.query.initialMessage,
  () => {
    if (!loading.value) trySendInitialMessage()
  }
)

const handleSendMessage = (rawMessage: string) => {
  const message = rawMessage.trim()
  if (!message || !activeConversationId.value) return
  inputMessage.value = ''
  void sendMessage(message)
}

const handleStopGeneration = () => {
  stopGeneration()
}
</script>

<style scoped>
.message-list,
.input-area-wrapper {
  max-width: 40rem;
  margin: 0 auto;
}

.conversation-view {
  display: flex;
  flex-direction: column;
}

.conversation-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
  overflow-y: auto;
  margin: 0 auto;
  width: 100%;
  container-type: inline-size;
  container-name: conversation;
}

@container conversation (min-width: 64rem) {
  .message-list,
  .input-area-wrapper {
    max-width: 48rem;
  }
}

.input-area-wrapper {
  position: sticky;
  bottom: 0;
  margin-top: auto;
  background-color: rgba(var(--v-theme-surface), 0.85);

  @supports (backdrop-filter: blur(16px)) {
    backdrop-filter: blur(16px);
  }
}

.input-area {
  border-radius: 12px;
  box-shadow:
    0 18px 40px -28px rgba(var(--v-theme-primary), 0.65),
    0 24px 64px rgba(var(--v-theme-primary), 0.12);
}
</style>
