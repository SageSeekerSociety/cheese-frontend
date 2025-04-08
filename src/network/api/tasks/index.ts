// src/api/tasks.ts

import type { Page, TaskMembership, TaskSubmission } from '@/types'
import type { Task } from '@/types'
import type {
  AddTaskParticipantRequestData,
  ChatReference,
  ConversationGroupSummary,
  CreateTaskAIAdviceConversationRequest,
  PatchTaskParticipantRequestData,
  PatchTaskRequestData,
  PatchTaskSubmissionReviewRequestData,
  PostTaskRequestData,
  PostTaskSubmissionRequestData,
  PostTaskSubmissionReviewRequestData,
  TaskAIAdvice,
  TaskAIAdviceConversation,
  TaskAIAdviceConversationContext,
  TaskParticipationInfo,
  TeamSummary,
} from './types'

import { EventSource } from 'eventsource'

import { NewApiInstance } from '../index'

import { refreshTokenForEventSource } from '@/network/Interceptors/hooks/refreshToken'
import { NEW_API_BASE_URL } from '@/network/utils'
import AccountService from '@/services/account'

export namespace TasksApi {
  export const create = (data: PostTaskRequestData) =>
    NewApiInstance.request<{ task: Task }>({
      url: '/tasks',
      method: 'POST',
      data,
    })

