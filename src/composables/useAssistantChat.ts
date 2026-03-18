import type { AssistantMessage, AssistantStreamEvent, StreamMessageOptions } from '@/types/assistant'

import { nextTick, type Ref, ref } from 'vue'

import { ResponseBuilder } from '@/services/response-builder'

interface UseAssistantChatOptions {
  loadHistory?: () => Promise<AssistantMessage[]>
  streamMessage: (options: StreamMessageOptions) => AsyncGenerator<AssistantStreamEvent>
}

const isLocalMessage = (id: string) => id.startsWith('local_')

export const useAssistantChat = (options: UseAssistantChatOptions) => {
  const messages = ref<AssistantMessage[]>([])
  const isSending = ref(false)
  const isLoadingHistory = ref(false)
  const lastHistoryError = ref<unknown>(null)
  const scrollContainer: Ref<HTMLElement | null> = ref(null)

  let currentAbortController: AbortController | null = null
  let stoppedManually = false

  const registerScrollContainer = (el: HTMLElement | null) => {
    scrollContainer.value = el
  }

  const scrollToBottom = () => {
    const container = scrollContainer.value
    if (container) container.scrollTop = container.scrollHeight
  }

  const findLastServerMessageId = () => {
    for (let i = messages.value.length - 1; i >= 0; i -= 1) {
      const candidate = messages.value[i]
      if (!isLocalMessage(candidate.id)) return candidate.id
    }
    return null
  }

  const loadHistory = async () => {
    if (!options.loadHistory) return
    isLoadingHistory.value = true
    lastHistoryError.value = null
    try {
      const history = await options.loadHistory()
      messages.value = history
      await nextTick()
      scrollToBottom()
    } catch (error) {
      lastHistoryError.value = error
      throw error
    } finally {
      isLoadingHistory.value = false
    }
  }

  const stopGeneration = () => {
    stoppedManually = true
    isSending.value = false
    try {
      currentAbortController?.abort()
    } catch (error) {
      console.warn('停止生成时出错:', error)
    }
    currentAbortController = null
  }

  const resetMessages = () => {
    messages.value = []
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isSending.value) return

    const parentMessageId = findLastServerMessageId()
    const userMessage: AssistantMessage = {
      id: `local_user_${Date.now()}`,
      role: 'user',
      messageType: 'TEXT',
      content: message,
      timestamp: new Date(),
    }

    messages.value.push(userMessage)

    const assistantPlaceholder: AssistantMessage = {
      id: `local_assistant_${Date.now() + 1}`,
      role: 'assistant',
      messageType: 'TEXT',
      content: '',
      parts: [],
      timestamp: new Date(),
      isTyping: true,
      meta: {
        toolCount: 0,
        hasThinking: false,
      },
    }
    messages.value.push(assistantPlaceholder)

    isSending.value = true
    stoppedManually = false
    currentAbortController = new AbortController()

    let effectiveAssistantId = assistantPlaceholder.id

    const applyMessageUpdate = (updated: AssistantMessage) => {
      const idx = messages.value.findIndex((m) => m.id === effectiveAssistantId)
      if (idx !== -1) {
        messages.value[idx] = updated
      }
    }

    const builder = new ResponseBuilder(applyMessageUpdate, assistantPlaceholder)

    try {
      const stream = options.streamMessage({
        message,
        parentMessageId,
        signal: currentAbortController.signal,
      })

      for await (const event of stream) {
        if (stoppedManually) break

        if (event.type === 'start' && event.messageId) {
          const idx = messages.value.findIndex((m) => m.id === effectiveAssistantId)
          if (idx !== -1) {
            const current = messages.value[idx]
            messages.value[idx] = { ...current, id: event.messageId }
          }
          effectiveAssistantId = event.messageId
          builder.start(event.messageId)
          await nextTick()
          scrollToBottom()
          continue
        }

        switch (event.type) {
          case 'delta':
            builder.delta(event.content ?? '')
            await nextTick()
            scrollToBottom()
            break

          case 'tool_call':
            builder.toolCall(event.toolName ?? 'Unknown Tool', event.toolInput, undefined, event.toolCallId)
            await nextTick()
            scrollToBottom()
            break

          case 'tool_result':
            builder.toolResult(event.toolName ?? 'Unknown Tool', event.toolResult, event.toolCallId)
            await nextTick()
            scrollToBottom()
            break

          case 'thinking':
            builder.thinking(event.thinkingText ?? '', event.collapsed ?? true)
            await nextTick()
            scrollToBottom()
            break

          case 'complete':
            builder.complete(event.content ?? '')
            await nextTick()
            scrollToBottom()
            return

          case 'error': {
            const fallback = event.content || '抱歉，发送消息时出现了错误。请稍后重试。'
            builder.error(fallback)
            await nextTick()
            scrollToBottom()
            return
          }
        }
      }
    } catch (error) {
      console.error('发送消息失败:', error)
      const fallback = '抱歉，发送消息时出现了错误。请稍后重试。'
      builder.error(fallback)
    } finally {
      if (stoppedManually) {
        builder.complete()
      }
      isSending.value = false
      currentAbortController = null
    }
  }

  return {
    messages,
    isSending,
    isLoadingHistory,
    lastHistoryError,
    registerScrollContainer,
    scrollToBottom,
    loadHistory,
    sendMessage,
    stopGeneration,
    resetMessages,
  }
}
