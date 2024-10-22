<template>
  <v-sheet flat rounded="lg">
    <v-toolbar
      :title="isEditing ? t('spaces.detail.templateForm.editTitle') : t('spaces.detail.templateForm.createTitle')"
      color="transparent"
      density="compact"
    >
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">{{
          t('spaces.detail.templateForm.back')
        }}</v-btn>
      </template>
    </v-toolbar>

    <v-form ref="form" class="pa-4" @submit.prevent="saveTemplate">
      <v-text-field
        v-model="template.name"
        :label="t('spaces.detail.templateForm.templateName')"
        required
      ></v-text-field>
      <v-textarea
        v-model="template.description"
        :label="t('spaces.detail.templateForm.templateDescription')"
        rows="3"
      ></v-textarea>
      <v-text-field
        v-model="template.title"
        :label="t('spaces.detail.templateForm.contestTitle')"
        required
      ></v-text-field>
      <TipTapEditor
        v-model="template.content"
        output="json"
        rounded
        :min-height="200"
        :max-height="1000"
        editor-class="tiptap-editor"
        :title="t('spaces.detail.templateForm.contestDescription')"
      />
      <div class="d-flex justify-end mt-4">
        <v-btn type="submit" color="primary">{{ t('spaces.detail.templateForm.save') }}</v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'

import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { storeToRefs } from 'pinia'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { useSpaceStore } from '@/store/space'

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

const { t } = useI18n()

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
    console.error(t('spaces.detail.templateForm.loadTemplateFailed'), error)
    toast.error(t('spaces.detail.templateForm.loadTemplateFailed'))
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

    toast.success(
      isEditing.value ? t('spaces.detail.templateForm.updateSuccess') : t('spaces.detail.templateForm.createSuccess')
    )
    router.push({ name: 'SpacesDetailManageTemplates', params: { spaceId } })
  } catch (error) {
    console.error(t('spaces.detail.templateForm.saveTemplateFailed'), error)
    toast.error(t('spaces.detail.templateForm.saveTemplateFailed'))
  }
}

const goBack = () => {
  router.go(-1)
}
</script>
