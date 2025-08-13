import { MetisApi, type MetisMessageResponse, type MetisMemoryResponse, type MetisConversationResponse } from '@/network/api/metis'

export interface AssistantMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    isTyping?: boolean
}

export interface AssistantSettings {
    enableMemory: boolean
    enableKnowledgeGraph: boolean
}

export class AssistantService {
    private currentConversationId: string | null = null
    private userId: string | null = null

    async ensureUser(): Promise<string> {
        if (this.userId) return this.userId

        const key = 'metis_user_id'
        let uid = localStorage.getItem(key)
        if (!uid) {
            const user = await MetisApi.createUser()
            uid = user.user_id
            localStorage.setItem(key, uid)
        }
        this.userId = uid
        return uid
    }

    async ensureConversation(): Promise<string> {
        if (this.currentConversationId) return this.currentConversationId

        const userId = await this.ensureUser()
        const conversation = await MetisApi.createConversation(userId, 'AI助手对话')
        this.currentConversationId = conversation.conversation_id
        return this.currentConversationId
    }

    async *sendMessage(content: string): AsyncGenerator<{
        type: 'delta' | 'complete' | 'error'
        content: string
        messageId?: string
    }> {
        try {
            const conversationId = await this.ensureConversation()

            const stream = MetisApi.streamMessage(conversationId, {
                content,
                stream: true,
            })

            let fullContent = ''
            for await (const chunk of stream) {
                if (chunk.delta) {
                    fullContent += chunk.delta
                    yield {
                        type: 'delta',
                        content: chunk.delta,
                        messageId: chunk.message_id,
                    }
                }
                if (chunk.finished) {
                    yield {
                        type: 'complete',
                        content: fullContent,
                        messageId: chunk.message_id,
                    }
                    break
                }
            }
        } catch (error) {
            yield {
                type: 'error',
                content: error instanceof Error ? error.message : '发送消息失败',
            }
        }
    }

    async loadConversationHistory(): Promise<AssistantMessage[]> {
        try {
            if (!this.currentConversationId) return []

            const tree = await MetisApi.getConversationTree(this.currentConversationId)

            // 将Metis消息转换为助手消息格式
            const messages: AssistantMessage[] = []

            // 简单的消息排序，按创建时间
            const flatMessages = this.flattenMessageTree(tree.messages)
            flatMessages.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

            for (const msg of flatMessages) {
                messages.push({
                    id: msg.message_id,
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                    timestamp: new Date(msg.created_at),
                })
            }

            return messages
        } catch (error) {
            console.error('加载对话历史失败:', error)
            return []
        }
    }

    private flattenMessageTree(messages: MetisMessageResponse[]): MetisMessageResponse[] {
        const result: MetisMessageResponse[] = []

        function traverse(msgs: MetisMessageResponse[]) {
            for (const msg of msgs) {
                result.push(msg)
                if (msg.children && msg.children.length > 0) {
                    traverse(msg.children)
                }
            }
        }

        traverse(messages)
        return result
    }

    // 清除当前对话，开始新对话
    async startNewConversation(): Promise<void> {
        this.currentConversationId = null
    }

    // 获取用户的记忆列表
    async getMemories(): Promise<Array<{
        id: string
        title: string
        content: string
        category: string
        importance: string
        createdAt: Date
        accessCount: number
        sourceMessages: Array<{
            id: string
            conversationTitle: string
        }>
    }>> {
        const userId = await this.ensureUser()
        try {
            const memories = await MetisApi.getUserMemories(userId)
            return memories.map((memory: MetisMemoryResponse) => ({
                id: memory.memory_id,
                title: this.extractTitleFromContent(memory.content),
                content: memory.content,
                category: this.mapCategory(memory.content),
                importance: 'medium', // ProjectMetis没有重要性字段，默认为中等
                createdAt: new Date(memory.created_at),
                accessCount: 0, // ProjectMetis没有访问计数，默认为0
                sourceMessages: memory.source_message_ids ? memory.source_message_ids.map((id: string) => ({
                    id,
                    conversationTitle: '相关对话'
                })) : [],
            }))
        } catch (error) {
            console.error('获取记忆失败:', error)
            return []
        }
    }

    // 从内容中提取标题
    private extractTitleFromContent(content: string): string {
        // 取前30个字符作为标题
        const title = content.trim().substring(0, 30)
        return title.length < content.length ? title + '...' : title
    }

    // 根据内容映射分类
    private mapCategory(content: string): string {
        const lowerContent = content.toLowerCase()
        if (lowerContent.includes('偏好') || lowerContent.includes('喜欢') || lowerContent.includes('preference')) {
            return 'preferences'
        }
        if (lowerContent.includes('目标') || lowerContent.includes('计划') || lowerContent.includes('任务')) {
            return 'goals_tasks'
        }
        if (lowerContent.includes('知识') || lowerContent.includes('技术') || lowerContent.includes('学习')) {
            return 'knowledge_domain'
        }
        if (lowerContent.includes('身份') || lowerContent.includes('角色') || lowerContent.includes('职业')) {
            return 'identity_role'
        }
        return 'uncategorized'
    }

    // 获取用户对话列表
    async getConversations() {
        const userId = await this.ensureUser()
        try {
            const conversations = await MetisApi.getUserConversations(userId)
            return conversations.map((conv: MetisConversationResponse) => ({
                id: conv.conversation_id,
                title: conv.title || '未命名对话',
                lastActivity: new Date(conv.created_at),
            }))
        } catch (error) {
            console.error('获取对话列表失败:', error)
            return []
        }
    }

    // 获取知识图谱实体
    async getKnowledgeGraphEntities(search?: string) {
        const userId = await this.ensureUser()
        try {
            return await MetisApi.getKnowledgeGraphEntities(userId, search)
        } catch (error) {
            console.error('获取知识图谱实体失败:', error)
            return []
        }
    }
}

// 单例实例
export const assistantService = new AssistantService()