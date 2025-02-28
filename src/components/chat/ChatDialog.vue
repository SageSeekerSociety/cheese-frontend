<template>
  <v-overlay
    v-model="dialogOpen"
    :class="{
      'chat-drawer-mobile flex-column': !mdAndUp,
      'flex-row justify-end': mdAndUp,
      'chat-drawer-full-screen': isFullScreen,
    }"
    width="100%"
    height="100%"
    class="chat-drawer"
    :transition="mdAndUp ? 'slide-x-reverse-transition' : 'slide-y-reverse-transition'"
  >
    <div
      v-click-outside="{
        handler: () => (dialogOpen = false),
        include: outsideInclude,
      }"
      class="d-flex flex-column bg-surface chat-drawer-content"
    >
      <!-- Chat header toolbar -->
      <v-toolbar color="transparent" flat class="flex-grow-0 flex-shrink-0">
        <!-- Mobile conversation selector -->
        <v-menu v-if="!mdAndUp && conversations.length > 0" class="mobile-conversation-selector">
          <template #activator="{ props }">
            <v-btn icon variant="text" class="ml-2" v-bind="props">
              <v-icon>mdi-format-list-bulleted</v-icon>
              <v-tooltip activator="parent" location="bottom">切换对话</v-tooltip>
            </v-btn>
          </template>
          <ConversationGroupList
            :conversations="conversations"
            :active-conversation-id="activeConversationId"
            @select="loadConversation"
          >
            <template #prepend>
              <v-list-item color="primary" rounded="lg" @click="createNewConversation(true)">
                <template #prepend>
                  <v-icon>mdi-plus</v-icon>
                </template>
                <v-list-item-title>创建新对话</v-list-item-title>
              </v-list-item>
            </template>
          </ConversationGroupList>
        </v-menu>
        <v-btn v-if="mdAndUp" icon variant="text" @click="dialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn v-if="mdAndUp" icon variant="text" @click="toggleFullScreen">
          <v-icon>
            {{ isFullScreen ? 'mdi-unfold-less-vertical' : 'mdi-unfold-more-vertical' }}
          </v-icon>
        </v-btn>

        <v-toolbar-title class="font-weight-medium text-truncate">{{ activeTitle }}</v-toolbar-title>

        <v-btn v-if="!mdAndUp" icon variant="text" @click="toggleFullScreen">
          <v-icon>
            {{ isFullScreen ? 'mdi-unfold-less-horizontal' : 'mdi-unfold-more-horizontal' }}
          </v-icon>
        </v-btn>

        <v-btn v-if="!mdAndUp" icon variant="text" @click="createNewConversation(true)">
          <v-icon>mdi-plus</v-icon>
          <v-tooltip activator="parent" location="bottom">创建新对话</v-tooltip>
        </v-btn>
      </v-toolbar>

      <div class="d-flex flex-grow-1 overflow-hidden">
        <!-- Sidebar - desktop only -->
        <div v-if="mdAndUp" class="conversation-sidebar">
          <ChatConversationsList
            :conversations="conversations"
            :active-conversation-id="activeConversationId"
            @select="loadConversation"
            @new-conversation="createNewConversation(true)"
            @delete="deleteConversation"
          />
        </div>

        <div :class="['chat-content-area', { 'full-width': !mdAndUp }]">
          <!-- Chat history -->
          <div ref="chatHistoryRef" v-scroll="handleScroll" class="chat-history flex-grow-1" @scroll="handleScroll">
            <template v-if="treeManager.currentConversationMessages.value.length">
              <div v-for="(msg, index) in treeManager.currentConversationMessages.value" :key="msg.id" class="px-4">
                <ChatMessageComponent
                  :message="msg"
                  :is-last-message="index === treeManager.currentConversationMessages.value.length - 1"
                  :is-streaming="streaming && index === treeManager.currentConversationMessages.value.length - 1"
                  :streaming-response="
                    index === treeManager.currentConversationMessages.value.length - 1 ? streamingResponse : ''
                  "
                  :streaming-reasoning-content="
                    index === treeManager.currentConversationMessages.value.length - 1 ? streamingReasoning : ''
                  "
                  :reasoning-status="
                    index === treeManager.currentConversationMessages.value.length - 1
                      ? reasoningStatus
                      : ReasoningStatus.NONE
                  "
                  :streaming-reasoning-time-ms="
                    index === treeManager.currentConversationMessages.value.length - 1 ? streamingReasoningTimeMs : null
                  "
                  :streaming-references="
                    index === treeManager.currentConversationMessages.value.length - 1 ? streamingReferences : []
                  "
                  :is-branch-point="treeManager.isBranchPoint(msg)"
                  :parent-branch-children="
                    msg.parentId ? treeManager.getBranchChildren(msg.parentId) : treeManager.rootNodes
                  "
                  :current-branch-index="treeManager.getBranchIndex(msg)"
                  :branch-count="treeManager.getBranchCount(msg)"
                  @followup-question="sendMessage"
                  @branch-from-message="handleBranchFromMessage"
                  @switch-branch="switchBranchFor"
                />
              </div>
            </template>

            <!-- Empty state -->
            <div v-else class="d-flex flex-column align-center justify-center h-100">
              <v-icon size="48" color="primary" class="mb-3">mdi-robot</v-icon>
              <div class="text-h6">有什么可以帮你？</div>
              <div class="text-body-2 text-center mx-4 text-medium-emphasis">你的第一个问题将开启智慧对话</div>
            </div>
          </div>

          <!-- Chat input -->
          <ChatInput
            v-model="inputMessage"
            v-model:model-type="modelType"
            :disabled="streaming || branchManager.isProcessingMessage.value"
            :show-model-options="true"
            :context-chips="contextChips"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>
  </v-overlay>
