import type {
  ConversationGroupSummary,
  TaskAIAdviceConversation,
  TaskAIAdviceConversationContext,
} from '@/network/api/tasks/types'
import type { ChatMessage, ChatService, ChatStreamOptions, ContextChip, ConversationSummary } from '../types'

import { TasksApi } from '@/network/api/tasks'

/**
 * 任务AI建议聊天服务 - 将通用Chat组件适配到任务AI建议API
 */
export class TaskAIAdviceChatService implements ChatService<TaskAIAdviceConversationContext> {
  /**
   * 将API返回的对话消息转换为通用聊天消息格式
   */
  private convertMessage(msg: TaskAIAdviceConversation): ChatMessage {
    return {
      id: msg.id,
      question: msg.question,
      response: msg.response,
      modelType: msg.modelType,
      reasoningContent: msg.reasoningContent,
      reasoningTimeMs: msg.reasoningTimeMs,
      followupQuestions: msg.followupQuestions || [],
      conversationId: msg.conversationId,
      parentId: msg.parentId,
      createdAt: msg.createdAt,
    }
  }

  /**
   * 将API返回的对话组摘要转换为通用格式
   */
  private convertConversationSummary(summary: ConversationGroupSummary): ConversationSummary {
    return {
      conversationId: summary.conversationId,
      title: summary.title,
      createdAt: summary.createdAt,
      updatedAt: summary.updatedAt,
      messageCount: summary.messageCount,
      latestMessage: summary.latestMessage ? this.convertMessage(summary.latestMessage) : null,
    }
  }

  /**
   * 获取对话列表
   */
  async getConversations(contextId: number | string): Promise<ConversationSummary[]> {
    try {
      const { data } = await TasksApi.getGroupedConversations(Number(contextId))
      return data.conversations.map((conv) => this.convertConversationSummary(conv))
    } catch (error) {
      console.error('获取对话列表失败:', error)
      return []
    }
  }

  /**
   * 获取特定对话的消息历史
   */
  async getConversationById(contextId: number | string, conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data } = await TasksApi.getConversationById(Number(contextId), conversationId)
      return data.conversations.map((msg) => this.convertMessage(msg))
    } catch (error) {
      console.error('获取对话历史失败:', error)
      return []
    }
  }

  /**
   * 流式对话请求
   */
  streamConversation(options: ChatStreamOptions<TaskAIAdviceConversationContext>) {
    const { contextId, question, modelType, context, conversationId, parentId, callbacks } = options

    return TasksApi.streamAIAdviceConversation({
      taskId: Number(contextId),
      question,
      modelType,
      context,
      conversationId,
      parentId,
      callbacks,
    })
  }

  /**
   * 获取上下文标签
   * 根据任务AI建议的上下文生成对应的标签
   */
  getContextChips(context?: TaskAIAdviceConversationContext): ContextChip[] {
    const chips: ContextChip[] = []

    if (!context) return chips

    // 添加特定部分的上下文（如果有）
    if (context.section) {
      // 根据不同的部分添加不同的标签
      switch (context.section) {
        case 'knowledge_fields':
          chips.push({
            label: '知识领域',
            icon: 'mdi-lightbulb-on',
            color: 'warning',
          })
          break
        case 'learning_paths':
          chips.push({
            label: '学习路径',
            icon: 'mdi-map-marker-path',
            color: 'success',
          })
          break
        case 'methodology':
          chips.push({
            label: '实践方法论',
            icon: 'mdi-puzzle',
            color: 'secondary',
          })
          break
        case 'team_tips':
          chips.push({
            label: '团队协作建议',
            icon: 'mdi-account-group',
            color: 'info',
          })
          break
      }

      // 如果有索引，可以添加更具体的信息
      if (typeof context.index === 'number') {
        chips.push({
          label: `步骤 ${context.index + 1}`,
          icon: 'mdi-numeric',
          variant: 'tonal',
          color: 'grey',
        })
      }
    }

    return chips
  }
}
