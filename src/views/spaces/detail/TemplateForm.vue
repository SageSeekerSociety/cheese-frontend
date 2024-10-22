<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="isEditing ? '编辑赛题模板' : '创建赛题模板'" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">返回</v-btn>
      </template>
    </v-toolbar>

    <v-form ref="form" class="pa-4" @submit.prevent="saveTemplate">
      <v-text-field v-model="template.name" label="模板名称" required></v-text-field>
      <v-textarea v-model="template.description" label="模板描述" rows="3"></v-textarea>
      <v-text-field v-model="template.title" label="赛题标题" required></v-text-field>
      <TipTapEditor
        v-model="template.content"
        output="json"
        rounded
        :min-height="200"
        :max-height="1000"
        editor-class="tiptap-editor"
        title="赛题描述"
      />
      <div class="d-flex justify-end mt-4">
        <v-btn type="submit" color="primary">保存</v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { JSONContent } from 'vuetify-pro-tiptap'
import { toast } from 'vuetify-sonner'
import { useSpaceStore } from '@/store/space'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const spaceId = Number(route.params.spaceId)
const templateIndex = route.params.templateIndex ? Number(route.params.templateIndex) : undefined

const spaceStore = useSpaceStore()
const { currentSpace, templates } = storeToRefs(spaceStore)

const isEditing = computed(() => templateIndex !== undefined)

const template = ref({
  name: '',
  description: '',
  title: '',
  content: {} as JSONContent,
})

onMounted(async () => {
  if (isEditing.value) {
    await loadTemplate()
  }
})

const loadTemplate = async () => {
  if (!currentSpace.value) return

  try {
    if (templateIndex !== undefined && templates.value[templateIndex]) {
      const templateData = templates.value[templateIndex]
      template.value = {
        name: templateData.name,
        description: templateData.description,
        title: templateData.title,
        content: JSON.parse(templateData.content),
      }
    }
  } catch (error) {
    console.error('加载模板失败:', error)
  }
}

const saveTemplate = async () => {
  if (!currentSpace.value) return

  try {
    let updatedTemplates = [...templates.value]

    const updatedTemplate = {
      ...template.value,
      content: JSON.stringify(template.value.content),
    }

    if (isEditing.value && templateIndex !== undefined) {
      updatedTemplates[templateIndex] = updatedTemplate
    } else {
      updatedTemplates.push(updatedTemplate)
    }

    await spaceStore.updateTemplates(updatedTemplates)

    router.push({ name: 'SpacesDetailManageTemplates', params: { spaceId } })
  } catch (error) {
    console.error('保存模板失败:', error)
  }
}

const goBack = () => {
  router.go(-1)
}
</script>
