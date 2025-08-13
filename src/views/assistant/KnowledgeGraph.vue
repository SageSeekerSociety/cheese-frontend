<template>
  <div class="knowledge-graph-view pa-4">
    <div class="max-width-container">
      <!-- 页面标题 -->
      <div class="d-flex align-center justify-space-between mb-6">
        <div>
          <h1 class="text-h4 font-weight-medium mb-2">知识图谱</h1>
          <p class="text-subtitle-1 text-medium-emphasis">可视化展示知识实体之间的关系，构建个人知识网络</p>
        </div>
        <div class="d-flex gap-2">
          <v-btn-toggle v-model="viewMode" mandatory>
            <v-btn value="graph" icon="mdi-graph"></v-btn>
            <v-btn value="list" icon="mdi-view-list"></v-btn>
          </v-btn-toggle>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="showAddDialog = true"> 添加实体 </v-btn>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <v-card flat border class="mb-6">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                placeholder="搜索实体名称..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                clearable
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="selectedType"
                :items="entityTypes"
                label="实体类型"
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
            <v-col cols="12" md="2">
              <v-btn block variant="outlined" prepend-icon="mdi-refresh" @click="refreshGraph"> 刷新 </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 图谱视图 -->
      <v-card v-if="viewMode === 'graph'" border class="mb-6">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>知识网络图</span>
          <div class="d-flex gap-2">
            <v-btn-toggle v-model="graphLayout" size="small">
              <v-btn value="force">力导向</v-btn>
              <v-btn value="circular">环形</v-btn>
              <v-btn value="hierarchical">层次</v-btn>
            </v-btn-toggle>
          </div>
        </v-card-title>
        <v-card-text>
          <div ref="graphContainer" class="graph-container">
            <!-- 这里将集成图谱可视化组件 -->
            <div class="graph-placeholder">
              <v-icon icon="mdi-graph" size="64" class="text-medium-emphasis mb-4"></v-icon>
              <p class="text-body-1 text-medium-emphasis">知识图谱可视化</p>
              <p class="text-body-2 text-medium-emphasis">
                {{ entities.length }} 个实体，{{ relationships.length }} 个关系
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- 列表视图 -->
      <div v-else>
        <!-- 实体列表 -->
        <v-card border class="mb-6">
          <v-card-title>
            <span>实体列表</span>
            <v-spacer></v-spacer>
            <v-chip>{{ filteredEntities.length }} 个实体</v-chip>
          </v-card-title>
          <v-card-text>
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>

            <div v-else-if="filteredEntities.length === 0" class="text-center py-8">
              <v-icon icon="mdi-database" size="64" class="text-medium-emphasis mb-4"></v-icon>
              <h3 class="text-h6 mb-2">暂无知识实体</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                {{ searchQuery ? '没有找到匹配的实体' : '开始构建您的知识图谱' }}
              </p>
              <v-btn v-if="!searchQuery" color="primary" @click="showAddDialog = true"> 添加第一个实体 </v-btn>
            </div>

            <div v-else class="entity-grid">
              <v-card
                v-for="entity in filteredEntities"
                :key="entity.id"
                border
                hover
                class="mb-4"
                @click="selectEntity(entity)"
              >
                <v-card-text>
                  <div class="d-flex align-start justify-space-between mb-3">
                    <div class="d-flex align-center">
                      <v-avatar size="32" class="mr-3">
                        <v-icon :icon="getEntityIcon(entity.type)" :color="getEntityColor(entity.type)"></v-icon>
                      </v-avatar>
                      <div>
                        <div class="text-body-1 font-weight-medium">{{ entity.name }}</div>
                        <div class="text-caption text-medium-emphasis">{{ getEntityTypeLabel(entity.type) }}</div>
                      </div>
                    </div>
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn icon="mdi-dots-vertical" size="small" variant="text" v-bind="props" @click.stop></v-btn>
                      </template>
                      <v-list density="compact">
                        <v-list-item @click="editEntity(entity)">
                          <v-list-item-title>编辑</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="viewRelationships(entity)">
                          <v-list-item-title>查看关系</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteEntity(entity)">
                          <v-list-item-title>删除</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <div v-if="entity.description" class="text-body-2 mb-3">
                    {{ entity.description }}
                  </div>

                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex gap-2">
                      <v-chip size="x-small" variant="outlined"> {{ entity.relationships.length }} 个关系 </v-chip>
                      <v-chip size="x-small" variant="outlined"> {{ entity.mentions }} 次提及 </v-chip>
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(entity.createdAt) }}
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>

        <!-- 关系列表 -->
        <v-card border>
          <v-card-title>
            <span>关系网络</span>
            <v-spacer></v-spacer>
            <v-chip>{{ relationships.length }} 个关系</v-chip>
          </v-card-title>
          <v-card-text>
            <div v-if="relationships.length === 0" class="text-center py-8">
              <v-icon icon="mdi-vector-link" size="64" class="text-medium-emphasis mb-4"></v-icon>
              <h3 class="text-h6 mb-2">暂无关系数据</h3>
              <p class="text-body-2 text-medium-emphasis">实体之间的关系将在此显示</p>
            </div>

            <div v-else>
              <v-list>
                <v-list-item v-for="relationship in relationships" :key="relationship.id" class="border rounded mb-2">
                  <template #prepend>
                    <v-avatar size="24">
                      <v-icon icon="mdi-vector-link" size="16"></v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title>
                    <span class="font-weight-medium">{{ relationship.sourceEntity.name }}</span>
                    <v-icon icon="mdi-arrow-right" size="16" class="mx-2"></v-icon>
                    <span class="text-primary">{{ relationship.relationshipType }}</span>
                    <v-icon icon="mdi-arrow-right" size="16" class="mx-2"></v-icon>
                    <span class="font-weight-medium">{{ relationship.targetEntity.name }}</span>
                  </v-list-item-title>

                  <v-list-item-subtitle v-if="relationship.description">
                    {{ relationship.description }}
                  </v-list-item-subtitle>

                  <template #append>
                    <div class="text-caption text-medium-emphasis">强度: {{ relationship.strength }}</div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- 添加/编辑实体对话框 -->
      <v-dialog v-model="showAddDialog" max-width="600">
        <v-card>
          <v-card-title>{{ editingEntity ? '编辑实体' : '添加实体' }}</v-card-title>
          <v-card-text>
            <v-text-field v-model="entityForm.name" label="实体名称" variant="outlined" class="mb-4"></v-text-field>

            <v-select
              v-model="entityForm.type"
              :items="entityTypes"
              label="实体类型"
              variant="outlined"
              class="mb-4"
            ></v-select>

            <v-textarea v-model="entityForm.description" label="描述" variant="outlined" rows="3"></v-textarea>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn @click="cancelEdit">取消</v-btn>
            <v-btn color="primary" @click="saveEntity">保存</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// 数据
