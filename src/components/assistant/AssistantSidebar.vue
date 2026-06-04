<template>
  <div class="d-flex flex-column h-100">
    <!-- 侧边栏头部 -->
    <div class="page-header">
      <template v-if="expanded">
        <span class="text-subtitle-1">元思</span>
        <v-spacer></v-spacer>
      </template>
      <v-btn
        variant="text"
        :icon="expanded ? 'mdi-chevron-left' : 'mdi-chevron-right'"
        size="small"
        color="text"
        @click="$emit('toggle-expand')"
      ></v-btn>
    </div>

    <!-- 新对话按钮 -->
    <v-list nav :lines="false" density="compact">
      <v-list-item
        v-for="item in navigationItems"
        :key="item.key"
        rounded="lg"
        :title="item.title"
        @click="handleNavigation(item)"
      >
        <template #prepend>
          <v-icon :icon="item.icon" size="small"></v-icon>
        </template>
      </v-list-item>
    </v-list>

    <div v-if="expanded && loading" class="pa-4 text-center">
      <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
      <p class="text-body-2 text-medium-emphasis mt-2">加载中...</p>
    </div>

    <v-list v-else-if="expanded" nav :lines="false" density="compact" class="flex-grow-1 overflow-auto">
      <v-list-subheader> 最近对话 </v-list-subheader>
      <v-list-item
        v-for="conversation in conversations"
        :key="conversation.id"
        rounded="lg"
        :to="`/assistant/conversations/${conversation.id}`"
        class="conversation-item"
      >
        <v-list-item-title class="text-truncate conversation-title">
          {{ conversation.title }}
        </v-list-item-title>

        <template #append>
          <v-menu>
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-horizontal"
                size="x-small"
                variant="text"
                class="conversation-menu-btn"
                v-bind="props"
                @click.prevent.stop
              ></v-btn>
            </template>
            <v-list density="compact">
              <v-list-item @click="renameConversation(conversation)">
                <template #prepend>
                  <v-icon icon="mdi-pencil" size="16"></v-icon>
                </template>
                <v-list-item-title>重命名</v-list-item-title>
              </v-list-item>
              <v-list-item @click="deleteConversation(conversation)">
                <template #prepend>
                  <v-icon icon="mdi-delete" size="16" color="error"></v-icon>
                </template>
                <v-list-item-title class="text-error">删除</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-list-item>
    </v-list>

    <!-- 空状态 -->
    <div
      v-if="expanded && !loading && conversations.length === 0"
      class="empty-state d-flex flex-column justify-center align-center h-100 pa-4"
    >
      <v-icon icon="mdi-message-outline" size="48" class="text-medium-emphasis mb-2"></v-icon>
      <p class="text-body-2 text-medium-emphasis">还没有对话记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { assistantService } from '@/services/assistantService'

interface Props {
  expanded: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'toggle-expand': []
}>()
const router = useRouter()

// 导航项配置 - 模仿ChatGPT的简洁设计
interface NavigationItem {
  key: string
  title: string
  icon: string
  action: string
}

const navigationItems: NavigationItem[] = [
  {
    key: 'new-chat',
    title: '新对话',
    icon: 'mdi-circle-edit-outline',
    action: 'new-chat',
  },
]

// 对话数据
interface Conversation {
  id: string
  title: string
  lastActivity: Date
}

const conversations = ref<Conversation[]>([])
const loading = ref(true)

// 处理导航操作
const handleNavigation = (item: NavigationItem) => {
  if (item.action === 'new-chat') {
    createNewConversation()
  }
}

// 加载对话列表
const loadConversations = async () => {
  try {
    loading.value = true
    const conversationsData = await assistantService.getConversations()
    conversations.value = conversationsData
  } catch (error) {
    console.error('加载对话列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 创建新对话
const createNewConversation = () => {
  router.push({ name: 'AssistantIndex' }).catch((error) => {
    console.error('跳转到助手首页失败:', error)
  })
}

// 重命名对话
const renameConversation = (conversation: Conversation) => {
  // TODO: 实现重命名功能
  console.log('重命名对话:', conversation)
}

// 删除对话
const deleteConversation = (conversation: Conversation) => {
  // TODO: 实现删除功能
  console.log('删除对话:', conversation)
}

// 组件挂载时加载数据
onMounted(() => {
  loadConversations()
})
</script>

<style scoped>
.v-list-item {
  min-height: 44px;
}

.v-list-item--active {
  background-color: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.conversation-item:hover .conversation-menu-btn {
  opacity: 1;
}

.conversation-title {
  font-size: 0.875rem !important;
  font-weight: 400 !important;
  line-height: 1.2 !important;
}

.conversation-menu-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

/* 新对话按钮样式 */
.v-btn {
  text-transform: none !important;
  font-weight: 500 !important;
}

/* 折叠状态下的按钮样式 */
.collapsed-btn {
  width: 30px !important;
  height: 30px !important;
  min-width: 30px !important;
  border-radius: 8px !important;
  margin: 0 auto !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

.collapsed-btn .v-btn__content {
  flex: none !important;
}

/* 空状态样式 */
.empty-state {
  flex: 1;
  min-height: 500px;
}
</style>
