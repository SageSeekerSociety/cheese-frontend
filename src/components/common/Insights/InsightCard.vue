<template>
  <v-container class="pa-0">
    <v-card-text class="pb-1">
      <v-container class="pl-0 d-flex flex-row align-center">
        <v-avatar>
          <v-img :src="author.userAvatar" />
        </v-avatar>
        <v-container class="py-0 pl-0 ml-2 my-auto d-flex flex-column">
          <div style="line-height: 1.2" class="text-body-1 font-weight-bold">{{ author.username }}</div>
          <div style="line-height: 1; color: #535861" class="text-body-2 font-weight-regular">
            {{ author.userDesc }}
          </div>
        </v-container>
      </v-container>
      <div v-if="item.title" class="pb-2 text-h6 font-weight-medium">{{ item.title }}</div>
      <div class="text-body-1 font-weight-regular">{{ item.content }}</div>
    </v-card-text>
    <v-card-actions class="px-3">
      <v-hover>
        <template #default="{ isHovering, props }">
          <v-btn color="red" :active="false" v-bind="props">
            <v-icon size="24" class="me-2">{{ isHovering ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            喜欢
          </v-btn>
        </template>
      </v-hover>
      <v-btn min-width="0" variant="plain" color="on-background">
        <v-icon size="18">mdi-reply-outline</v-icon>
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
import { Insight } from '@/types/insight'
import { computed } from 'vue'
import { UserData } from '@/components/user/types'

const props = withDefaults(
  defineProps<{
    item: Insight
  }>(),
  {
    item: () => ({
      id: -1,
      userid: -1,
      title: null,
      content: '',
    }),
  }
)
const item = computed(() => props.item)
const author: UserData = {
  // TODO: Get user-data from userid
  username: '李华',
  userDesc: 'Amateur Web developer',
  userAvatar: 'https://avatars.githubusercontent.com/u/107245128',
  userHeaderImg: '',
}
</script>
