<template>
  <div class="memory-view pa-4">
    <div class="max-width-container">
      <!-- 页面标题 -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-medium mb-2">记忆管理</h1>
          <p class="text-subtitle-1 text-medium-emphasis">管理AI助手的长期记忆，包括重要信息、偏好设置和知识点</p>
        </div>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true"> 添加记忆 </v-btn>
      </div>

      <!-- 搜索和筛选 -->
      <v-card flat border class="mb-6">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="searchQuery"
                placeholder="搜索记忆内容..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedCategory"
                :items="categoryOptions"
                label="分类筛选"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              ></v-select>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                label="排序方式"
                variant="outlined"
                density="compact"
                hide-details
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 记忆列表 -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </div>

      <div v-else-if="filteredMemories.length === 0" class="text-center py-8">
        <v-icon icon="mdi-brain" size="64" class="text-medium-emphasis mb-4"></v-icon>
        <h3 class="text-h6 mb-2">暂无记忆内容</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ searchQuery ? '没有找到匹配的记忆' : 'AI助手还没有形成长期记忆' }}
        </p>
        <v-btn v-if="!searchQuery" color="primary" @click="showAddDialog = true"> 添加第一个记忆 </v-btn>
      </div>

      <div v-else class="memory-grid">
        <v-card v-for="memory in filteredMemories" :key="memory.id" border hover class="mb-4">
          <v-card-text>
            <div class="d-flex align-start justify-space-between mb-3">
              <v-chip :color="getCategoryColor(memory.category)" size="small" label>
                {{ getCategoryLabel(memory.category) }}
              </v-chip>
              <div class="text-caption text-medium-emphasis">
                {{ formatDate(memory.createdAt) }}
              </div>
            </div>

            <div class="memory-content mb-3">
              <div class="text-body-1 font-weight-medium mb-2">
                {{ memory.title || '未命名记忆' }}
              </div>
              <div class="text-body-2">
                {{ memory.content }}
              </div>
            </div>

            <!-- 来源信息 -->
            <div v-if="memory.sourceMessages.length > 0" class="mb-3">
              <div class="text-caption text-medium-emphasis mb-1">来源对话：</div>
              <v-chip
                v-for="source in memory.sourceMessages.slice(0, 3)"
                :key="source.id"
                size="x-small"
                variant="outlined"
                class="mr-1"
                @click="goToMessage(source)"
              >
                {{ source.conversationTitle }}
              </v-chip>
              <span v-if="memory.sourceMessages.length > 3" class="text-caption">
                +{{ memory.sourceMessages.length - 3 }}个
              </span>
            </div>

            <!-- 操作按钮 -->
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-chip
                  :color="
                    memory.importance === 'high' ? 'error' : memory.importance === 'medium' ? 'warning' : 'success'
                  "
                  size="x-small"
                  variant="outlined"
                >
                  {{ getImportanceLabel(memory.importance) }}
                </v-chip>
                <span class="text-caption text-medium-emphasis ml-2"> 访问 {{ memory.accessCount }} 次 </span>
              </div>

              <div>
                <v-btn icon="mdi-pencil" size="small" variant="text" @click="editMemory(memory)"></v-btn>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteMemory(memory)"
                ></v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- 添加/编辑记忆对话框 -->
      <v-dialog v-model="showAddDialog" max-width="600">
        <v-card>
          <v-card-title>{{ editingMemory ? '编辑记忆' : '添加记忆' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="memoryForm.title" label="标题" variant="outlined" class="mb-4"></v-text-field>

            <v-textarea v-model="memoryForm.content" label="内容" variant="outlined" rows="4" class="mb-4"></v-textarea>

            <v-select
              v-model="memoryForm.category"
              :items="categoryOptions"
              label="分类"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-select
              v-model="memoryForm.importance"
              :items="importanceOptions"
              label="重要性"
              variant="outlined"
            ></v-select>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="cancelEdit">取消</v-btn>
            <v-btn color="primary" @click="saveMemory">保存</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import { assistantService } from '@/services/assistantService'

// 数据
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const sortBy = ref('created_desc')
const showAddDialog = ref(false)
const editingMemory = ref<Memory | null>(null)

// 表单数据
const memoryForm = ref({
  title: '',
  content: '',
  category: 'uncategorized',
  importance: 'medium',
})

// 配置选项
const categoryOptions = [
  { title: '身份角色', value: 'identity_role' },
  { title: '目标任务', value: 'goals_tasks' },
  { title: '知识领域', value: 'knowledge_domain' },
  { title: '实体概念', value: 'entities_concepts' },
  { title: '偏好设置', value: 'preferences' },
  { title: '未分类', value: 'uncategorized' },
]

const importanceOptions = [
  { title: '高', value: 'high' },
  { title: '中', value: 'medium' },
  { title: '低', value: 'low' },
]

const sortOptions = [
  { title: '创建时间 (最新)', value: 'created_desc' },
  { title: '创建时间 (最早)', value: 'created_asc' },
  { title: '访问次数 (最多)', value: 'access_desc' },
  { title: '重要性 (最高)', value: 'importance_desc' },
]

// 记忆数据
interface Memory {
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
}

const memories = ref<Memory[]>([])

// 计算属性
const filteredMemories = computed(() => {
  let filtered = [...memories.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (memory) => memory.title.toLowerCase().includes(query) || memory.content.toLowerCase().includes(query)
    )
  }

  // 分类过滤
  if (selectedCategory.value) {
    filtered = filtered.filter((memory) => memory.category === selectedCategory.value)
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'created_desc':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'created_asc':
        return a.createdAt.getTime() - b.createdAt.getTime()
      case 'access_desc':
        return b.accessCount - a.accessCount
      case 'importance_desc': {
        const importanceOrder: Record<string, number> = { high: 3, medium: 2, low: 1 }
        return importanceOrder[b.importance] - importanceOrder[a.importance]
      }
      default:
        return 0
    }
  })

  return filtered
})

