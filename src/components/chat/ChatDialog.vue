<template>
  <v-navigation-drawer
    v-model="dialogOpen"
    :location="mdAndUp ? 'right' : 'bottom'"
    :width="mdAndUp ? '700' : '100%'"
    temporary
    class="chat-drawer"
    :class="!mdAndUp ? 'chat-drawer-radius-top' : ''"
    color="background"
    elevation="4"
  >
    <div
      class="d-flex flex-column"
      :class="{ 'h-100': mdAndUp }"
      :style="!mdAndUp ? 'height: calc(90vh - var(--v-layout-top));' : ''"
    >
      <v-toolbar color="surface" flat class="flex-grow-0 flex-shrink-0">
        <v-btn icon variant="text" @click="dialogOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-toolbar-title class="font-weight-medium text-truncate">{{ activeTitle }}</v-toolbar-title>

        <!-- 移动端会话选择器 -->
        <v-menu v-if="!mdAndUp && conversations.length > 0" offset-y>
          <template #activator="{ props }">
            <v-btn icon variant="text" class="ml-2" v-bind="props">
              <v-icon>mdi-format-list-bulleted</v-icon>
              <v-tooltip activator="parent" location="bottom">切换对话</v-tooltip>
            </v-btn>
          </template>
          <v-list density="compact" max-height="300px" class="overflow-y-auto">
            <v-list-item
              v-for="conv in conversations"
              :key="conv.conversationId"
              :active="conv.conversationId === activeConversationId"
              @click="loadConversation(conv.conversationId)"
            >
              <v-list-item-title>{{ formatConversationTitle(conv.latestMessage?.question) }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption">{{
                new Date(conv.updatedAt).toLocaleString()
              }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-spacer></v-spacer>
        <v-btn v-if="!mdAndUp" icon variant="text" @click="createNewConversation(true)">
          <v-icon>mdi-plus</v-icon>
          <v-tooltip activator="parent" location="bottom">创建新对话</v-tooltip>
        </v-btn>
      </v-toolbar>

      <div class="d-flex flex-grow-1 overflow-hidden">
        <!-- 会话列表侧边栏 - 仅桌面端显示 -->
        <div v-if="mdAndUp" class="conversation-sidebar">
          <ChatConversationsList
            :conversations="conversations"
            :active-conversation-id="activeConversationId"
            @select="loadConversation"
            @new-conversation="createNewConversation(true)"
          />
        </div>

        <div :class="['chat-content-area', { 'full-width': !mdAndUp }]">
          <!-- 对话历史 -->
          <div ref="chatHistoryRef" v-scroll="handleScroll" class="chat-history flex-grow-1" @scroll="handleScroll">
            <template v-if="currentConversationMessages.length">
              <div v-for="(msg, index) in currentConversationMessages" :key="msg.id" class="px-4">
                <ChatMessageComponent
                  :message="msg"
                  :is-last-message="index === currentConversationMessages.length - 1"
                  :is-streaming="streaming && index === currentConversationMessages.length - 1"
                  :streaming-response="index === currentConversationMessages.length - 1 ? streamingResponse : ''"
                  :streaming-reasoning-content="
                    index === currentConversationMessages.length - 1 ? streamingReasoning : ''
                  "
                  :reasoning-status="
                    index === currentConversationMessages.length - 1 ? reasoningStatus : ReasoningStatus.NONE
                  "
                  :streaming-reasoning-time-ms="
                    index === currentConversationMessages.length - 1 ? streamingReasoningTimeMs : null
                  "
                  :is-branch-point="
                    msg.parentId ? currentBranch.branchPoints.includes(msg.parentId) : isRootBranchPoint
                  "
                  :parent-branch-children="msg.parentId ? getBranchChildren(msg.parentId) : rootNodes"
                  :current-branch-index="
                    msg.parentId ? getCurrentBranchIndexForMessage(msg) : getCurrentRootBranchIndex()
                  "
                  :branch-count="msg.parentId ? getBranchCountForParent(msg.parentId) : rootNodes.length"
                  @followup-question="sendMessage"
                  @branch-from-message="handleBranchFromMessage"
                  @switch-branch="switchBranchFor"
                />
              </div>
            </template>

            <!-- 空状态 -->
            <div v-else class="d-flex flex-column align-center justify-center h-100">
              <v-icon size="48" color="primary" class="mb-3">mdi-robot</v-icon>
              <div class="text-h6">有什么可以帮你？</div>
              <div class="text-body-2 text-center mx-4 text-medium-emphasis">你的第一个问题将开启智慧对话</div>
            </div>
          </div>

          <!-- 聊天输入框 -->
          <ChatInput
            v-model="inputMessage"
            :disabled="streaming || isProcessingMessage"
            :model-type="modelType"
            :show-model-options="true"
            :context-chips="contextChips"
            @update:model-type="
              (val: 'standard' | 'reasoning') => {
                modelType = val
              }
            "
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import type {
  ChatMessage,
  ChatMessageNode,
  ChatService,
  ContextChip,
  ConversationBranch,
  ConversationSummary,
} from './types'

