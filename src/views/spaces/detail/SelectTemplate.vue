<template>
  <v-sheet flat rounded="lg">
    <v-toolbar title="选择赛题模板" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">返回</v-btn>
      </template>
    </v-toolbar>

    <v-list>
      <v-list-item prepend-icon="mdi-file-outline" title="从空白赛题开始" @click="selectTemplate(null)"></v-list-item>
      <v-list-item
        v-for="(template, index) in templates"
        :key="index"
        :title="template.name"
        :subtitle="template.description"
        @click="selectTemplate(template)"
      >
        <template #prepend>
          <v-icon>mdi-file-document-outline</v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SpacesApi } from '@/network/api/spaces'
import { SpaceTaskTemplate } from '@/types'

const router = useRouter()
const route = useRoute()
const spaceId = Number(route.params.spaceId)

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

const selectTemplate = (template: SpaceTaskTemplate | null) => {
  router.push({
    name: 'SpacesDetailPublishTask',
    params: { spaceId },
    query: { templateId: template ? templates.value.indexOf(template).toString() : 'blank' },
  })
}
</script>
