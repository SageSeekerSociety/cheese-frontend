<template>
  <div class="assistant-landing">
    <div class="assistant-landing__content">
      <v-avatar size="88" class="assistant-landing__avatar">
        <v-icon icon="mdi-assistant" size="48" color="primary"></v-icon>
      </v-avatar>
      <h1 class="assistant-landing__headline">{{ greetingHeadline }}</h1>
      <p class="assistant-landing__subheadline">{{ greetingSubtitle }}</p>
      <div class="assistant-landing__input">
        <div class="assistant-landing__input-shell">
          <ChatInput
            v-model="inputMessage"
            :loading="isStartingConversation"
            @send="handleSendMessage"
            @stop="handleStopGeneration"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import ChatInput from '@/components/assistant/ChatInput.vue'
import accountService from '@/services/account'
import { assistantService } from '@/services/assistantService'

const router = useRouter()
const inputMessage = ref('')
const isStartingConversation = ref(false)

const displayName = computed(() => accountService.user?.nickname || accountService.user?.username || '')

const greetingHeadline = ref('')
const friendlyPhrases = [
  '我已经准备好了，随时倾听你的想法。',
  '说吧，今天想先处理哪件事？',
  '需要我从哪里开始帮忙？',
  '让我们一起把心里的思路理清。',
  '我正等着你的新点子。',
  '给我一句话，我们马上出发。',
  '把困难交给我，放心大胆向前吧。',
]
const greetingSubtitle = ref(friendlyPhrases[Math.floor(Math.random() * friendlyPhrases.length)])

const selectRandomPhrase = () => friendlyPhrases[Math.floor(Math.random() * friendlyPhrases.length)]

const refreshHeadline = () => {
  const now = new Date()
  const hour = now.getHours()
  let prefix: string
  if (hour < 6) prefix = '夜深了'
  else if (hour < 9) prefix = '早上好'
  else if (hour < 12) prefix = '上午好'
  else if (hour < 14) prefix = '中午好'
  else if (hour < 18) prefix = '下午好'
  else if (hour < 22) prefix = '晚上好'
  else prefix = '夜色已深'

  const name = displayName.value
  greetingHeadline.value = name ? `${prefix}，${name}` : prefix
}

let refreshTimer: number | null = null
const scheduleHeadlineRefresh = () => {
  refreshHeadline()
  const now = new Date()
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
  refreshTimer = window.setTimeout(scheduleHeadlineRefresh, msUntilNextMinute)
}

onMounted(() => {
  scheduleHeadlineRefresh()
})

onBeforeUnmount(() => {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
})

watch(
  displayName,
  () => {
    refreshHeadline()
    greetingSubtitle.value = selectRandomPhrase()
  },
  { immediate: true }
)

const navigateToConversation = async (message: string) => {
  if (isStartingConversation.value) return
  isStartingConversation.value = true
  try {
    const conversationId = await assistantService.startNewConversation()
    await router.push({
      name: 'AssistantConversation',
      params: { conversationId },
      query: { initialMessage: message },
    })
  } catch (error) {
    console.error('创建对话失败:', error)
  } finally {
    isStartingConversation.value = false
  }
}

const handleSendMessage = (rawMessage: string) => {
  const message = rawMessage.trim()
  if (!message) return
  inputMessage.value = ''
  void navigateToConversation(message)
}

const handleStopGeneration = () => {
  isStartingConversation.value = false
}
</script>

<style scoped>
.assistant-landing {
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 8vw, 7rem) 1.5rem;
  box-sizing: border-box;
  background: radial-gradient(circle at top, rgba(var(--v-theme-primary), 0.06), transparent 60%),
    rgba(var(--v-theme-surface), 1);
}

.assistant-landing__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  max-width: 720px;
  width: 100%;
}

.assistant-landing__avatar {
  background-color: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 6px 24px rgba(var(--v-theme-primary), 0.18);
}

.assistant-landing__headline {
  font-size: clamp(1.9rem, 3.4vw, 2.6rem);
  font-weight: 600;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.9);
  letter-spacing: 0.02em;
  margin: 0;
}

.assistant-landing__subheadline {
  margin: 0;
  text-align: center;
  font-size: 1.05rem;
  color: rgba(var(--v-theme-on-surface), 0.62);
}

.assistant-landing__input {
  width: min(680px, 100%);
  margin-top: 1rem;
}

.assistant-landing__input-shell {
  border-radius: 18px;
  box-shadow:
    0 18px 40px -28px rgba(var(--v-theme-primary), 0.65),
    0 24px 64px rgba(var(--v-theme-primary), 0.12);
  background: rgba(var(--v-theme-surface), 0.9);
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
  /* padding: 0.5rem 0.75rem; */
  backdrop-filter: blur(14px);
}

.assistant-landing__input-shell :deep(.chat-input__toolbar) {
  padding-bottom: 0.25rem;
}
</style>
