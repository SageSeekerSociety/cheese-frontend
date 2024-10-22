<template>
  <v-sheet flat rounded="lg">
    <v-toolbar title="管理赛题模板" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">返回</v-btn>
      </template>
      <template #append>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="createTemplate">创建模板</v-btn>
      </template>
    </v-toolbar>

    <v-list v-if="templates.length > 0">
      <v-list-item v-for="(template, index) in templates" :key="index" :title="template.name">
        <template #subtitle>
          {{ template.description }}
        </template>
        <template #append>
          <v-btn icon="mdi-pencil" variant="text" @click="editTemplate(index)"></v-btn>
          <v-btn icon="mdi-delete" variant="text" @click="deleteTemplate(index)"></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-sheet v-else class="pa-4 text-center">
      <p class="text-medium-emphasis">暂无任务模板</p>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SpacesApi } from '@/network/api/spaces'
import { useDialog } from '@/plugins/dialog'
import { SpaceTaskTemplate } from '@/types'

const router = useRouter()
const route = useRoute()
const spaceId = Number(route.params.spaceId)

const { confirm } = useDialog()

const templates = ref<SpaceTaskTemplate[]>([])

onMounted(async () => {
  await loadTemplates()
})

const loadTemplates = async () => {
  try {
    const response = await SpacesApi.detail(spaceId)
    const taskTemplates = JSON.parse(response.data.space.taskTemplates || '[]')
    templates.value = taskTemplates
  } catch (error) {
    console.error('加载模板失败:', error)
  }
}

const goBack = () => {
  router.go(-1)
}

const createTemplate = () => {
  router.push({ name: 'SpacesDetailCreateTemplate', params: { spaceId } })
}

const editTemplate = (index: number) => {
  router.push({ name: 'SpacesDetailEditTemplate', params: { spaceId, templateIndex: index } })
}

const deleteTemplate = async (index: number) => {
  if (confirm('确定要删除这个模板吗？')) {
    templates.value.splice(index, 1)
    await updateTemplates()
  }
}

const updateTemplates = async () => {
  try {
    await SpacesApi.update(spaceId, {
      taskTemplates: JSON.stringify(templates.value),
    })
  } catch (error) {
    console.error('更新模板失败:', error)
  }
}
</script>
