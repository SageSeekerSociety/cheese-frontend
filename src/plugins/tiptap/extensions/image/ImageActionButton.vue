<template>
  <file-select v-model="files" accept="image/*" :max="1" :disabled="disabled" @change="onFileChange">
    <action-button :tooltip="t('editor.image.tooltip')" :disabled="disabled">
      <v-icon>mdi-image-plus</v-icon>
    </action-button>
  </file-select>

  <v-dialog v-model="dialogVisible" persistent max-width="300">
    <v-card>
      <v-card-title>图片上传中</v-card-title>
      <v-card-text>
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </v-card-text>
      <!-- <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" variant="text" @click="cancelUpload">
          取消
        </v-btn>
      </v-card-actions> -->
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import FileSelect from '@/components/common/FileSelect.vue'
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { ActionButton } from 'vuetify-pro-tiptap'
import { useI18n } from 'vue-i18n'
import { AttachmentsApi } from '@/network/api/attachments'
import type { ImageMeta } from '@/types'

const { t } = useI18n()

interface Props {
  editor: Editor
  disabled?: boolean
}

const { editor, disabled = false } = defineProps<Props>()

const files = ref<File[]>()
const dialogVisible = ref(false)

const onFileChange = async (newFiles: File[]) => {
  console.log(newFiles)
  dialogVisible.value = true
  try {
    const {
      data: { id },
    } = await AttachmentsApi.upload({ type: 'image', file: newFiles[0] })
    const {
      data: {
        attachment: { meta },
      },
    } = await AttachmentsApi.detail(id)
    editor
      .chain()
      .setImage({ attachmentId: id, width: (meta as ImageMeta).width, height: (meta as ImageMeta).height })
      .run()
  } catch (error) {
    console.error(error)
  } finally {
    dialogVisible.value = false
  }
}
</script>
