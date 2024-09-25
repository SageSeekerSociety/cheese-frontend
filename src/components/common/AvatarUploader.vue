<template>
  <div class="avatar-upload">
    <v-img
      :src="previewUrl || undefined"
      aspect-ratio="1"
      class="rounded-lg avatar"
      rounded="0"
      size="180"
      color="grey-darken-1"
    />
    <file-select v-model="files" accept="image/*" :max="1" class="uploader" @error="onError">
      <v-btn icon>
        <v-icon>mdi-camera</v-icon>
      </v-btn>
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

  .uploader {
    position: absolute;
    bottom: 0;
    right: 0;
    transform: translate(50%, 50%);
  }
}
</style>
