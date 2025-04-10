<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card rounded="lg" class="search-card elevation-0 border">
          <v-card-title class="d-flex align-center justify-space-between pb-0 pt-4 px-4">
            <div class="d-flex align-center">
              <v-icon icon="mdi-google-maps" class="mr-2" color="primary" />
              <span class="text-h6">发现空间</span>
            </div>
            <v-btn-toggle v-model="selectedSort" class="sort-toggle" rounded="lg" color="primary" density="comfortable">
              <v-btn
                v-for="(item, index) in sortOptions"
                :key="index"
                :value="item.value"
                @click="sortSpaces(item.value)"
              >
                <v-icon
                  :icon="item.value === 'newest' ? 'mdi-clock-outline' : 'mdi-fire'"
                  size="small"
                  class="mr-1"
                ></v-icon>
                {{ item.text }}
              </v-btn>
            </v-btn-toggle>
          </v-card-title>
          <v-card-text class="px-4 py-4">
            <infinite-scroll
              :has-more="hasMore"
              :loading="loadingMore"
              :initial-loading="refreshing"
              :is-empty="spaces.length === 0"
              @load-more="loadMore"
            >
              <template #empty>
                <div class="empty-state-container py-6">
                  <v-empty-state title="暂无空间" icon="mdi-google-maps" class="custom-empty-state" />
                </div>
              </template>
              <v-row>
                <v-col v-for="space in spaces" :key="space.id" cols="12" sm="6" md="4">
                  <v-card flat rounded="lg" class="space-card elevation-0 border" :to="`/spaces/${space.id}`">
                    <v-card-item>
                      <v-avatar size="60" class="mt-2 mb-4">
                        <v-img v-if="space.avatarId" :src="getAvatarUrl(space.avatarId)"></v-img>
                        <v-icon v-else icon="mdi-google-maps" size="large" color="primary"></v-icon>
                      </v-avatar>
                      <v-card-title class="text-h6 mb-2">{{ space.name }}</v-card-title>
                      <v-card-subtitle class="text-body-2 text-medium-emphasis">{{ space.intro }}</v-card-subtitle>
                    </v-card-item>
                  </v-card>
                </v-col>
              </v-row>
            </infinite-scroll>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
    pageStart: pageStart,
    pageSize: 12,
  })
  return { data: data.spaces, page: data.page }
})

const sortSpaces = (value: string) => {
  console.log(value)
}

onMounted(async () => {
  await refresh()
})
</script>

<style scoped>
.search-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.search-field {
  transition: all 0.3s ease;
}

.search-field:deep(.v-field__outline) {
  opacity: 0.7;
}

.search-field:hover:deep(.v-field__outline) {
  opacity: 1;
}

.sort-toggle {
  border: 1px solid rgba(var(--v-theme-primary), 0.12);
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.sort-toggle:deep(.v-btn) {
  text-transform: none;
  letter-spacing: 0;
}

.space-card {
  transition: all 0.2s ease;
  height: 100%;
  border: 1px solid transparent;
}

.space-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.1);
  transform: translateY(-2px);
}

.empty-state-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.custom-empty-state:deep(.v-empty-state__icon) {
  color: var(--v-theme-primary);
  opacity: 0.9;
}
</style>
