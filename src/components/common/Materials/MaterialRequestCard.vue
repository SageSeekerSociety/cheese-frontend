<template>
  <v-card class="mb-3" flat>
    <v-card-text class="py-1">
      <div class="d-flex flex-row align-center">
        <v-avatar size="20" class="me-2">
          <v-img :src="item.author.avatar" />
        </v-avatar>
        <div class="text-body-1 font-weight-bold author-nickname me-1">{{ item.author.nickname }}</div>
        <div class="text-body-2 text-medium-emphasis font-weight-regular author-intro me-1">
          {{ item.author.intro }}
        </div>
        <div class="text-caption">发出了文件请求：</div>
      </div>
      <div class="d-flex flex-row justify-between align-center">
        <div class="flex-grow-1">
          <v-card-title class="text-h6 px-0"> {{ item.title }} </v-card-title>
          <p class="text-body-1 font-weight-regular px-0">
            {{ item.content }}
          </p>
        </div>
        <v-btn variant="plain" prepend-icon="mdi-paperclip-plus" color="on-background" stacked> 发送文件 </v-btn>
      </div>
      <div class="d-flex pt-2 flex-row text-subtitle-2 text-medium-emphasis">
        <div class="d-flex font-weight-medium">发布于 {{ dayjs(item.created_at).fromNow() }}&ensp;·&ensp;</div>
        <div class="d-flex font-weight-bold">{{ formatView(item.view_count) }}</div>
        <div class="d-flex font-weight-medium">&thinsp;阅读</div>
      </div>
    </v-card-text>
    <v-card-actions>
      <v-hover>
        <template #default="{ isHovering, props }">
          <v-btn color="red" :active="false" v-bind="props">
            <v-icon class="me-2">{{ isHovering ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            {{ item.attitudes.positive_count === 0 ? '喜欢' : formatView(item.attitudes.positive_count) }}
          </v-btn>
        </template>
      </v-hover>
      <v-btn min-width="0" variant="plain" color="on-background">
        <v-icon class="minor-action-button">mdi-reply-outline</v-icon>
        {{ item.comment_count === 0 ? '' : formatView(item.comment_count) }}
      </v-btn>
      <v-btn min-width="0" variant="plain" color="on-background">
        <v-icon class="minor-action-button">mdi-star-outline</v-icon>
      </v-btn>
      <v-btn variant="plain" color="on-background" min-width="32px">
        <v-icon class="minor-action-button">mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { MaterialRequest } from '@/types'
import dayjs from 'dayjs'

const props = withDefaults(
  defineProps<{
    item: MaterialRequest
  }>(),
  {
    item: () => ({}) as MaterialRequest,
  }
)

const formatView = (v: number): string => {
  // TODO: implementation
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)} K`
  } else {
    return String(v)
  }
}
</script>
