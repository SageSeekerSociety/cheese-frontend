<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('spaces.detail.manageTemplates.title')" color="transparent" density="compact">
      <template #append>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="createTemplate">{{
          t('spaces.detail.manageTemplates.createTemplate')
        }}</v-btn>
      </template>
    </v-toolbar>

    <v-container v-if="templates.length > 0" class="pa-0">
      <v-row>
        <v-col v-for="(template, index) in templates" :key="index" cols="12">
          <v-card flat rounded="lg" class="template-card">
            <v-card-item>
              <template #prepend>
                <v-avatar color="primary-lighten-5" size="42" class="mr-3">
                  <v-icon color="primary" size="24">mdi-file-document-outline</v-icon>
                </v-avatar>
              </template>
              <v-card-title>{{ template.name }}</v-card-title>
              <v-card-subtitle>{{ template.title }}</v-card-subtitle>

              <template #append>
                <div class="d-flex">
                  <v-btn icon="mdi-pencil" variant="text" @click="editTemplate(index)"></v-btn>
                  <v-btn icon="mdi-delete" variant="text" @click="deleteTemplate(index)"></v-btn>
                </div>
              </template>
            </v-card-item>

            <v-card-text>
              <p class="text-body-2 text-medium-emphasis mb-3">{{ template.description }}</p>

              <v-chip-group>
                <template v-if="template.submitterType">
                  <v-chip color="primary" variant="tonal" size="small">
                    {{ template.submitterType === 'USER' ? t('tasks.form.individual') : t('tasks.form.team') }}
                  </v-chip>
                </template>

                <template v-if="template.rank">
                  <v-chip color="primary" variant="tonal" size="small">
                    {{
                      template.rank === 1
                        ? t('tasks.form.beginner')
                        : template.rank === 2
                          ? t('tasks.form.intermediate')
                          : t('tasks.form.advanced')
                    }}
                  </v-chip>
                </template>

                <template v-if="template.defaultDeadline">
                  <v-chip color="primary" variant="tonal" size="small">
                    领取后 {{ template.defaultDeadline }} 天
                  </v-chip>
                </template>

                <template v-if="template.requireRealName !== null">
                  <v-chip :color="template.requireRealName ? 'primary' : 'grey'" variant="tonal" size="small">
                    {{ template.requireRealName ? '需要实名' : '不需要实名' }}
                  </v-chip>
                </template>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-sheet v-else class="pa-4 text-center">
      <p class="text-medium-emphasis">{{ t('spaces.detail.manageTemplates.noTemplates') }}</p>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useDialog } from '@/plugins/dialog'
import { useSpaceStore } from '@/stores/space'

const router = useRouter()

const { confirm } = useDialog()

const spaceStore = useSpaceStore()
const { currentSpaceId, templates } = storeToRefs(spaceStore)
const { t } = useI18n()

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

<style scoped>
.template-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.template-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.05);
}
</style>