const loading = ref(true)
const viewMode = ref('list')
const graphLayout = ref('force')
const searchQuery = ref('')
const selectedType = ref('')
const sortBy = ref('created_desc')
const showAddDialog = ref(false)
const editingEntity = ref<any>(null)

// 表单数据
const entityForm = ref({
  name: '',
  type: 'concept',
  description: '',
})

// 配置选项
const entityTypes = [
  { title: '概念', value: 'concept' },
  { title: '人物', value: 'person' },
  { title: '地点', value: 'location' },
  { title: '事件', value: 'event' },
  { title: '技术', value: 'technology' },
  { title: '项目', value: 'project' },
  { title: '其他', value: 'other' },
]

const sortOptions = [
  { title: '创建时间 (最新)', value: 'created_desc' },
  { title: '创建时间 (最早)', value: 'created_asc' },
  { title: '提及次数 (最多)', value: 'mentions_desc' },
  { title: '关系数量 (最多)', value: 'relationships_desc' },
]

// 模拟数据
const entities = ref([
  {
    id: '1',
    name: 'Vue.js',
    type: 'technology',
    description: '渐进式JavaScript框架，用于构建用户界面',
    createdAt: new Date('2024-01-15'),
    mentions: 15,
    relationships: ['2', '3'],
  },
  {
    id: '2',
    name: 'TypeScript',
    type: 'technology',
    description: 'JavaScript的超集，添加了静态类型定义',
    createdAt: new Date('2024-01-14'),
    mentions: 12,
    relationships: ['1', '4'],
  },
  {
    id: '3',
    name: 'Cheese平台',
    type: 'project',
    description: '学业社区平台项目',
    createdAt: new Date('2024-01-13'),
    mentions: 8,
    relationships: ['1'],
  },
])