import { computed, nextTick, onMounted, onUnmounted, ref, toRefs, watch } from 'vue'
import { useDisplay } from 'vuetify/lib/framework.mjs'
import { toast } from 'vuetify-sonner'

import ChatConversationsList from './ChatConversationsList.vue'
import ChatInput from './ChatInput.vue'
import ChatMessageComponent from './ChatMessage.vue'
import { ReasoningStatus } from './types'

// 获取屏幕尺寸
const { mdAndUp } = useDisplay()

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

// 计算当前显示的标题
const activeTitle = computed(() => {
  // 如果有活跃对话并且在conversations中能找到，使用conversation的title
  if (activeConversationId.value && conversations.value.length > 0) {
    const activeConv = conversations.value.find((c) => c.conversationId === activeConversationId.value)
    if (activeConv && activeConv.title) {
      return activeConv.title
    }
  }
  // 否则使用props中的title或默认标题
  return props.title || '智能助手'
})

// UI状态
const inputMessage = ref('')
const streaming = ref(false)
const streamingResponse = ref('')
const reasoningStatus = ref<ReasoningStatus>(ReasoningStatus.NONE)
const streamingReasoning = ref('')
const streamingReasoningTimeMs = ref<number | null>(null)
const modelType = ref<'standard' | 'reasoning'>('standard')

// 对话数据
const conversations = ref<ConversationSummary[]>([])
const currentConversationMessages = ref<ChatMessage[]>([])
const chatHistoryRef = ref<HTMLElement>()
let currentStream: { close: () => void } | null = null
const activeConversationId = ref('')
const currentMessageId = ref<number | null>(null)
const isHistoryLoaded = ref(false)
const isProcessingMessage = ref(false)

// 滚动状态
const isAtBottom = ref(true)

// 对话树相关状态
const messageTree = ref<ChatMessageNode | null>(null)
const currentBranch = ref<ConversationBranch>({
  pathIds: [],
  messages: [],
  branchPoints: [],
})

// 计算属性：是否显示根节点分支选择器
const rootNodes = ref<ChatMessageNode[]>([])

// 计算属性：是否是根分支点
const isRootBranchPoint = computed(() => rootNodes.value.length > 1)

