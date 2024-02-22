<template>
  <v-container class="pa-0">
    <v-card-text class="py-1">
      <v-container class="pl-0 d-flex flex-row align-center">
        <v-avatar>
          <v-img :src="item.author.avatar" />
        </v-avatar>
        <v-container class="py-0 pl-0 ml-2 my-auto d-flex flex-column">
          <div style="line-height: 1.2" class="text-body-1 font-weight-bold">{{ item.author.nickname }}</div>
          <div style="line-height: 1; color: #535861" class="text-body-2 font-weight-regular">
            {{ item.author.intro }}
          </div>
        </v-container>
      </v-container>
      <!-- <div v-if="item.title" class="pb-2 text-h6 font-weight-medium">{{ item.title }}</div> -->
      <div class="text-body-1 font-weight-regular">{{ item.content }}</div>
      <v-container class="mx-0 my-0 px-0 py-0 d-flex" style="width: 80%; max-width: 400px; flex-wrap: wrap">
        <v-dialog v-for="m in item.medias" :key="m.id">
          <template #activator="{ props }">
            <img v-bind="props" :src="m.meta.thumbnail" style="background: #ffffff; width: 30%" class="hover-dim" />
          </template>
          <template #default="{ isActive }">
            <div style="display: inline-flex; flex-direction: row; justify-content: center">
              <v-img :src="m.url" class="v-card" max-width="70vh" max-height="80vw" style="background: #ffffff" />
              <div class="d-flex flex-column">
                <button
                  style="display: inline-flex; padding-left: 5px; padding-top: 10px"
                  min-width="0"
                  min-height="0"
                  @click="isActive.value = false"
                >
                  <v-icon>mdi-close</v-icon>
                </button>
              </div>
            </div>
          </template>
        </v-dialog>
      </v-container>
      <v-card-text min-width="0" style="color: #8491a5" class="d-flex ml-0 pl-0 pt-2 pb-0 text-subtitle-2">
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
          <v-btn color="red" :active="false" v-bind="props">
            <v-icon size="24" class="me-2">{{ isHovering ? activeIcon : inactiveIcon }}</v-icon>
            {{ item.like_count === 0 ? '喜欢' : formatView(item.like_count) }}
          </v-btn>
        </template>
      </v-hover>
      <v-btn min-width="0" variant="plain" color="on-background">
        <v-icon size="18">mdi-reply-outline</v-icon>
        {{ item.comment_count === 0 ? '' : formatView(item.comment_count) }}
      </v-btn>
      <v-btn min-width="0" variant="plain" color="on-background">
        <v-icon size="18">mdi-star-outline</v-icon>
      </v-btn>
      <v-btn variant="plain" color="on-background" min-width="32px">
        <v-icon size="18">mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-actions>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Insight } from '@/types/insight'
import { computed } from 'vue'

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
.hover-dim {
  transition: 300ms ease;
}
.hover-dim:hover {
  filter: brightness(60%);
}
</style>
