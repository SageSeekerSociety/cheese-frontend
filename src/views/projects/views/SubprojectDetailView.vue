<template>
  <div class="subproject-detail pa-4">
    <div v-if="loading" class="d-flex justify-center my-8">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>

    <template v-else>
      <!-- 根据当前section参数展示不同的内容 -->
      <component :is="currentView" :project="project" :subproject="subproject" @refresh="$emit('refresh')" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '@/types'

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import SubprojectDiscussions from './subproject/SubprojectDiscussions.vue'
// 导入各个子项目内容组件
import SubprojectOverview from './subproject/SubprojectOverview.vue'

import { ProjectsApi } from '@/network/api/projects'

const props = defineProps<{
  project: Project | null
  subprojects: Project[]
}>()

defineEmits(['refresh'])

const route = useRoute()
const loading = ref(true)
const subproject = ref<Project | null>(null)

const subprojectId = computed(() => Number(route.params.subprojectId))

// 当前显示的内容部分
const currentSection = computed(() => {
  return String(route.query.section || 'overview')
})

// 根据当前section动态选择要显示的组件
const currentView = computed(() => {
  switch (currentSection.value) {
    case 'discussions':
      return SubprojectDiscussions
    case 'overview':
    default:
      return SubprojectOverview
  }
})

// 从父组件传递的subprojects中查找当前子项目
const findSubprojectFromProps = () => {
  if (subprojectId.value && props.subprojects && props.subprojects.length > 0) {
    const found = props.subprojects.find((sp) => sp.id === subprojectId.value)
    if (found) {
      subproject.value = found
      loading.value = false
      return true
    }
  }
  return false
}

// 获取子项目详情
const fetchSubproject = async () => {
  if (!subprojectId.value) return

  // 先尝试从props中获取
  if (findSubprojectFromProps()) return

  try {
    loading.value = true
    const response = await ProjectsApi.detail(subprojectId.value)
    subproject.value = response.data.project
  } catch (error) {
    console.error('获取子项目详情失败', error)
  } finally {
    loading.value = false
  }
}

// 监听子项目ID变化，重新加载数据
watch(
  () => subprojectId.value,
  () => {
    fetchSubproject()
  }
)

// 监听props中的subprojects变化
watch(
  () => props.subprojects,
  () => {
    if (loading.value || !subproject.value) {
      findSubprojectFromProps()
    }
  },
  { deep: true }
)

// 初始化
onMounted(() => {
  fetchSubproject()
})
</script>

<style scoped>
.subproject-detail {
  min-height: 500px;
}
</style>
