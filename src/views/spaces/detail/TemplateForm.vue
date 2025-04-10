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
      <!-- 基本信息 -->
      <v-card flat rounded="lg" class="mb-4 form-card">
        <v-card-item>
          <template #prepend>
            <div class="me-3">
              <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                <v-icon color="primary" size="28">mdi-information-outline</v-icon>
              </v-avatar>
            </div>
          </template>
          <v-card-title class="text-h5 ps-0">基本信息</v-card-title>
        </v-card-item>

        <v-card-text class="pt-2">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="template.name"
                :label="t('spaces.detail.templateForm.templateName')"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="template.description"
                :label="t('spaces.detail.templateForm.templateDescription')"
                rows="3"
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="template.title"
                :label="t('spaces.detail.templateForm.contestTitle')"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-radio-group
                v-model="template.submitterType"
                :label="t('tasks.form.participantType')"
                inline
                class="mt-0"
              >
                <v-radio :label="t('tasks.form.individual')" value="USER"></v-radio>
                <v-radio :label="t('tasks.form.team')" value="TEAM"></v-radio>
                <v-radio label="留空" :value="null"></v-radio>
              </v-radio-group>
            </v-col>

            <v-col cols="12" md="6">
              <v-radio-group v-model="template.rank" :label="t('tasks.form.taskLevel')" inline class="mt-0">
                <v-radio :label="t('tasks.form.beginner')" :value="1"></v-radio>
                <v-radio :label="t('tasks.form.intermediate')" :value="2"></v-radio>
                <v-radio :label="t('tasks.form.advanced')" :value="3"></v-radio>
                <v-radio label="留空" :value="null"></v-radio>
              </v-radio-group>
            </v-col>

            <!-- 小队人数限制 -->
            <template v-if="template.submitterType === 'TEAM'">
              <v-col cols="12" md="6">
                <v-text-field v-model.number="template.minTeamSize" label="最小队伍人数" type="number" min="1">
                </v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model.number="template.maxTeamSize" label="最大队伍人数" type="number" min="1">
                </v-text-field>
              </v-col>
            </template>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 时间设置 -->
      <v-card flat rounded="lg" class="mb-4 form-card">
        <v-card-item>
          <template #prepend>
            <div class="me-3">
              <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                <v-icon color="primary" size="28">mdi-clock-outline</v-icon>
              </v-avatar>
            </div>
          </template>
          <v-card-title class="text-h5 ps-0">时间设置</v-card-title>
        </v-card-item>

        <v-card-text class="pt-2">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="template.defaultDeadline"
                :label="t('tasks.form.defaultDeadline')"
                type="number"
                prefix="领取赛题后"
                suffix="天"
                min="1"
                clearable
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 实名信息要求 -->
      <v-card flat rounded="lg" class="mb-4 form-card">
        <v-card-item>
          <template #prepend>
            <div class="me-3">
              <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                <v-icon color="primary" size="28">mdi-shield-account</v-icon>
              </v-avatar>
            </div>
          </template>
          <v-card-title class="text-h5 ps-0">实名信息要求</v-card-title>
        </v-card-item>

        <v-card-text class="pt-2">
          <v-radio-group v-model="template.requireRealName" inline class="mt-0">
            <v-radio label="需要实名信息" :value="true"></v-radio>
            <v-radio label="不需要实名信息" :value="false"></v-radio>
            <v-radio label="留空" :value="null"></v-radio>
          </v-radio-group>

          <v-alert
            v-if="template.requireRealName === true"
            color="primary"
            variant="tonal"
            class="mt-3 mb-0"
            density="comfortable"
            border="start"
          >
            <div class="d-flex align-start">
              <v-avatar color="primary" class="mr-3 mt-1" size="28">
                <v-icon icon="mdi-shield-check" color="white" size="18"></v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-2 font-weight-medium mb-1">已选择要求实名信息</div>
                <p class="text-body-2 mb-0">
                  • 参与者需完成实名认证方可参与此赛题<br />
                  • 所有信息经过加密存储，访问受到严格控制
                </p>
              </div>
            </div>
          </v-alert>
        </v-card-text>
      </v-card>

      <!-- 赛题详情 -->
      <v-card flat rounded="lg" class="mb-4 form-card">
        <v-card-item>
          <template #prepend>
            <div class="me-3">
              <v-avatar color="primary-lighten-5" size="48" class="elevation-0">
                <v-icon color="primary" size="28">mdi-text-box-outline</v-icon>
              </v-avatar>
            </div>
          </template>
          <v-card-title class="text-h5 ps-0">{{ t('tasks.form.taskDescription') }}</v-card-title>
        </v-card-item>

        <v-card-text class="pt-2">
          <TipTapEditor
            v-model="template.content"
            output="json"
            rounded
            :min-height="200"
            :max-height="1000"
            editor-class="tiptap-editor"
            :title="t('spaces.detail.templateForm.contestDescription')"
          />
        </v-card-text>
      </v-card>

      <div class="d-flex justify-end mt-4">
        <v-btn type="submit" color="primary">{{ t('spaces.detail.templateForm.save') }}</v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'

import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { storeToRefs } from 'pinia'

import { useSpaceStore } from '@/stores/space'

const TipTapEditor = defineAsyncComponent(() => import('@/components/common/Editor/TipTapEditor.vue'))

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
  submitterType: null as 'USER' | 'TEAM' | null,
  rank: null as number | null,
  minTeamSize: 1,
  maxTeamSize: 10,
  defaultDeadline: null as number | null,
  requireRealName: null as boolean | null,
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
        submitterType: templateData.submitterType || null,
        rank: templateData.rank || null,
        minTeamSize: templateData.minTeamSize || 1,
        maxTeamSize: templateData.maxTeamSize || 10,
        defaultDeadline: templateData.defaultDeadline || null,
        requireRealName: templateData.requireRealName !== undefined ? templateData.requireRealName : null,
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

    // 转换为要保存的格式
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

<style scoped>
.form-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
  background-color: rgb(var(--v-theme-surface));
  transition: all 0.2s ease;
}

.form-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.15);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.05);
}

.mb-4 {
  margin-bottom: 16px !important;
}

.mt-4 {
  margin-top: 16px !important;
}
</style>
