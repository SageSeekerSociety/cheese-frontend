<template>
  <div class="d-flex align-center w-100">
    <div class="d-flex align-center">
      <v-btn icon="mdi-arrow-left" variant="text" density="comfortable" @click="discussionData.goBack"></v-btn>
      <div class="d-flex flex-column ml-3">
        <h2 class="text-h6 mb-0">{{ discussionData.channelName }}</h2>
        <span class="text-caption text-medium-emphasis">完整讨论</span>
      </div>
    </div>
    <v-spacer></v-spacer>
    <div v-if="discussionData.isCurrentUserMessage" class="d-flex align-center">
      <v-btn icon="mdi-dots-vertical" variant="text" density="comfortable">
        <v-menu activator="parent" :close-on-content-click="true">
          <v-list density="compact">
            <v-list-item @click="deleteMessage">
              <template #prepend>
                <v-icon size="small" color="error">mdi-delete-outline</v-icon>
              </template>
              <v-list-item-title class="text-error">删除讨论</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { Discussion } from '@/types'

import { computed, inject } from 'vue'

import { useDialog } from '@/plugins/dialog'
import { useDiscussionStore } from '@/stores/discussionStore'

const dialog = useDialog()
const discussionStore = useDiscussionStore()

interface DiscussionData {
  currentMessage: ComputedRef<Discussion | null>
  isCurrentUserMessage: ComputedRef<boolean>
  channelName: ComputedRef<string>
  goBack: () => void
}

// 注入共享数据
const discussionData = inject<DiscussionData>('discussionData', {
  currentMessage: computed(() => null),
  isCurrentUserMessage: computed(() => false),
  channelName: computed(() => '讨论详情'),
  goBack: () => {},
})

// 删除讨论的方法
const deleteMessage = async () => {
  if (!discussionData.currentMessage.value) return

  try {
    const result = await dialog
      .confirm('确定要删除这条讨论吗？所有回复也将被删除。此操作无法撤销。', {
        title: '确认删除',
      })
      .wait()

    if (result) {
      await discussionStore.deleteDiscussion(discussionData.currentMessage.value.id)
      // 删除成功后返回上一页
      discussionData.goBack()
      dialog.alert('讨论已删除', { title: '成功' })
    }
  } catch (error) {
    console.error('删除讨论失败', error)
    dialog.alert('删除讨论失败，请重试', { title: '错误' })
  }
}
</script>

<style scoped lang="scss">
/* 可能需要的样式 */
</style>
