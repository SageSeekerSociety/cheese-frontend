<template>
  <v-card flat>
    <v-card-item>
      <v-card-title class="text-h6 font-weight-medium">{{ data.title }}</v-card-title>
    </v-card-item>
    <v-card-text class="text-body-1 font-weight-regular answer-body-text pb-1">
      <collapsible-content :max-height="200">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="rich-content" v-html="contentHtml"></div>
      </collapsible-content>
    </v-card-text>
    <v-card-actions class="px-3">
      <v-btn color="primary" variant="tonal">
        <v-icon size="24" class="me-2">mdi-menu-up</v-icon>
        {{ data.attitudes.difference }}
      </v-btn>
      <v-btn color="primary" variant="tonal" min-width="32px">
        <v-icon size="24">mdi-menu-down</v-icon>
      </v-btn>
      <v-btn variant="plain" color="on-background">
        <v-icon size="18" class="me-2">mdi-comment-outline</v-icon>
        评论 {{ data.comment_count }}
      </v-btn>
      <v-btn variant="plain" color="on-background">
        <v-icon size="18" class="me-2">mdi-star-outline</v-icon>
        收藏
      </v-btn>
      <v-btn variant="plain" color="on-background" min-width="32px">
        <v-icon size="18">mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { Question } from '@/types'
import { parse } from '@/utils/parser'
import { toRefs, computed } from 'vue'
import CollapsibleContent from '../common/CollapsibleContent.vue'

const props = defineProps<{
  data: Question
}>()

const { data } = toRefs(props)

const contentHtml = computed(() => parse(JSON.parse(data.value.content)))
</script>