// 构建消息树
const buildMessageTree = (messages: ChatMessage[]): ChatMessageNode | null => {
  if (!messages.length) return null

  // 创建ID到消息的映射
  const messageMap = new Map<number, ChatMessageNode>()
  messages.forEach((msg) => {
    messageMap.set(msg.id, { ...msg, children: [] })
  })

  // 找到所有根节点（parentId 为 null 的节点）
  const rootNodes: ChatMessageNode[] = []

  // 构建树结构
  messages.forEach((msg) => {
    const node = messageMap.get(msg.id)!
    if (!msg.parentId) {
      rootNodes.push(node) // 收集所有根节点
    } else {
      const parent = messageMap.get(msg.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  // 如果有多个根节点，按创建时间排序，取最新的一个作为默认根节点
  if (rootNodes.length > 0) {
    // 按创建时间排序(从旧到新)
    rootNodes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    return rootNodes[rootNodes.length - 1] // 返回最新的根节点
  }

  return null
}

// 获取分支点（有多个子节点的节点）
const findBranchPoints = (messages: ChatMessage[]): number[] => {
  const childCount = new Map<number, number>()
  messages.forEach((msg) => {
    if (msg.parentId) {
      childCount.set(msg.parentId, (childCount.get(msg.parentId) || 0) + 1)
    }
  })
  return Array.from(childCount.entries())
    .filter(([_, count]) => count > 1)
    .map(([id]) => id)
}

// 查找从根节点到最深叶子节点的路径
const findDeepestPath = (root: ChatMessageNode): ChatMessage[] => {
  const traverse = (node: ChatMessageNode, currentPath: ChatMessage[] = []): ChatMessage[] => {
    // 深复制节点以确保不会丢失响应内容
    const nodeCopy = { ...node }
    currentPath.push(nodeCopy)
    if (node.children.length === 0) {
      return currentPath
    }
    // 如果有子节点，优先选择最新的子节点路径
    if (node.children.length > 0) {
      // 取最新创建的子节点作为默认路径（按创建时间从旧到新排序后取最后一个）
      const sortedChildren = [...node.children].sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
      return traverse(sortedChildren[sortedChildren.length - 1], currentPath)
    }
    return currentPath
  }
  return traverse(root)
}

// 从中间节点创建新分支
const handleBranchFromMessage = async (messageId: number, question: string) => {
  // 防止重复发送
  if (isProcessingMessage.value || streaming.value) return

  // 查找目标消息在当前显示消息列表中的索引
  const targetMessage = currentConversationMessages.value.find((msg) => msg.id === messageId)
  if (!targetMessage) return

  // 查找父消息在当前显示消息列表中的索引
  const parentId = targetMessage.parentId
  if (parentId) {
    // 非根节点的编辑处理
    const parentIndex = currentConversationMessages.value.findIndex((msg) => msg.id === parentId)
    if (parentIndex !== -1) {
      // 只保留到父消息的部分，丢弃该父消息之后的所有消息
      currentConversationMessages.value = currentConversationMessages.value.slice(0, parentIndex + 1)
    }

    // 更新当前消息ID为父消息ID
    currentMessageId.value = parentId

    // 更新当前分支路径，只保留到父消息的部分
    const parentPathIndex = currentBranch.value.pathIds.indexOf(parentId)
    if (parentPathIndex !== -1) {
      const newPathIds = currentBranch.value.pathIds.slice(0, parentPathIndex + 1)
      currentBranch.value = {
        ...currentBranch.value,
        pathIds: newPathIds,
        messages: currentConversationMessages.value,
      }
    }

    // 生成临时ID，以便在树中添加新节点
    const tempId = -Date.now()

    // 创建一个新的临时消息节点
    const newTempMessage: ChatMessage = {
      id: tempId,
      parentId: parentId,
      question,
      response: '',
      modelType: modelType.value,
      followupQuestions: [],
      createdAt: new Date().toISOString(),
      conversationId: activeConversationId.value,
    }

    // 如果消息树存在，在树中添加新节点
    if (messageTree.value) {
      // 查找父节点
      const findParentNode = (node: ChatMessageNode, id: number): ChatMessageNode | null => {
        if (node.id === id) return node
        for (const child of node.children) {
          const found = findParentNode(child, id)
          if (found) return found
        }
        return null
      }

      const parentNode = findParentNode(messageTree.value, parentId)
      if (parentNode) {
        // 添加新节点到父节点的子节点列表
        parentNode.children.push({
          ...newTempMessage,
          children: [],
        })
      }
    }

    // 发送新消息，使用父消息ID作为父ID，关键是保留当前的消息列表
    await sendMessage(question, parentId, tempId, false)
  } else {
    // 顶级消息（没有父消息）的分支处理
    currentMessageId.value = null

    // 生成临时ID
    const tempId = -Date.now()

    // 保存旧的根节点
    let oldRootNode: ChatMessageNode | null = null
    if (messageTree.value && messageTree.value.id === messageId) {
      oldRootNode = messageTree.value

      // 先确保原有根节点存在于根节点列表中
      const existingRootIndex = rootNodes.value.findIndex((node) => node.id === oldRootNode!.id)
      if (existingRootIndex === -1) {
        rootNodes.value.push(oldRootNode)
      }
    }

    // 创建一个新的临时根消息
    const newTempMessage: ChatMessage = {
      id: tempId,
      question,
      response: '',
      modelType: modelType.value,
      followupQuestions: [],
      createdAt: new Date().toISOString(),
      conversationId: activeConversationId.value,
    }

    // 创建新的根节点对象
    const newRootNode: ChatMessageNode = {
      ...newTempMessage,
      children: [],
    }

    // 更新消息树的根节点为新消息
    messageTree.value = newRootNode

    // 将新的根节点添加到根节点列表
    rootNodes.value.push(newRootNode)

    // 按创建时间排序(从旧到新)
    rootNodes.value.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    // 更新当前分支路径
    currentBranch.value = {
      pathIds: [tempId],
      messages: [newTempMessage],
      branchPoints: [...currentBranch.value.branchPoints],
    }

    // 关键修改：不要在这里更新currentConversationMessages，让sendMessage来处理
    // 而是直接传递tempId作为parentMessageId，表示这是一个新的根消息
    await sendMessage(question, undefined, tempId, true)
  }
}

// 监听对话框开关
watch(
  dialogOpen,
  (val) => {
    if (val) {
      // 如果对话框打开
      if (!isHistoryLoaded.value) {
        // 如果历史未加载，则加载对话列表
        loadGroupedConversations()
      } else if (!activeConversationId.value) {
        // 如果历史已加载但没有活跃对话，确保显示空状态
        createNewConversation(false)
      }
    }
  },
  { immediate: true }
)

// 处理滚动事件
const handleScroll = () => {
  checkIfAtBottom()
}

// 检查是否滚动到底部
const checkIfAtBottom = () => {
  if (!chatHistoryRef.value) return

  const { scrollTop, scrollHeight, clientHeight } = chatHistoryRef.value
  // 如果滚动条在底部20px范围内，视为已滚动到底部
  isAtBottom.value = scrollHeight - scrollTop - clientHeight < 20
}

// 滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  if (chatHistoryRef.value) {
    chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
    isAtBottom.value = true
  }
}

// 智能滚动到底部（仅当用户当前已在底部时自动滚动）
const smartScrollToBottom = async () => {
  if (isAtBottom.value) {
    await scrollToBottom()
  }
}

// 加载对话组列表
const loadGroupedConversations = async () => {
  try {
    conversations.value = await chatService.value.getConversations(contextId.value)
    isHistoryLoaded.value = true

    // 如果有活跃的对话，加载它
    if (
      activeConversationId.value &&
      conversations.value.some((c) => c.conversationId === activeConversationId.value)
    ) {
      await loadConversation(activeConversationId.value)
    }
  } catch (error) {
    console.error('加载对话列表失败:', error)
    toast.error('加载对话列表失败')
  }
}

// 加载特定对话
const loadConversation = async (conversationId: string) => {
  if (!conversationId) return

  if (activeConversationId.value === conversationId && currentConversationMessages.value.length > 0) {
    return // 已经加载了这个对话
  }

  try {
    const messages = await chatService.value.getConversationById(contextId.value, conversationId)
    activeConversationId.value = conversationId

    // 构建消息树
    messageTree.value = buildMessageTree(messages)

    // 计算分支点
    const branchPoints = findBranchPoints(messages)

    console.log('messageTree', messageTree.value, branchPoints)

    // 找到所有根节点（顶级消息）
    if (messageTree.value) {
      // 查找所有根消息（没有parentId的消息）
      const rootMessagesMap = new Map<number, ChatMessageNode>()
      messages.forEach((msg) => {
        if (!msg.parentId) {
          const node = { ...msg, children: [] } as ChatMessageNode
          rootMessagesMap.set(msg.id, node)
        }
      })

      // 构建子节点关系
      messages.forEach((msg) => {
        if (msg.parentId && rootMessagesMap.has(msg.parentId)) {
          const parent = rootMessagesMap.get(msg.parentId)!
          if (!parent.children.some((child) => child.id === msg.id)) {
            parent.children.push({ ...msg, children: [] } as ChatMessageNode)
          }
        }
      })

      // 以时间顺序收集根节点（parentId 为 null 的消息）
      rootNodes.value = Array.from(rootMessagesMap.values()).sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    } else {
      rootNodes.value = []
    }

    // 找到最新的叶子节点
    const latestMessage = messages[messages.length - 1]
    if (messageTree.value && latestMessage) {
      // 查找从根到最新叶子节点的路径
      const path = findDeepestPath(messageTree.value)
      currentBranch.value = {
        pathIds: path.map((msg) => msg.id),
        messages: path,
        branchPoints,
      }
      currentConversationMessages.value = path
    } else {
      currentBranch.value = {
        pathIds: messages.map((msg) => msg.id),
        messages,
        branchPoints,
      }
      currentConversationMessages.value = messages
    }

    // 如果有消息，更新当前消息ID
    if (messages.length > 0) {
      currentMessageId.value = messages[messages.length - 1].id
    }

    await nextTick()
    await scrollToBottom()
  } catch (error) {
    console.error('加载对话失败:', error)
    toast.error('加载对话失败')
  }
}

// 创建新对话
const createNewConversation = (clearContext: boolean = false) => {
  activeConversationId.value = ''
  currentMessageId.value = null
  currentConversationMessages.value = []
  isAtBottom.value = true
  // 重置分支相关状态
  rootNodes.value = []
  messageTree.value = null
  currentBranch.value = {
    pathIds: [],
    messages: [],
    branchPoints: [],
  }
  if (clearContext) {
    emit('clearContext')
  }
}

// 发送消息
const sendMessage = async (
  question: string,
  parentMessageId?: number,
  tempMessageId?: number,
  resetMessages: boolean = false
) => {
  // 防止重复发送
  if (isProcessingMessage.value || streaming.value) return

  isProcessingMessage.value = true
  inputMessage.value = ''
  streaming.value = true
  streamingResponse.value = ''
  // 重置推理状态
  reasoningStatus.value = ReasoningStatus.NONE
  streamingReasoning.value = ''
  streamingReasoningTimeMs.value = null

  try {
    // 创建临时消息对象
    const newMessage: ChatMessage = {
      id: tempMessageId || Date.now(),
      question,
      response: '',
      modelType: modelType.value,
      followupQuestions: [],
      createdAt: new Date().toISOString(),
    }

    // 如果有活跃的会话，设置会话ID和父消息ID
    if (activeConversationId.value) {
      newMessage.conversationId = activeConversationId.value
      // 如果指定了parentMessageId，优先使用它
      newMessage.parentId = parentMessageId !== undefined ? parentMessageId : currentMessageId.value || undefined
    }

    // 如果提供了临时消息ID并且需要重置消息列表
    if (tempMessageId && resetMessages) {
      // 确保当前显示的消息列表只有这一条消息
      currentConversationMessages.value = [newMessage]
    } else {
      // 正常情况：添加到当前对话历史
      currentConversationMessages.value.push(newMessage)
    }

    await smartScrollToBottom()

    // 确保之前的流已关闭
    if (currentStream) {
      currentStream.close()
      currentStream = null
    }

    // 根据用户选择的模型类型设置modelType
    const selectedModelType = modelType.value

    console.log('sendMessage', question, context.value)

    // 使用聊天服务发送请求
    currentStream = chatService.value.streamConversation({
      contextId: contextId.value,
      question,
      modelType: selectedModelType,
      context: context.value,
      conversationId: activeConversationId.value,
      // 确保API调用也使用正确的父消息ID
      parentId:
        parentMessageId !== undefined
          ? parentMessageId
          : activeConversationId.value
            ? currentMessageId.value || undefined
            : undefined,
      callbacks: {
        // 处理推理事件
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
          console.log('onReasoningTime', timeMs)
          streamingReasoningTimeMs.value = timeMs
          newMessage.reasoningTimeMs = timeMs
          smartScrollToBottom()
        },
        // 处理部分响应
        onPartialResponse: (deltaMessage) => {
          streamingResponse.value += deltaMessage
          newMessage.response = streamingResponse.value
          smartScrollToBottom()
        },
        // 处理完整响应
        onCompleteResponse: (fullMessage) => {
          streamingResponse.value = fullMessage
          newMessage.response = fullMessage
          smartScrollToBottom()
        },
        // 处理后续问题
        onFollowupQuestions: (questions) => {
          newMessage.followupQuestions = questions
        },
        // 处理会话ID
        onConversationId: (convId) => {
          if (!activeConversationId.value) {
            activeConversationId.value = convId
            newMessage.conversationId = convId
            // 如果是新会话，在对话列表中添加
            if (!conversations.value.some((c) => c.conversationId === convId)) {
              loadGroupedConversations()
            }
          }
        },
        // 处理消息ID
        onMessageId: (msgId) => {
          // 更新临时ID为服务器返回的真实ID
          const tempId = newMessage.id

          // 更新当前消息列表中的ID
          const index = currentConversationMessages.value.findIndex((m) => m.id === tempId)
          if (index !== -1) {
            currentConversationMessages.value[index].id = msgId
          }

          // 如果存在消息树，更新树中的临时节点ID
          if (messageTree.value) {
            const updateNodeId = (node: ChatMessageNode, oldId: number, newId: number): boolean => {
              if (node.id === oldId) {
                node.id = newId
                return true
              }
              for (const child of node.children) {
                if (updateNodeId(child, oldId, newId)) return true
              }
              return false
            }

            updateNodeId(messageTree.value, tempId, msgId)
          }

          // 更新根节点列表中的临时ID
          const rootNodeIndex = rootNodes.value.findIndex((node) => node.id === tempId)
          if (rootNodeIndex !== -1) {
            rootNodes.value[rootNodeIndex].id = msgId
          }
          // 更新当前分支路径中的ID
          const pathIndex = currentBranch.value.pathIds.indexOf(tempId)
          if (pathIndex !== -1) {
            currentBranch.value.pathIds[pathIndex] = msgId
          }

          currentMessageId.value = msgId
          newMessage.id = msgId
        },
        // 处理标题
        onTitle: (title) => {
          // 如果有会话ID，更新对应会话的标题
          if (activeConversationId.value) {
            // 在对话列表中查找并更新对应会话标题
            const convIndex = conversations.value.findIndex((c) => c.conversationId === activeConversationId.value)
            if (convIndex !== -1) {
              conversations.value[convIndex].title = title
            }
          }
        },
        // 处理错误
        onError: (err) => {
          toast.error(`流式响应错误: ${err}`)
          streaming.value = false
          isProcessingMessage.value = false
          reasoningStatus.value = ReasoningStatus.NONE
        },
        // 处理关闭
        onClose: () => {
          streaming.value = false
          isProcessingMessage.value = false
          currentStream = null
        },
      },
    })
  } catch (error) {
    toast.error('发送消息失败')
    streaming.value = false
    isProcessingMessage.value = false
    reasoningStatus.value = ReasoningStatus.NONE
  }
}

// 提交表单
const handleSubmit = () => {
  const message = inputMessage.value.trim()
  if (message) {
    sendMessage(message)
  }
}

// 格式化对话标题
const formatConversationTitle = (question?: string | null) => {
  if (!question) return '新对话'
  if (question.length <= 30) return question
  return question.substring(0, 30) + '...'
}

// 组件卸载时清理
onUnmounted(() => {
  if (currentStream) {
    currentStream.close()
    currentStream = null
  }
  streaming.value = false
})

// 组件挂载时检查是否有context和message
onMounted(() => {
  // 如果打开了对话框，加载对话列表
  if (dialogOpen.value) {
    loadGroupedConversations()
  }

  // 初始化滚动状态
  nextTick(() => {
    checkIfAtBottom()
  })
})

// 暴露方法给父组件使用
defineExpose({
  sendMessage,
})

// 获取某个节点的所有子节点
const getBranchChildren = (messageId: number): ChatMessageNode[] => {
  if (!messageTree.value) return []

  // 在树中查找对应节点
  const findNode = (node: ChatMessageNode, id: number): ChatMessageNode | null => {
    if (node.id === id) return node
    for (const child of node.children) {
      const result = findNode(child, id)
      if (result) return result
    }
    return null
  }

  const node = findNode(messageTree.value, messageId)
  if (!node?.children?.length) return []

  // 按创建时间排序(从旧到新)，与根节点保持相同的排序逻辑
  return [...node.children].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

// 获取消息的父节点所有子节点数量
const getBranchCountForParent = (parentId: number): number => {
  const children = getBranchChildren(parentId)
  return children.length
}

// 获取当前消息在其父节点的子节点中的索引
const getCurrentBranchIndexForMessage = (message: ChatMessage): number => {
  if (!message.parentId) return 0

  const children = getBranchChildren(message.parentId)
  if (children.length === 0) return 0

  // 查找当前消息在子节点列表中的索引
  const index = children.findIndex((child) => child.id === message.id)
  return index === -1 ? 0 : index + 1
}

// 为特定消息切换分支
const switchBranchFor = (parentId: number, direction: 'prev' | 'next') => {
  // 如果是顶级分支切换（parentId === 0 表示切换根节点）
  if (parentId === 0) {
    const rootCount = rootNodes.value.length
    if (rootCount <= 1) return

    // 保存当前分支的完整消息状态，包括响应内容
    if (messageTree.value) {
      const currentRootIndex = rootNodes.value.findIndex((node) => node.id === messageTree.value!.id)
      if (currentRootIndex !== -1) {
        // 使用当前显示的消息更新根节点中的对应消息
        currentConversationMessages.value.forEach((displayedMsg) => {
          const updateNodeContent = (node: ChatMessageNode) => {
            if (node.id === displayedMsg.id) {
              // 更新节点内容，保留响应和其他内容
              node.response = displayedMsg.response
              node.followupQuestions = displayedMsg.followupQuestions
              node.reasoningContent = displayedMsg.reasoningContent
              node.reasoningTimeMs = displayedMsg.reasoningTimeMs
              return true
            }

            for (const child of node.children) {
              if (updateNodeContent(child)) return true
            }
            return false
          }

          // 更新根节点中的消息内容
          updateNodeContent(rootNodes.value[currentRootIndex])
        })
      }
    }

    // 找到当前根节点在根节点列表中的索引
    const currentRootId = messageTree.value?.id
    const currentIndex = rootNodes.value.findIndex((node) => node.id === currentRootId)
    if (currentIndex === -1) return

    // 计算新的索引
    let newIndex = currentIndex
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + rootCount) % rootCount
    } else {
      newIndex = (currentIndex + 1) % rootCount
    }

    // 切换到新的根节点
    const newRootNode = rootNodes.value[newIndex]

    // 更新当前消息树根节点
    messageTree.value = newRootNode

    // 找到从新根节点到叶子节点的路径
    const path = findDeepestPath(newRootNode)

    // 更新当前分支和消息列表
    currentBranch.value = {
      pathIds: path.map((msg) => msg.id),
      messages: path,
      branchPoints: currentBranch.value.branchPoints,
    }
    currentConversationMessages.value = path

    // 更新当前消息ID
    if (path.length > 0) {
      currentMessageId.value = path[path.length - 1].id
    }

    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })

    return
  }

  // 子分支切换逻辑
  const children = getBranchChildren(parentId)

  console.log('switchBranchFor', parentId, direction, children)
  if (children.length <= 1) return

  // 查找当前显示的分支
  const currentChild = currentConversationMessages.value.find(
    (m) => m.parentId === parentId && currentBranch.value.pathIds.includes(m.id)
  )

  console.log('currentChild', currentChild)
  if (!currentChild) return

  // 找到该消息在子节点列表中的索引
  const currentIndex = children.findIndex((child) => child.id === currentChild.id)
  console.log('currentIndex', currentIndex)
  if (currentIndex === -1) return

  let newIndex = currentIndex
  if (direction === 'prev') {
    newIndex = (currentIndex - 1 + children.length) % children.length
  } else {
    newIndex = (currentIndex + 1) % children.length
  }

  // 切换到新分支
  switchToBranchByChild(parentId, children[newIndex].id)
}

