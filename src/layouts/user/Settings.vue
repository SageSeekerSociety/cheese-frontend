<template>
  <router-view />
</template>

<script lang="ts" setup>
import type { User } from '@/types/users'

import { onMounted, provide, ref } from 'vue'

import { UserApi } from '@/network/api/users'
import { currentUserId } from '@/services/account'

const userData = ref<User>()
const loaded = ref(false)

const fetchData = async () => {
  if (!currentUserId.value) {
    loaded.value = true
    return
  }
  const {
    data: { user },
  } = await UserApi.getUserInfo(currentUserId.value)
  userData.value = user
  loaded.value = true
}

onMounted(async () => {
  await fetchData()
})

provide('userData', userData)
</script>
