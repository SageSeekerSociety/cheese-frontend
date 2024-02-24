<template>
  <v-dialog v-model="dialog" persistent width="500">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="rainbow"
        prepend-icon="mdi-fountain-pen-tip"
        :text="(item === null ? '发布' : '编辑') + '动态'"
      />
    </template>
    <v-card max-height="80vh">
      <v-card
        :title="(item === null ? '发布' : '编辑') + '动态'"
        class="elevation-0"
        style="display: flex; flex-direction: column; align-items: flex-start"
      >
        <v-textarea
          v-model="text"
          label="What's happening?!"
          style="min-width: 100%"
          no-resize
          hide-details
          clearable
        />
        <v-card
          v-for="index in assets.length"
          :key="index"
          class="elevation-0"
          style="padding-left: 10px; display: inline-flex; flex-direction: row; min-width: 90%; align-items: center"
        >
          <v-file-input
            :key="index"
            v-model="assets[index - 1]"
            label="上传文件"
            style="padding-top: 5px; padding-bottom: 5px; min-width: 80%"
            hide-details
          />
          <v-btn
            variant="plain"
            color="error"
            style="padding-left: 5px"
            density="compact"
            icon="mdi-trash-can-outline"
            @click="() => removeFileItem(index - 1)"
          />
        </v-card>
        <v-tooltip text="目前仅支持上传图片">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              text="添加文件"
              prepend-icon="mdi-plus"
              color="deep-purple"
              variant="tonal"
              class="elevation-2 ml-1 my-2"
              type="file"
              @click="newFileItem"
            />
          </template>
        </v-tooltip>
      </v-card>
      <v-card-actions>
        <v-btn text="放弃" color="error" @click="cancel" />
        <v-spacer />
        <v-btn text="发布" color="primary" @click="submit" />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
import { InsightsApi } from '@/network/api/insights'
import { Insight } from '@/types/insight'

// TODO: load assets

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
const assets: Ref<File[][]> = ref([])

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
  if (item === null) {
    // post
  } else {
    // update
  }
  dialog.value = false
}
</script>

<style scoped>
.rainbow {
  background-image: linear-gradient(to left, violet, orange);
}
</style>