  export const update = (taskId: number, data: PatchTaskRequestData) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}`,
      method: 'PATCH',
      data,
    })

  export const del = (taskId: number) =>
    NewApiInstance.request({
      url: `/tasks/${taskId}`,
      method: 'DELETE',
    })

  export const detail = (
    taskId: number,
    params: {
      querySpace?: boolean
      queryJoinability?: boolean
      querySubmittability?: boolean
      queryTopics?: boolean
      queryJoined?: boolean
      queryJoinedApproved?: boolean
      queryJoinedDisapproved?: boolean
      queryJoinedNotApprovedOrDisapproved?: boolean
    } = {
      querySpace: true,
      queryJoinability: true,
      querySubmittability: true,
      queryTopics: true,
      queryJoined: true,
      queryJoinedApproved: true,
      queryJoinedDisapproved: true,
      queryJoinedNotApprovedOrDisapproved: true,
    }
  ) =>
    NewApiInstance.request<{ task: Task; participation?: TaskParticipationInfo }>({
      url: `/tasks/${taskId}`,
      method: 'GET',
      params,
    })

  export const list = (params: {
    space?: number
    team?: number
    owner?: number
    pageSize?: number
    pageStart?: number
    sort_by: 'createdAt' | 'updatedAt' | 'deadline'
    sort_order: 'asc' | 'desc'
    querySpace?: boolean
    queryJoinability?: boolean
    querySubmittability?: boolean
    queryJoined?: boolean
    queryTopics?: boolean
    keywords?: string
    approved?: 'APPROVED' | 'DISAPPROVED' | 'NONE'
    joined?: boolean
    topics?: number[]
    categoryId?: number
  }) => {
    const finalParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => finalParams.append(key, v.toString()))
        } else {
          finalParams.set(key, value.toString())
        }
      }
    })
    return NewApiInstance.request<{ tasks: Task[]; page: Page }>({
      url: '/tasks',
      method: 'GET',
      params: finalParams,
    })
  }

  export const addParticipant = (
    taskId: number,
    member: number,
    data: AddTaskParticipantRequestData = { deadline: null }
  ) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants`,
      method: 'POST',
      params: { member },
      data,
    })

  // 获取可参与任务的队伍列表
  export const getTaskTeams = (
    taskId: number,
    params: {
      filter?: 'all' | 'eligible'
    } = { filter: 'all' }
  ) =>
    NewApiInstance.request<{ teams: TeamSummary[] }>({
      url: `/tasks/${taskId}/teams`,
      method: 'GET',
      params,
    })

  export const removeParticipant = (taskId: number, participantId: number) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants/${participantId}`,
      method: 'DELETE',
    })

  export const removeParticipantByMemberId = (taskId: number, memberId: number) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants`,
      method: 'DELETE',
      params: { member: memberId },
    })

  export const getParticipants = (
    taskId: number,
    params: { queryRealNameInfo?: boolean; queryTeamInfo?: boolean } = { queryRealNameInfo: true }
  ) =>
    NewApiInstance.request<{ participants: TaskMembership[] }>({
      url: `/tasks/${taskId}/participants`,
      method: 'GET',
      params,
    })

  export const updateParticipant = (taskId: number, participantId: number, data: PatchTaskParticipantRequestData) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants/${participantId}`,
      method: 'PATCH',
      data,
    })

  export const updateParticipantByMemberId = (
    taskId: number,
    memberId: number,
    data: PatchTaskParticipantRequestData
  ) =>
    NewApiInstance.request<{ task: Task }>({
      url: `/tasks/${taskId}/participants`,
      method: 'PATCH',
      params: { member: memberId },
      data,
    })

  export const createSubmission = (taskId: number, participantId: number, data: PostTaskSubmissionRequestData[]) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/${taskId}/participants/${participantId}/submissions`,
      method: 'POST',
      data,
    })

  export const updateSubmission = (
    taskId: number,
    participantId: number,
    version: number,
    data: PostTaskSubmissionRequestData[]
  ) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/${taskId}/participants/${participantId}/submissions/${version}`,
      method: 'PATCH',
      data,
    })

  export const listSubmissions = (
    taskId: number,
    participantId: number,
    params: {
      allVersions?: boolean
      pageSize?: number
      pageStart?: number
      sort_by: 'createdAt' | 'updatedAt'
      sort_order: 'asc' | 'desc'
      queryReview?: boolean
    }
  ) =>
    NewApiInstance.request<{ submissions: TaskSubmission[]; page: Page }>({
      url: `/tasks/${taskId}/participants/${participantId}/submissions`,
      method: 'GET',
      params,
    })

  export const postSubmissionReview = (
    taskId: number,
    participantId: number,
    submissionId: number,
    data: PostTaskSubmissionReviewRequestData
  ) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/${taskId}/participants/${participantId}/submissions/${submissionId}/review`,
      method: 'POST',
      data,
    })

  export const patchSubmissionReview = (
    taskId: number,
    participantId: number,
    submissionId: number,
    data: PatchTaskSubmissionReviewRequestData
  ) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/${taskId}/participants/${participantId}/submissions/${submissionId}/review`,
      method: 'PATCH',
      data,
    })

  export const deleteSubmissionReview = (taskId: number, participantId: number, submissionId: number) =>
    NewApiInstance.request<{ submission: TaskSubmission }>({
      url: `/tasks/${taskId}/participants/${participantId}/submissions/${submissionId}/review`,
      method: 'DELETE',
    })

  export const getAIAdvice = (taskId: number) =>
    NewApiInstance.request<TaskAIAdvice>({
      url: `/tasks/${taskId}/ai-advice`,
      method: 'GET',
    })

  export const requestAIAdvice = (taskId: number) =>
    NewApiInstance.request<{ status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' }>({
      url: `/tasks/${taskId}/ai-advice`,
      method: 'POST',
    })

  export const getAIAdviceStatus = (taskId: number) =>
    NewApiInstance.request<{ status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' }>({
      url: `/tasks/${taskId}/ai-advice/status`,
      method: 'GET',
    })

  export const getAIAdviceConversations = (taskId: number) =>
    NewApiInstance.request<{ conversations: TaskAIAdviceConversation[] }>({
      url: `/tasks/${taskId}/ai-advice/conversations`,
      method: 'GET',
    })

  // 获取按会话ID分组的对话历史
  export const getGroupedConversations = (taskId: number) =>
    NewApiInstance.request<{ conversations: ConversationGroupSummary[] }>({
      url: `/tasks/${taskId}/ai-advice/conversations/grouped`,
      method: 'GET',
    })

  // 获取特定会话ID的所有对话
  export const getConversationById = (taskId: number, conversationId: string) =>
    NewApiInstance.request<{ conversations: TaskAIAdviceConversation[] }>({
      url: `/tasks/${taskId}/ai-advice/conversations/${conversationId}`,
      method: 'GET',
    })

  export const createAIAdviceConversation = (taskId: number, data: CreateTaskAIAdviceConversationRequest) =>
    NewApiInstance.request<{ conversation: TaskAIAdviceConversation; quota: any }>({
      url: `/tasks/${taskId}/ai-advice/conversations`,
      method: 'POST',
      data,
    })

  // 使用options对象的新版本
  export interface StreamAIAdviceOptions {
    taskId: number
    question: string
    modelType: 'standard' | 'reasoning'
    context?: Partial<TaskAIAdviceConversationContext>
    conversationId?: string
    parentId?: number
    callbacks: {
      onPartialResponse?: (message: string) => void
      onCompleteResponse?: (message: string) => void
      onFollowupQuestions?: (questions: string[]) => void
      onConversationId?: (id: string) => void
      onMessageId?: (id: number) => void
      onError?: (err: any) => void
      onClose?: () => void
      // 新增推理相关回调
      onReasoningStart?: () => void
      onReasoningPartial?: (message: string) => void
      onReasoningComplete?: (fullReasoning: string) => void
      onReasoningTime?: (timeMs: number) => void
      onTitle?: (title: string) => void
      onReferences?: (references: ChatReference[]) => void
      onTokensUsed?: (tokensUsed: string) => void
      onSeuConsumed?: (seuConsumed: string) => void
    }
  }

  export const deleteAIAdviceConversation = (taskId: number, conversationId: string) =>
    NewApiInstance.request({
      url: `/tasks/${taskId}/ai-advice/conversations/${conversationId}`,
      method: 'DELETE',
    })

  export const streamAIAdviceConversation = (options: StreamAIAdviceOptions) => {
    const { taskId, question, context, conversationId, parentId, callbacks } = options

    console.log('[AI Stream] 开始流式请求:', {
      taskId,
      question: question.length > 50 ? `${question.substring(0, 50)}...` : question,
      context,
      conversationId,
      parentId,
    })

    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries({
          question,
          modelType: options.modelType,
          section: context?.section ?? '',
          index: context?.index?.toString() ?? '',
          conversationId: conversationId ?? '',
          parentId: parentId?.toString() ?? '',
        }).filter(([_, v]) => v !== '')
      )
    )

    // 创建一个函数来初始化 EventSource 连接
    const createEventSource = (token: string) => {
      const es = new EventSource(`${NEW_API_BASE_URL}/tasks/${taskId}/ai-advice/conversations/stream?${params}`, {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            headers: {
              ...(init?.headers ?? {}),
              Authorization: `Bearer ${token}`,
            },
          }),
      })

      let partialResponseCount = 0
      let reasoningContent = '' // 存储累积的推理内容
      let hasError401 = false // 标记是否遇到了 401 错误

      es.addEventListener('message', (event) => {
        if (event.data === '[DONE]') {
          console.log('[AI Stream] 流式响应完成')
          es.close()
          callbacks.onClose?.()
        } else if (event.data.startsWith('[REASONING_START]')) {
          // 模型开始推理
          console.debug('[AI Stream] 模型开始推理')
          reasoningContent = '' // 重置推理内容
          callbacks.onReasoningStart?.()
        } else if (event.data.startsWith('[REASONING_PARTIAL]')) {
          // 收到部分推理内容
          const reasoning = event.data.substring(19) // 去掉[REASONING_PARTIAL]前缀
          reasoningContent += reasoning // 累积推理内容
          console.debug(
            '[AI Stream] 收到推理部分内容:',
            reasoning.length > 50 ? `${reasoning.substring(0, 50)}...` : reasoning
          )
          callbacks.onReasoningPartial?.(reasoning)
        } else if (event.data.startsWith('[REASONING_TIME]')) {
          // 收到推理用时
          try {
            const timeMs = parseInt(event.data.substring(16)) // 去掉[REASONING_TIME]前缀
            console.debug('[AI Stream] 收到推理用时:', timeMs, 'ms', event.data.substring(16))
            callbacks.onReasoningTime?.(timeMs)
          } catch (error) {
            console.error('[AI Stream] 解析推理用时失败', error)
          }
        } else if (event.data.startsWith('[REASONING_END]')) {
          // 推理结束，可能包含完整的推理结果
          let completeReasoning = reasoningContent
          if (event.data.length > 15) {
            // 如果包含完整内容
            completeReasoning = event.data.substring(15) // 去掉[REASONING_END]前缀
          }
          console.debug('[AI Stream] 推理结束，完整内容:', completeReasoning)
          callbacks.onReasoningComplete?.(completeReasoning)
        } else if (event.data.startsWith('[PARTIAL]')) {
          partialResponseCount++
          const message = event.data.substring(9) // 去掉[PARTIAL]前缀
          console.debug(`[AI Stream] 收到部分响应 #${partialResponseCount}:`, message)
          callbacks.onPartialResponse?.(message)
        } else if (event.data.startsWith('[RESPONSE]')) {
          const message = event.data.substring(10) // 去掉[RESPONSE]前缀
          console.debug('[AI Stream] 收到完整响应（共${message.length}字符）：', message)
          callbacks.onCompleteResponse?.(message)
        } else if (event.data.startsWith('[FOLLOWUPQUESTIONS]')) {
          try {
            const questionsJson = event.data.substring(19) // 去掉[FOLLOWUPQUESTIONS]前缀
            const questions = JSON.parse(questionsJson)
            console.debug('[AI Stream] 收到后续问题:', questions)
            callbacks.onFollowupQuestions?.(questions)
          } catch (error) {
            console.error('[AI Stream] 解析后续问题失败', error)
          }
        } else if (event.data.startsWith('[CONVERSATION_ID]')) {
          const convId = event.data.substring(17) // 去掉[CONVERSATION_ID]前缀
          console.debug('[AI Stream] 收到会话ID:', convId)
          callbacks.onConversationId?.(convId)
        } else if (event.data.startsWith('[MESSAGE_ID]')) {
          try {
            const messageId = parseInt(event.data.substring(12)) // 去掉[MESSAGE_ID]前缀
            console.debug('[AI Stream] 收到消息ID:', messageId)
            callbacks.onMessageId?.(messageId)
          } catch (error) {
            console.error('[AI Stream] 解析消息ID失败', error)
          }
        } else if (event.data.startsWith('[TITLE]')) {
          const title = event.data.substring(7) // 去掉[TITLE]前缀
          console.debug('[AI Stream] 收到标题:', title)
          callbacks.onTitle?.(title)
        } else if (event.data.startsWith('[REFERENCES]')) {
          const referencesJson = event.data.substring(12) // 去掉[REFERENCES]前缀
          const references = JSON.parse(referencesJson)
          console.debug('[AI Stream] 收到参考文献:', references)
          callbacks.onReferences?.(references)
        } else if (event.data.startsWith('[TOKENS_USED]')) {
          const tokensUsed = event.data.substring(13) // 去掉[TOKENS_USED]前缀
          console.debug('[AI Stream] 收到令牌用量:', tokensUsed)
          callbacks.onTokensUsed?.(tokensUsed)
        } else if (event.data.startsWith('[SEU_CONSUMED]')) {
          const seuConsumed = event.data.substring(14) // 去掉[SEU_CONSUMED]前缀
          console.debug('[AI Stream] 收到SEU消耗:', seuConsumed)
          callbacks.onSeuConsumed?.(seuConsumed)
        } else if (event.data.startsWith('[ERROR]')) {
          const error = event.data.substring(7) // 去掉[ERROR]前缀
          console.error('[AI Stream] 收到错误:', error)
          callbacks.onError?.(error)
        } else {
          console.debug('[AI Stream] 收到未知格式消息:', event.data)
        }
      })

      es.addEventListener('error', (event: any) => {
        console.error('[AI Stream] 流式响应错误:', event)

        // 检查是否为 401 错误（根据状态码或响应内容）
        if (
          (event.code === 401 || event.message?.includes('401') || event.message?.includes('unauthorized')) &&
          !hasError401
        ) {
          console.debug('[AI Stream] 检测到 401 错误，尝试刷新 token')
          hasError401 = true

          // 关闭当前连接
          es.close()

          // 刷新 token 并重新连接
          refreshTokenForEventSource((newToken) => {
            console.debug('[AI Stream] Token 已刷新，重新建立连接')
            // 重新创建 EventSource 连接
            const newEs = createEventSource(newToken)
            // 返回新连接的关闭函数
            currentClose = newEs.close
          })
        } else if (event.message) {
          callbacks.onError?.(event.message)
        }
      })

      return {
        close: () => {
          console.debug('[AI Stream] 手动关闭流')
          es.close()
        },
      }
    }

    // 初始化第一个 EventSource 连接
    const initialEs = createEventSource(AccountService.accessToken || '')
    // 用于存储当前活动的关闭函数
    let currentClose = initialEs.close

    return {
      close: () => {
        console.debug('[AI Stream] 手动关闭流')
        currentClose()
      },
    }
  }
}
