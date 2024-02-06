<template>
  <app-bar :links="links" />
  <v-main v-if="loaded" class="bg-grey-lighten-3">
    <user-card :key="userData.id" :profile="userData" />
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
              <v-tab v-for="tab in tabs" :key="tab.label" :to="tab.route" exact>
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
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { UserApi } from '@/network/api/user'
import { User } from '@/types/users'
import AppBar from '@/components/common/AppBar/AppBar.vue'
import UserCard from '@/components/user/UserCard.vue'

const selectedTab = ref(0)
const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0]))
const userData = ref<User>({} as User)
const loaded = ref(false)

onMounted(() => {
  fetchData().then((result) => {
    userData.value = result.data as User
    loaded.value = true
    // console.log('111', typeof userData.value, userData.value)
  })
})

// 切换用户时刷新
watch(
  () => route.params.id,
  () => {
    window.location.reload()
  }
)

// 异步函数
function fetchData() {
  const result = UserApi.getUserInfo(userID.value)
  return result
}

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
      params: { id: route.params.id },
    },
  },
  {
    label: '回答',
    route: {
      name: 'UserAnswer',
      params: { id: route.params.id },
    },
  },
  {
    label: '关注',
    route: {
      name: 'UserFollowing',
      params: { id: route.params.id },
    },
  },
  {
    label: '粉丝',
    route: {
      name: 'UserFollower',
      params: { id: route.params.id },
    },
  },
]
</script>
