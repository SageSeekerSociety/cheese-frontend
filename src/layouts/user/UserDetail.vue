<template>
  <v-container v-if="loaded">
    <v-row dense>
      <v-col cols="12">
        <user-card />
      </v-col>
    </v-row>

    <v-row dense>
      <v-col cols="12">
        <v-sheet rounded="lg" class="content-wrapper elevation-0">
          <v-tabs
            v-model="selectedTab"
            bg-color="transparent"
            color="primary"
            class="user-tabs"
            slider-color="primary"
            show-arrows
          >
            <v-tab v-for="tab in tabs" :key="tab.label" :value="tab.route.name" :to="tab.route" exact class="user-tab">
              {{ tab.label }}
            </v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <router-view />
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import type { User } from '@/types/users'

import { computed, onMounted, provide, ref, watch } from 'vue'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

import UserCard from '@/components/user/UserCard.vue'
import { UserApi } from '@/network/api/users'

const selectedTab = ref<string | null>(null)
const route = useRoute()
const router = useRouter()
const userId = computed(() => parseInt(route.params.id as string))
const userData = ref({} as User)
const loaded = ref(false)

const fetchData = async (userId: number) => {
  const {
    data: { user },
  } = await UserApi.getUserInfo(userId)
  userData.value = user
  loaded.value = true
}

onMounted(async () => {
  await fetchData(userId.value)
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    await fetchData(parseInt(to.params.id as string))
  }
})

// 在路由改变时更新selectedTab
watch(
  () => route.name,
  (newRouteName) => {
    selectedTab.value = newRouteName as string
  },
  { immediate: true }
)

provide('userData', userData)

const tabs = computed(() => [
  // {
  //   label: '提问',
  //   route: {
  //     name: 'UserQuestion',
  //     params: { id: userId.value }
  //   },
  // },
  // {
  //   label: '回答',
  //   route: {
  //     name: 'UserAnswer',
  //     params: { id: userId.value }
  //   },
  // },
  {
    label: '关注',
    route: {
      name: 'UserFollowing',
      params: { id: userId.value },
    },
  },
  {
    label: '粉丝',
    route: {
      name: 'UserFollower',
      params: { id: userId.value },
    },
  },
])
</script>

<style scoped lang="scss">
.user-tabs {
  .user-tab {
    font-weight: 500;
    letter-spacing: 0.5px;
    min-width: 120px;
    padding: 0 24px;
    transition: all 0.3s ease;

    &:hover {
      opacity: 0.9;
    }
  }

  // 增强标签页底部滑块的可见性
  :deep(.v-slide-group__content) {
    z-index: 1;
  }

  :deep(.v-tabs__slider) {
    height: 3px; // 增加滑块高度
    opacity: 1;
    background-color: var(--v-theme-primary); // 确保颜色正确
  }
}

.content-wrapper {
  background-color: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  transition: all 0.3s ease;
  overflow: hidden;

  &:hover {
    border: 1px solid rgba(var(--v-theme-primary), 0.1);
  }
}
</style>