</template>

<script setup lang="ts">
import type { ChatMessage, ChatReference, ChatService, ContextChip, ConversationSummary } from './types'

import { computed, nextTick, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { useDisplay } from 'vuetify'
import { toast } from 'vuetify-sonner'

import { useBranchManagement } from './composables/branchManagement'
import { useConversationTree } from './composables/conversationTree'
import { useScrollManager } from './composables/scrollManager'
import ChatConversationsList from './ChatConversationsList.vue'
import ChatInput from './ChatInput.vue'
import ChatMessageComponent from './ChatMessage.vue'
import ConversationGroupList from './ConversationGroupList.vue'
import { ReasoningStatus } from './types'

import { useDialog } from '@/plugins/dialog'

// Get screen size
const { mdAndUp } = useDisplay()
const dialogs = useDialog()

const isFullScreen = ref(false)

const dialogOpen = defineModel<boolean>({ required: true })

const props = defineProps<{
  contextId: number | string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: any
  title?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chatService: ChatService<any>
}>()

const { contextId, context, chatService } = toRefs(props)

const emit = defineEmits<{
  clearContext: []
}>()

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value
}

const outsideInclude = () => [document.querySelector('.mobile-conversation-selector')]

// Initialize composables
const treeManager = useConversationTree()
const branchManager = useBranchManagement(treeManager)
const { isAtBottom, chatHistoryRef, handleScroll, checkIfAtBottom, scrollToBottom, smartScrollToBottom } =
  useScrollManager()

// Compute active title
const activeTitle = computed(() => {
  if (activeConversationId.value && conversations.value.length > 0) {
    const activeConv = conversations.value.find((c) => c.conversationId === activeConversationId.value)
    if (activeConv && activeConv.title) {
      return activeConv.title
    }
  }
  return props.title || '智能助手'
})

// UI state
const inputMessage = ref('')
const streaming = ref(false)
const streamingResponse = ref('')
const streamingReferences = ref<ChatReference[]>([])
const reasoningStatus = ref<ReasoningStatus>(ReasoningStatus.NONE)
const streamingReasoning = ref('')
const streamingReasoningTimeMs = ref<number | null>(null)
const modelType = ref<'standard' | 'reasoning'>('standard')

// Conversation data
const conversations = ref<ConversationSummary[]>([])
const activeConversationId = ref('')
let currentStream: { close: () => void } | null = null
const isHistoryLoaded = ref(false)

// Watch dialog open state
watch(
  dialogOpen,
  (val) => {
    if (val) {
      if (!isHistoryLoaded.value) {
        loadGroupedConversations()
      } else if (!activeConversationId.value) {
        createNewConversation(false)
      }
    }
  },
  { immediate: true }
)

// Load conversation groups
const loadGroupedConversations = async () => {
  try {
    conversations.value = await chatService.value.getConversations(contextId.value)
    isHistoryLoaded.value = true

    if (
      activeConversationId.value &&
      conversations.value.some((c) => c.conversationId === activeConversationId.value)
    ) {
      await loadConversation(activeConversationId.value)
    }
  } catch (error) {
    console.error('Failed to load conversations:', error)
    toast.error('加载对话列表失败')
  }
}

