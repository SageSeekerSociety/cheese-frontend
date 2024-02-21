<template>
  <v-card v-for="item in answerList" :key="item.id" flat class="pt-2 pb-2 rounded-lg pl-2 pr-2">
    <v-card-title
      ><span class="text-h6 font-weight-bold">{{ item.id }}</span></v-card-title
    >
    <v-card-text>
      <p class="text-body-1">{{ item.author.nickname }}：{{ item.content }}</p>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" variant="tonal">
        <v-icon size="24" class="me-2">mdi-menu-up</v-icon>
        {{ item.agree_count }}
      </v-btn>
      <v-btn color="primary" variant="tonal" min-width="32px">
        <v-icon size="24">mdi-menu-down</v-icon>
      </v-btn>
      <v-btn variant="plain" color="on-background">
        <v-icon size="18" class="me-2">mdi-comment-outline</v-icon>
        {{ item.comment_count }}评论
      </v-btn>
      <v-btn variant="plain" color="on-background">
        <v-icon size="18" class="me-2">mdi-star-outline</v-icon>
        {{ item.favorite_count }}收藏
      </v-btn>
      <v-btn variant="plain" color="on-background" min-width="32px">
        <v-icon size="18">mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { UserApi } from '@/network/api/users'
import { useRoute } from 'vue-router'
import { Answer } from '@/types/answer'
import { Page } from '@/types/page'

const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0], 10))
const answerList = ref<Answer[]>([])
const pageData = ref<Page>()
const loaded = ref(false)

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  const {
    data: { answers, page },
  } = await UserApi.getAnswerList(userID.value, {
    pageStart: 0,
    pageSize: 10,
  })
  answerList.value = answers
  pageData.value = page
  loaded.value = true
}
</script>
@/network/api/users/user
