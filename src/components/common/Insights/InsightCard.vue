<template>
  <v-container class="pa-0">
    <v-card-text class="py-1">
      <v-container class="pl-0 d-flex flex-row align-center">
        <v-avatar>
          <v-img :src="item.author.avatar" />
        </v-avatar>
        <v-container class="py-0 pl-0 ml-2 my-auto d-flex flex-column">
          <div class="text-body-1 font-weight-bold author-nickname">{{ item.author.nickname }}</div>
          <div class="text-body-2 text-medium-emphasis font-weight-regular author-intro">
            {{ item.author.intro }}
          </div>
        </v-container>
      </v-container>
      <!-- <div v-if="item.title" class="pb-2 text-h6 font-weight-medium">{{ item.title }}</div> -->
      <div class="text-body-1 font-weight-regular">{{ item.content }}</div>
      <v-container v-viewer="viewerOptions" class="media-thumbnail-container">
        <template v-for="m in item.medias" :key="m.id">
          <img :src="m.meta.thumbnail" :data-src="m.url" class="hover-dim media-thumbnail" />
        </template>
      </v-container>
      <v-card-text min-width="0" class="d-flex ml-0 pl-0 pt-2 pb-0 text-subtitle-2 text-medium-emphasis">
        <div class="d-flex pl-0 ml-0 font-weight-regular">
          {{ displayDate }}&ensp;·&ensp;
          <v-tooltip v-if="edited" activator="parent" location="top">{{ toolTipDate }}</v-tooltip>
        </div>
        <div class="d-flex font-weight-bold">{{ formatView(item.view_count) }}</div>
        <div class="d-flex font-weight-medium">&thinsp;阅读</div>
      </v-card-text>
    </v-card-text>
    <v-card-actions min-height="0" class="my-0 py-0 px-3">
      <v-hover>
        <template #default="{ isHovering, props }">
          <v-btn color="red" class="like-button" :active="false" v-bind="props">
            <v-icon class="me-2 like-button-icon">{{ isHovering ? activeIcon : inactiveIcon }}</v-icon>
            {{ item.like_count === 0 ? '喜欢' : formatView(item.like_count) }}
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
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Insight } from '@/types/insight'
import { computed } from 'vue'

const viewerOptions = {
  url: 'data-src',
}

const formatTime = (t: number): string => {
  // TODO: implementation
  return String(t)
}
const formatView = (v: number): string => {
  // TODO: implementation
  if (v >= 1000) {
    return `${(v / 1000).toFixed(1)} K`
  } else {
    return String(v)
  }
}

const props = withDefaults(
  defineProps<{
    item: Insight
  }>(),
  {
    item: () => ({}) as Insight,
  }
)
const item = computed(() => props.item)
const inactiveIcon = computed(() => (props.item.is_like ? 'mdi-heart' : 'mdi-heart-outline'))
const activeIcon = computed(() => (props.item.is_like ? 'mdi-heart-outline' : 'mdi-heart'))
const edited = ref(props.item.created_at !== props.item.updated_at)
const displayDate = computed(() => {
  if (!edited.value) {
    return `发布于 ${formatTime(props.item.created_at)}`
  } else {
    return `编辑于 ${formatTime(props.item.updated_at)}`
  }
})
const toolTipDate = computed(() => {
  if (!edited.value) {
    return ''
  } else {
    return `发布于 ${formatTime(props.item.created_at)}`
  }
})
</script>

<style scoped>
.author-nickname {
  line-height: 1.2;
}
.author-intro {
  line-height: 1;
}
.media-thumbnail-container {
  width: 80%;
  max-width: 400px;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}
.media-thumbnail {
  background: #ffffff;
  width: 30%;
}
.like-button {
  size: 24px;
}
.like-button-icon {
  size: 24px;
}
.minor-action-button {
  size: 18px;
}
.hover-dim {
  transition: 300ms ease;
}
.hover-dim:hover {
  filter: brightness(60%);
}
</style>