// Load a specific conversation
const loadConversation = async (conversationId: string) => {
  if (!conversationId) return

  if (activeConversationId.value === conversationId && treeManager.currentConversationMessages.value.length > 0) {
    return // Already loaded
  }

  try {
    const messages = await chatService.value.getConversationById(contextId.value, conversationId)
    activeConversationId.value = conversationId

    // Initialize tree with messages
    treeManager.initializeTreeFromMessages(messages)

    await nextTick()
    await scrollToBottom()
  } catch (error) {
    console.error('Failed to load conversation:', error)
    toast.error('加载对话失败')
  }
}

// Delete a conversation
const deleteConversation = async (conversationId: string) => {
  const confirmed = await dialogs.confirm('确定要删除这个对话吗？').wait()
  if (confirmed) {
    await chatService.value.deleteConversation(contextId.value, conversationId)
    await loadGroupedConversations()
  }
}

// Create a new conversation
const createNewConversation = (clearContext: boolean = false) => {
  activeConversationId.value = ''
  treeManager.resetTreeState()
  isAtBottom.value = true

  if (clearContext) {
    emit('clearContext')
  }
}

// Send a message
const sendMessage = async (
  question: string,
  parentMessageId?: number,
  tempMessageId?: number,
  resetMessages: boolean = false
) => {
  // Prevent duplicate sends
  if (branchManager.isProcessingMessage.value || streaming.value) return

  branchManager.setProcessingState(true, true)
  inputMessage.value = ''
  streaming.value = true
  streamingResponse.value = ''
  // Reset reasoning state
  reasoningStatus.value = ReasoningStatus.NONE
  streamingReasoning.value = ''
  streamingReasoningTimeMs.value = null
  streamingReferences.value = []

  try {
    // Create temporary message
    const newMessage: ChatMessage = {
      id: tempMessageId || -Date.now(),
      question,
      response: '',
      modelType: modelType.value,
      followupQuestions: [],
      createdAt: new Date().toISOString(),
    }

    // Set conversation and parent if active
    if (activeConversationId.value) {
      newMessage.conversationId = activeConversationId.value
      newMessage.parentId =
        parentMessageId !== undefined ? parentMessageId : treeManager.currentMessageId.value || undefined
    }

    // Record branch if there's a parent
    if (newMessage.parentId) {
      treeManager.recordBranch(newMessage.parentId, newMessage.id)
    }

    // Update message list
    if (tempMessageId && resetMessages) {
      treeManager.currentConversationMessages.value = [newMessage]
    } else {
      treeManager.currentConversationMessages.value.push(newMessage)
    }

    await smartScrollToBottom()

    // Close previous stream
    if (currentStream) {
      currentStream.close()
      currentStream = null
    }

    // Start new stream
    currentStream = chatService.value.streamConversation({
      contextId: contextId.value,
      question,
      modelType: modelType.value,
      context: context.value,
      conversationId: activeConversationId.value,
      parentId:
        parentMessageId !== undefined
          ? parentMessageId
          : activeConversationId.value
            ? treeManager.currentMessageId.value || undefined
            : undefined,
      callbacks: {
        // Reasoning events
        onReasoningStart: () => {
          reasoningStatus.value = ReasoningStatus.REASONING
          streamingReasoning.value = ''
          streamingReasoningTimeMs.value = null
          smartScrollToBottom()
        },
        onReasoningPartial: (message) => {
          streamingReasoning.value += message
          smartScrollToBottom()
        },
        onReasoningComplete: (fullReasoning) => {
          reasoningStatus.value = ReasoningStatus.COMPLETED
          streamingReasoning.value = fullReasoning
          newMessage.reasoningContent = fullReasoning
          smartScrollToBottom()
        },
        onReasoningTime: (timeMs) => {
          streamingReasoningTimeMs.value = timeMs
          newMessage.reasoningTimeMs = timeMs
          smartScrollToBottom()
        },
        // Response events
        onPartialResponse: (deltaMessage) => {
          streamingResponse.value += deltaMessage
          newMessage.response = streamingResponse.value
          smartScrollToBottom()
        },
        onCompleteResponse: (fullMessage) => {
          streamingResponse.value = fullMessage
          newMessage.response = fullMessage
          smartScrollToBottom()
        },
        // Followup questions
        onFollowupQuestions: (questions) => {
          newMessage.followupQuestions = questions
        },
        // Conversation ID
        onConversationId: (convId) => {
          if (!activeConversationId.value) {
            activeConversationId.value = convId
            newMessage.conversationId = convId
            // Add to conversation list if new
            if (!conversations.value.some((c) => c.conversationId === convId)) {
              loadGroupedConversations()
            }
          }
        },
        // Message ID
        onMessageId: (msgId) => {
          const tempId = newMessage.id
          treeManager.updateIdMapping(tempId, msgId)
          treeManager.currentMessageId.value = msgId
        },
        // Title
        onTitle: (title) => {
          if (activeConversationId.value) {
            // Update title in conversation list
            const convIndex = conversations.value.findIndex((c) => c.conversationId === activeConversationId.value)
            if (convIndex !== -1) {
              conversations.value[convIndex].title = title
            }
          }
        },
        // References
        onReferences: (references) => {
          streamingReferences.value = references
          newMessage.references = references
        },
        // Token usage
        onTokensUsed: (tokensUsed) => {
          newMessage.tokensUsed = tokensUsed
        },
        // SEU consumed
        onSeuConsumed: (seuConsumed) => {
          newMessage.seuConsumed = seuConsumed
        },
        // Error
        onError: (err) => {
          toast.error(`流式响应错误: ${err}`)
          streaming.value = false
          branchManager.setProcessingState(false, false)
          reasoningStatus.value = ReasoningStatus.NONE
        },
        // Close
        onClose: () => {
          streaming.value = false
          branchManager.setProcessingState(false, false)
          currentStream = null
        },
      },
    })
  } catch (error) {
    toast.error('发送消息失败')
    streaming.value = false
    branchManager.setProcessingState(false, false)
    reasoningStatus.value = ReasoningStatus.NONE
  }
}

