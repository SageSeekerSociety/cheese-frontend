<template>
  <app-bar v-model:search="search" :links="links"></app-bar>

  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet flat rounded="lg">
            <template v-if="refreshing">
              <v-skeleton-loader type="list-item-avatar, paragraph, button@2" />
              <v-skeleton-loader type="list-item-avatar, paragraph, button@2" />
            </template>
            <template v-else-if="error">
              <v-empty-state
                title="加载失败"
                text="请稍后再试"
                icon="mdi-alert-circle"
                action-text="重试"
                @click:action="refresh"
              />
            </template>
            <template v-else-if="data.length === 0">
              <blank-page />
            </template>
            <template v-else>
              <question-card v-for="question in data" :key="question.id" :data="question" />
            </template>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import QuestionCard from '@/components/questions/QuestionCard.vue'
import AppBar from '@/components/common/AppBar/AppBar.vue'
import BlankPage from '@/components/common/BlankPage.vue'
import { VEmptyState } from 'vuetify/labs/VEmptyState'
import { QuestionApi } from '@/network/api/questions'
import { usePaging } from '@/utils/paging'
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { setTitle } from '@/utils/title'

const route = useRoute()
const search = ref(route.query.q as string)

const { data, refresh, reset, loadMore, refreshing, loadingMore, error } = usePaging(async (pageStart) => {
  const {
    data: { questions: data, page },
  } = await QuestionApi.search(search.value, pageStart)
  return { data, page }
})

const load = async (q: string) => {
  search.value = q
  setTitle(q, route)
  reset()
  await refresh()
}

onMounted(async () => {
  await load(route.query.q as string)
})

watch(
  () => route.query.q,
  async (q) => {
    await load(q as string)
  }
)

const links = [
  {
    key: 'Home',
    title: '首页',
    path: '/',
  },
  {
    key: 'Question',
    title: '问答',
    path: '/questions',
  },
  {
    key: 'Group',
    title: '圈子',
    path: '/groups',
  },
]
</script>
