<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h5">{{ t('spaces.discussions.createDiscussion') }}</span>
            <v-btn icon="mdi-close" variant="text" @click="goBack"></v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-form @submit.prevent="submitDiscussion">
              <v-text-field
                v-model="discussionTitle"
                :label="t('spaces.discussions.discussionTitle')"
                variant="outlined"
                class="mb-4"
                :rules="[rules.required, rules.maxLength(100)]"
                :counter="100"
              ></v-text-field>

              <div class="mb-2 text-subtitle-1">{{ t('spaces.discussions.discussionContent') }}</div>
              <tip-tap-editor
                ref="editorRef"
                v-model="discussionContent"
                output="json"
                :placeholder="t('global.editor.placeholder')"
                :min-height="300"
                class="mb-4 editor-boundary"
              />

              <!-- Add attachment and other options here if needed -->

              <v-alert
                v-if="errorMesssage"
                type="error"
                variant="tonal"
                closable
                class="mb-4"
                @update:model-value="errorMesssage = ''"
              >
                {{ errorMesssage }}
              </v-alert>

              <div class="d-flex justify-end">
                <v-btn color="grey" variant="text" class="mr-2" @click="goBack">{{ t('global.cancel') }}</v-btn>
                <v-btn color="primary" type="submit" :loading="isSubmitting" :disabled="!isFormValid || isSubmitting">
                  {{ t('global.publish') }}
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import type { JSONContent } from 'vuetify-pro-tiptap'
import type { CreateDiscussionRequest } from '@/network/api/discussions/types'

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'

import { setTitle } from '@/utils/title'

import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import { DiscussionsApi } from '@/network/api/discussions'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

setTitle(t('spaces.discussions.createDiscussion'), route)

const editorRef = ref<InstanceType<typeof TipTapEditor> | null>(null)
const discussionTitle = ref('')
const discussionContent = ref<string | null>(null)
const isSubmitting = ref(false)
const errorMesssage = ref('')

const spaceId = computed(() => Number(route.params.spaceId))

const rules = {
  required: (value: string) => !!value || t('global.formValidation.required'),
  maxLength: (max: number) => (value: string) =>
    (value && value.length <= max) || t('global.formValidation.maxLength', { max }),
}

const isFormValid = computed(() => {
  const titleValid = discussionTitle.value.trim() !== '' && rules.maxLength(100)(discussionTitle.value.trim()) === true

  const contentActuallyNotEmpty = editorRef.value ? !editorRef.value.isEmpty : false

  return titleValid && contentActuallyNotEmpty
})

const goBack = () => {
  router.go(-1)
  // Alternatively, navigate to the discussions list for this space:
  // router.push({ name: 'SpacesDetailDiscussions', params: { spaceId: spaceId.value } });
}

const submitDiscussion = async () => {
  if (!isFormValid.value) return

  isSubmitting.value = true
  errorMesssage.value = ''

  let finalContentToSubmit: string
  const currentEditorContent = editorRef.value?.editor?.getJSON() as JSONContent | undefined

  if (currentEditorContent && currentEditorContent.content && currentEditorContent.content.length > 0) {
    if (
      discussionTitle.value &&
      (currentEditorContent.content[0]?.type !== 'heading' || currentEditorContent.content[0]?.attrs?.level !== 1)
    ) {
      const titleNode = {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: discussionTitle.value.trim() }],
      }
      currentEditorContent.content.unshift(titleNode)
    } else if (
      discussionTitle.value &&
      currentEditorContent.content[0]?.type === 'heading' &&
      currentEditorContent.content[0]?.attrs?.level === 1
    ) {
      currentEditorContent.content[0].content = [{ type: 'text', text: discussionTitle.value.trim() }]
    }
    finalContentToSubmit = JSON.stringify(currentEditorContent)
  } else {
    finalContentToSubmit = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: discussionTitle.value.trim() }] },
      ],
    })
  }

  const payload: CreateDiscussionRequest = {
    modelType: 'SPACE',
    modelId: spaceId.value,
    content: finalContentToSubmit,
  }

  try {
    await DiscussionsApi.create(payload)
    toast.success(t('spaces.discussions.publishSuccess'))
    router.push({ name: 'SpacesDetailDiscussions', params: { spaceId: spaceId.value } })
  } catch (err: any) {
    console.error('Failed to create discussion:', err)
    errorMesssage.value = err.message || t('spaces.discussions.publishFailed')
    toast.error(errorMesssage.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.editor-boundary {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  overflow: hidden; // Ensures TipTapEditor's own borders/focus rings are contained

  &:focus-within {
    border-color: rgb(var(--v-theme-primary));
    box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
  }

  :deep(.v-input__control) {
    border: none !important; // Remove default tiptap border if any
  }
  :deep(.ProseMirror) {
    padding: 12px 16px;
    min-height: 300px; // Ensure this is respected
  }
}
</style>