// Handle form submission
const handleSubmit = () => {
  const message = inputMessage.value.trim()
  if (message) {
    sendMessage(message)
  }
}

// Handle branch from message
const handleBranchFromMessage = (messageId: number, question: string) => {
  branchManager.handleBranchFromMessage(messageId, question, sendMessage)
}

// Switch branch
const switchBranchFor = (parentId: number, direction: 'prev' | 'next') => {
  branchManager.switchBranchFor(parentId, direction)
}

// Component lifecycle
onMounted(() => {
  if (dialogOpen.value) {
    loadGroupedConversations()
  }
  nextTick(() => {
    checkIfAtBottom()
  })
})

onUnmounted(() => {
  if (currentStream) {
    currentStream.close()
    currentStream = null
  }
  streaming.value = false
})

// Compute context chips
const contextChips = computed(() => {
  const chips: ContextChip[] = []
  if (chatService.value.getContextChips) {
    const serviceChips = chatService.value.getContextChips(context.value)
    chips.push(...serviceChips)
  }
  return chips
})

// Expose methods
defineExpose({
  sendMessage,
})
</script>

<style scoped>
.chat-drawer {
  .chat-drawer-content {
    position: absolute;
    right: 0;
    height: 100%;
    width: 60vw;
    transition: all 0.3s ease-in-out;
  }

  &.chat-drawer-full-screen {
    .chat-drawer-content {
      width: 100%;
    }
  }

  &.chat-drawer-mobile {
    .chat-drawer-content {
      position: absolute;
      bottom: 0;
      border-radius: 12px 12px 0 0;
      width: 100%;
      height: 80vh;
    }

    &.chat-drawer-full-screen {
      .chat-drawer-content {
        height: 100%;
      }
    }
  }
}

.conversation-sidebar {
  width: 250px;
  min-width: 250px;
  flex: 0 0 250px;
  border-right: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: hidden;
}

.chat-content-area {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  max-height: 100%; /* 限制最大高度 */
}

/* 移动端时内容区域宽度100% */
.chat-content-area.full-width {
  width: 100% !important;
}

/* 桌面端时内容区域宽度计算 */
@media (min-width: 960px) {
  .chat-content-area {
    width: calc(100% - 250px);
  }
}

.chat-history {
  overflow-y: auto;
  padding: 16px 0;
  scroll-behavior: smooth;
  /* 确保不会无限扩展 */
  min-height: 0;
  flex: 1 1 auto;
}

/* 自定义滚动条样式 */
.chat-history::-webkit-scrollbar {
  width: 4px;
}

.chat-history::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.chat-history::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.3);
  border-radius: 4px;
}

.branch-counter {
  min-width: 40px;
  font-size: 0.75rem;
  opacity: 0.8;
  padding: 0 4px;
}
</style>
