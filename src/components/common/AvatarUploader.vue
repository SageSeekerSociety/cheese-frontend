<template>
  <div class="avatar-upload" :class="{ 'avatar-upload--empty': !avatarFile }">
    <v-img
      :src="previewUrl || undefined"
      aspect-ratio="1"
      class="rounded-lg avatar"
      rounded="0"
      size="180"
      color="grey-darken-1"
    />
    <file-select
      v-model="files"
      accept="image/*"
      :max="1"
      class="uploader"
      content-class="uploader-inner"
      @error="onError"
    >
      <div class="rounded-lg d-flex flex-column align-center justify-center gap-4 pa-4 text-white uploader-inner">
        <v-icon size="32">mdi-camera</v-icon>
        <div class="text-body-1 text-white">{{ avatarFile ? '更换头像' : '上传头像' }}</div>
      </div>
    </file-select>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
import FileSelect from './FileSelect.vue'

const emit = defineEmits<{
  (e: 'error', error: Error): void
}>()

const files = ref<File[]>([])
const avatarFile = defineModel<File>()
const previewUrl = ref<string | null>(null)

watch(files, (newFiles) => {
  if (newFiles && newFiles.length > 0) {
    const file = newFiles[0]
    previewUrl.value = URL.createObjectURL(file)
    avatarFile.value = file
  } else {
    previewUrl.value = null
    avatarFile.value = undefined
  }
})

const onError = (error: Error) => {
  emit('error', error)
}
</script>

<style scoped lang="scss">
.avatar-upload {
  position: relative;

  &:not(.avatar-upload--empty):hover {
    .uploader {
      opacity: 1;
    }
  }

  &.avatar-upload--empty {
    .uploader {
      opacity: 1;
    }
  }

  .uploader {
    position: absolute;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border: 2px dashed rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.25);
  }
}
</style>

<style lang="scss">
.uploader-inner {
  height: 100%;
}
</style>