// 生命周期
onMounted(async () => {
  await loadMemories()
})

// 方法
const loadMemories = async () => {
  try {
    loading.value = true
    // 从 ProjectMetis API 加载记忆数据
    const memoriesData = await assistantService.getMemories()
    memories.value = memoriesData
  } catch (error) {
    console.error('加载记忆失败:', error)
  } finally {
    loading.value = false
  }
}

const getCategoryLabel = (category: string) => {
  const option = categoryOptions.find((opt) => opt.value === category)
  return option?.title || '未知分类'
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    identity_role: 'purple',
    goals_tasks: 'blue',
    knowledge_domain: 'green',
    entities_concepts: 'orange',
    preferences: 'pink',
    uncategorized: 'grey',
  }
  return colors[category] || 'grey'
}

const getImportanceLabel = (importance: string) => {
  const labels: Record<string, string> = { high: '高', medium: '中', low: '低' }
  return labels[importance] || '中'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN')
}

const editMemory = (memory: Memory) => {
  editingMemory.value = memory
  memoryForm.value = { ...memory }
  showAddDialog.value = true
}

const deleteMemory = async (memory: Memory) => {
  // TODO: 实现删除逻辑
  const index = memories.value.findIndex((m) => m.id === memory.id)
  if (index > -1) {
    memories.value.splice(index, 1)
  }
}

const saveMemory = async () => {
  // TODO: 调用API保存记忆
  if (editingMemory.value) {
    // 编辑模式
    const index = memories.value.findIndex((m) => m.id === editingMemory.value!.id)
    if (index > -1) {
      memories.value[index] = { ...memories.value[index], ...memoryForm.value }
    }
  } else {
    // 新增模式
    const newMemory = {
      ...memoryForm.value,
      id: Date.now().toString(),
      createdAt: new Date(),
      accessCount: 0,
      sourceMessages: [],
    }
    memories.value.unshift(newMemory)
  }

  cancelEdit()
}

const cancelEdit = () => {
  showAddDialog.value = false
  editingMemory.value = null
  memoryForm.value = {
    title: '',
    content: '',
    category: 'uncategorized',
    importance: 'medium',
  }
}

const goToMessage = (source: { id: string; conversationTitle: string }) => {
  // TODO: 跳转到对应的消息
  console.log('跳转到消息:', source)
}
</script>

<style scoped>
.memory-view {
  min-height: calc(100vh - 64px);
}

.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}

.memory-grid {
  display: grid;
  gap: 1rem;
}

.memory-content {
  line-height: 1.6;
}
</style>