// 根据子节点切换分支
const switchToBranchByChild = async (parentId: number, childId: number) => {
  // 查找父节点在当前消息列表中的索引
  const parentIndex = currentConversationMessages.value.findIndex((msg) => msg.id === parentId)
  if (parentIndex === -1) return

  // 保留到父节点的部分
  currentConversationMessages.value = currentConversationMessages.value.slice(0, parentIndex + 1)

  // 构建从子节点开始的新路径
  const buildNewPath = (
    node: ChatMessageNode,
    messages: ChatMessage[] = [],
    pathIds: number[] = []
  ): { messages: ChatMessage[]; pathIds: number[] } => {
    messages.push(node)
    pathIds.push(node.id)
    if (node.children.length === 0) return { messages, pathIds }

    // 默认选择第一个子节点继续路径
    return buildNewPath(node.children[0], messages, pathIds)
  }

  // 在树中查找子节点
  const findChildNode = (node: ChatMessageNode, id: number): ChatMessageNode | null => {
    if (node.id === id) return node
    for (const child of node.children) {
      const result = findChildNode(child, id)
      if (result) return result
    }
    return null
  }

  if (!messageTree.value) return
  const childNode = findChildNode(messageTree.value, childId)
  if (!childNode) return

  // 构建并添加新路径
  const { messages: newPathMessages, pathIds: newPathIds } = buildNewPath(childNode)
  currentConversationMessages.value = [...currentConversationMessages.value, ...newPathMessages]

  // 更新当前分支路径
  const parentPathIndex = currentBranch.value.pathIds.indexOf(parentId)
  if (parentPathIndex !== -1) {
    // 保留到父节点的部分，再加上新路径
    const updatedPathIds = [...currentBranch.value.pathIds.slice(0, parentPathIndex + 1), ...newPathIds]

    // 更新当前分支信息
    currentBranch.value = {
      ...currentBranch.value,
      pathIds: updatedPathIds,
      messages: currentConversationMessages.value,
    }

    console.log('Updated branch path IDs:', updatedPathIds)
  }

  // 更新当前消息ID为新路径的最后一条消息
  if (newPathMessages.length > 0) {
    currentMessageId.value = newPathMessages[newPathMessages.length - 1].id
  }

  // 不再自动滚动到底部，保持当前滚动位置
  await nextTick()
}

// 获取当前根分支索引
const getCurrentRootBranchIndex = (): number => {
  if (!messageTree.value || rootNodes.value.length <= 1) return 1

  const currentRootId = messageTree.value.id
  const index = rootNodes.value.findIndex((node) => node.id === currentRootId)
  return index === -1 ? 1 : index + 1
}

const contextChips = computed(() => {
  const chips: ContextChip[] = []

  // 尝试从聊天服务获取上下文标签
  if (chatService.value.getContextChips) {
    const serviceChips = chatService.value.getContextChips(context.value)
    chips.push(...serviceChips)
  }
  return chips
})
</script>

<style scoped>
.chat-drawer-radius-top {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
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
