<template>
  <v-dialog v-model="dialog" persistent width="500">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="rainbow"
        prepend-icon="mdi-fountain-pen-tip"
        :text="(item === null ? $t('insights.popup.post') : $t('insights.popup.edit')) + $t('insights.general.insight')"
      />
    </template>
    <v-card max-height="80vh">
      <v-card
        :title="
          (item === null ? $t('insights.popup.post') : $t('insights.popup.edit')) + $t('insights.general.insight')
        "
        class="elevation-0 popup-main"
      >
        <v-textarea
          v-model="text"
          :label="$t('insights.popup.textAreaPlaceholder')"
          class="popup-editor"
          no-resize
          hide-details
          clearable
        />
        <v-card v-for="index in assets.length" :key="index" class="elevation-0 popup-asset-item">
          <v-file-input
            :key="index"
            v-model="assets[index - 1]"
            :label="$t('insights.popup.upload') + $t('insights.popup.media')"
            class="popup-asset-select"
            prepend-icon=""
            prepend-inner-icon="mdi-image"
            hide-details
          />
          <v-btn
            variant="plain"
            color="error"
            class="popup-asset-remove-button"
            icon="mdi-trash-can-outline"
            @click="() => removeFileItem(index - 1)"
          />
        </v-card>
        <v-tooltip :text="$t('insights.popup.addMediaButtonPlaceholder')">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              :text="$t('insights.popup.add') + $t('insights.popup.media')"
              prepend-icon="mdi-multimedia"
              color="deep-purple"
              variant="tonal"
              class="elevation-2 popup-add-button"
              type="file"
              @click="newFileItem"
            />
          </template>
        </v-tooltip>
        <v-checkbox
          v-model="hasAttachment"
          :label="$t('insights.popup.share') + $t('insights.popup.link') + '/' + $t('insights.popup.file')"
        />
        <v-container v-if="hasAttachment">
          <v-select
            v-model="attachmentType"
            :label="$t('insights.popup.type')"
            :items="[$t('insights.popup.link'), $t('insights.popup.file')]"
          />
          <v-file-input
            v-if="attachmentType === $t('insights.popup.file')"
            v-model="attachmentFile"
            prepend-icon=""
            prepend-inner-icon="mdi-file"
            :label="$t('insights.popup.upload') + $t('insights.popup.file')"
          />
          <v-text-field
            v-if="attachmentType === $t('insights.popup.link')"
            v-model="userLink"
            :label="$t('insights.popup.linkAreaPlaceholder')"
            prepend-inner-icon="mdi-link"
          />
        </v-container>
      </v-card>
      <v-card-actions>
        <v-btn :text="$t('insights.popup.discard')" color="error" @click="cancel" />
        <v-spacer />
        <v-btn :text="$t('insights.popup.post')" color="primary" @click="submit" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import { InsightsApi } from '@/network/api/insights'
import { Insight } from '@/types'
import { computed } from 'vue'
import { t } from '@/i18n'

const props = withDefaults(
  defineProps<{
    item: Insight | null
  }>(),
  {
    item: null,
  }
)
const item: Insight | null = props.item
const dialog = ref(false)
const text = ref('')
const hasAttachment = ref(false)
const attachmentType = ref('')
const attachmentFile: Ref<File[]> = ref([])
const userLink = ref('')
const assets: Ref<File[][]> = ref([])

const translatedAttachmentType = computed(() => {
  const mapping: { [key: string]: string | undefined } = {}
  mapping[t('insights.popup.link')] = 'link'
  mapping[t('insights.popup.file')] = 'file'
  return mapping[attachmentType.value]
})
const newFileItem = () => {
  assets.value.push([])
}
const removeFileItem = (i: number) => {
  assets.value.splice(i, 1)
}
const cancel = () => {
  assets.value = []
  dialog.value = false
}
const submit = () => {
  // TODO: implementation
  const uploadedIds: string[] = []
  assets.value.forEach((fileList: File[]) => {
    const { id: id } = uploadFile(fileList[0])
    uploadedIds.push(id)
  })
  const { id: attachmentId } = uploadFile(attachmentFile.value[0])

  if (item === null) {
    // post
    const data: InsightsApi.PostInsightRequestData = {
      content: text.value,
      medias: uploadedIds, // TODO: adapt to new api
    }
    if (typeof attachmentId !== 'undefined' && typeof translatedAttachmentType.value !== 'undefined') {
      data.attachment = {
        type: translatedAttachmentType.value,
        id: attachmentId,
      }
    }
  } else {
    // update
  }
  dialog.value = false
}
const uploadFile = (file: File) => {
  // TODO: implementation (use material api)
  return {
    id: '0',
  }
}
</script>

<style scoped>
.popup-main {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.popup-editor {
  min-width: 100%;
}
.popup-asset-item {
  padding-left: 10px;
  display: inline-flex;
  flex-direction: row;
  min-width: 90%;
  align-items: center;
}
.popup-asset-select {
  padding-top: 5px;
  padding-bottom: 5px;
  min-width: 80%;
}
.popup-asset-remove-button {
  padding-left: 5px;
}
.popup-add-button {
  margin-left: 2px;
  margin-top: 4px;
  margin-bottom: 4px;
}
.rainbow {
  background-image: linear-gradient(to left, violet, orange);
}
</style>