const relationships = ref([
  {
    id: 'r1',
    sourceEntity: { id: '1', name: 'Vue.js' },
    targetEntity: { id: '2', name: 'TypeScript' },
    relationshipType: '配合使用',
    description: 'Vue.js项目中使用TypeScript提供类型安全',
    strength: 0.9,
  },
  {
    id: 'r2',
    sourceEntity: { id: '3', name: 'Cheese平台' },
    targetEntity: { id: '1', name: 'Vue.js' },
    relationshipType: '使用技术',
    description: 'Cheese平台前端使用Vue.js开发',
    strength: 0.8,
  },
])

// 计算属性
const filteredEntities = computed(() => {
  let filtered = [...entities.value]

  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (entity) => entity.name.toLowerCase().includes(query) || entity.description.toLowerCase().includes(query)
    )
  }

  // 类型过滤
  if (selectedType.value) {
    filtered = filtered.filter((entity) => entity.type === selectedType.value)
  }

  // 排序
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'created_desc':
        return b.createdAt.getTime() - a.createdAt.getTime()
      case 'created_asc':
        return a.createdAt.getTime() - b.createdAt.getTime()
      case 'mentions_desc':
        return b.mentions - a.mentions
      case 'relationships_desc':
        return b.relationships.length - a.relationships.length
      default:
        return 0
    }
  })

  return filtered
})

// 生命周期
onMounted(async () => {
  await loadKnowledgeGraph()
})

// 方法
const loadKnowledgeGraph = async () => {
  try {
    loading.value = true
    // TODO: 从API加载知识图谱数据
    await new Promise((resolve) => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('加载知识图谱失败:', error)
  } finally {
    loading.value = false
  }
}

const getEntityTypeLabel = (type: string) => {
  const typeOption = entityTypes.find((t) => t.value === type)
  return typeOption?.title || '其他'
}

const getEntityIcon = (type: string) => {
  const icons: Record<string, string> = {
    concept: 'mdi-lightbulb',
    person: 'mdi-account',
    location: 'mdi-map-marker',
    event: 'mdi-calendar',
    technology: 'mdi-cog',
    project: 'mdi-folder',
    other: 'mdi-help-circle',
  }
  return icons[type] || 'mdi-help-circle'
}

const getEntityColor = (type: string) => {
  const colors: Record<string, string> = {
    concept: 'blue',
    person: 'green',
    location: 'orange',
    event: 'purple',
    technology: 'red',
    project: 'indigo',
    other: 'grey',
  }
  return colors[type] || 'grey'
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('zh-CN')
}

const selectEntity = (entity: any) => {
  // TODO: 显示实体详情
  console.log('选择实体:', entity)
}

const editEntity = (entity: any) => {
  editingEntity.value = entity
  entityForm.value = { ...entity }
  showAddDialog.value = true
}

const deleteEntity = async (entity: any) => {
  // TODO: 实现删除逻辑
  const index = entities.value.findIndex((e) => e.id === entity.id)
  if (index > -1) {
    entities.value.splice(index, 1)
  }
}

const viewRelationships = (entity: any) => {
  // TODO: 显示实体关系详情
  console.log('查看关系:', entity)
}

const saveEntity = async () => {
  // TODO: 调用API保存实体
  if (editingEntity.value) {
    // 编辑模式
    const index = entities.value.findIndex((e) => e.id === editingEntity.value!.id)
    if (index > -1) {
      entities.value[index] = { ...entities.value[index], ...entityForm.value }
    }
  } else {
    // 新增模式
    const newEntity = {
      ...entityForm.value,
      id: Date.now().toString(),
      createdAt: new Date(),
      mentions: 0,
      relationships: [],
    }
    entities.value.unshift(newEntity)
  }

  cancelEdit()
}

const cancelEdit = () => {
  showAddDialog.value = false
  editingEntity.value = null
  entityForm.value = {
    name: '',
    type: 'concept',
    description: '',
  }
}

const refreshGraph = async () => {
  await loadKnowledgeGraph()
}
</script>

<style scoped>
.knowledge-graph-view {
  min-height: calc(100vh - 64px);
}

.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}

.graph-container {
  height: 500px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

.graph-placeholder {
  text-align: center;
}

.entity-grid {
  display: grid;
  gap: 1rem;
}
</style>
