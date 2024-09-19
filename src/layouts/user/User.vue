<template>
  <app-bar :links="links" />
  <v-main v-if="loaded" class="bg-grey-lighten-3">
    <user-card />
    <v-container class="d-flex row">
      <v-row>
        <v-col class="pr-0">
          <v-sheet rounded="lg">
            <router-view />
          </v-sheet>
        </v-col>
        <v-col cols="3">
          <v-sheet class="pt-3 pb-3 rounded-lg">
            <v-tabs v-model="selectedTab" direction="vertical">
              <v-tab v-for="tab in tabs" :key="tab.label" :value="tab.route.name" :to="tab.route" exact>
                {{ tab.label }}
              </v-tab>
            </v-tabs>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed, provide } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { UserApi } from '@/network/api/users'
import { User } from '@/types/users'
import AppBar from '@/components/common/AppBar/AppBar.vue'
import UserCard from '@/components/user/UserCard.vue'

const selectedTab = ref<string | null>(null)
const route = useRoute()
const userId = computed(() => parseInt(route.params.id as string))
const userData = ref({} as User)
const loaded = ref(false)

const fetchData = async (userId: number) => {
  const {
    data: { user },
  } = await UserApi.getUserInfo(userId)
  userData.value = user
  // console.log(user)
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

const userRefresh = async () => {
  await fetchData(userId.value)
}

console.log(route)

provide('userData', userData)
provide('userRefresh', userRefresh)

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

const tabs = [
  {
    label: '提问',
    route: {
      name: 'UserQuestion',
    },
  },
  {
    label: '回答',
    route: {
      name: 'UserAnswer',
    },
  },
  {
    label: '关注',
    route: {
      name: 'UserFollowing',
    },
  },
  {
    label: '粉丝',
    route: {
      name: 'UserFollower',
    },
  },
]
</script>
