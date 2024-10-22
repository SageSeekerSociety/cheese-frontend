<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('spaces.detail.manageTemplates.title')" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">{{
          t('spaces.detail.manageTemplates.back')
        }}</v-btn>
      </template>
      <template #append>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="createTemplate">{{
          t('spaces.detail.manageTemplates.createTemplate')
        }}</v-btn>
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
      <p class="text-medium-emphasis">{{ t('spaces.detail.manageTemplates.noTemplates') }}</p>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useDialog } from '@/plugins/dialog'
import { useSpaceStore } from '@/store/space'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const router = useRouter()

const { confirm } = useDialog()

const spaceStore = useSpaceStore()
const { currentSpaceId, templates } = storeToRefs(spaceStore)
const { t } = useI18n()

const goBack = () => {
  router.go(-1)
}

const createTemplate = () => {
  router.push({ name: 'SpacesDetailCreateTemplate', params: { spaceId: currentSpaceId.value } })
}

const editTemplate = (index: number) => {
  router.push({ name: 'SpacesDetailEditTemplate', params: { spaceId: currentSpaceId.value, templateIndex: index } })
}

const deleteTemplate = async (index: number) => {
  const result = await confirm(t('spaces.detail.manageTemplates.deleteConfirm')).wait()
  if (!result) return

  await spaceStore.deleteTemplate(index)
}
</script>
