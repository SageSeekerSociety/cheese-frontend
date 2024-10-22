<template>
  <v-container>
    <v-row class="flex-column flex-sm-row">
      <v-col cols="12" sm="8" md="9">
        <v-form @submit.prevent="onSearchSubmit">
          <v-text-field
            v-model="searchQuery"
            density="comfortable"
            flat
            hide-details
            :label="t('spaces.index.searchPlaceholder')"
            prepend-inner-icon="mdi-magnify"
            rounded="lg"
            single-line
            variant="solo"
          ></v-text-field>
        </v-form>
      </v-col>
      <v-col cols="12" sm="4" md="3" class="d-flex flex-row justify-end">
        <v-btn-toggle v-model="selectedSort">
          <v-btn v-for="(item, index) in sortOptions" :key="index" :value="item.value" @click="sortSpaces(item.value)">
            {{ item.text }}
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <infinite-scroll
      :has-more="hasMore"
      :loading="loadingMore"
      :initial-loading="refreshing"
      :is-empty="spaces.length === 0"
      @load-more="loadMore"
    >
      <template #empty>
        <v-empty-state :title="t('spaces.index.noSpaces')"></v-empty-state>
      </template>
      <v-row>
        <v-col v-for="space in spaces" :key="space.id" cols="12" sm="6" md="4">
          <v-card flat rounded="lg" :to="`/spaces/${space.id}`" :prepend-avatar="getAvatarUrl(space.avatarId)">
            <template #title>
              {{ space.name }}
            </template>
            <template #subtitle>
              {{ space.intro }}
            </template>
          </v-card>
        </v-col>
      </v-row>
    </infinite-scroll>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { getAvatarUrl } from '@/utils/materials'
import { usePaging } from '@/utils/paging'

import InfiniteScroll from '@/components/common/InfiniteScroll.vue'
import { SpacesApi } from '@/network/api/spaces'

const { t } = useI18n()

const searchQuery = ref('')
const selectedSort = ref('newest')
const sortOptions = [
  { text: t('spaces.index.sortOptions.newest'), value: 'newest' },
  { text: t('spaces.index.sortOptions.hot'), value: 'hot' },
]

const {
  data: spaces,
  error,
  hasMore,
  loadMore,
  refresh,
  refreshing,
  loadingMore,
} = usePaging(async (pageStart) => {
  const { data } = await SpacesApi.list({
    sort_by: 'createdAt',
    sort_order: 'desc',
    page_start: pageStart,
    page_size: 12,
  })
  return { data: data.spaces, page: data.page }
})

const sortSpaces = (value: string) => {
  console.log(value)
}

const onSearchSubmit = () => {
  console.log(searchQuery.value)
}

onMounted(async () => {
  await refresh()
})
</script>
