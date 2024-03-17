<template>
  <v-list v-if="users.length" lines="two">
    <v-list-subheader>{{ $t('users.showUsers', { count: users.length }) }}</v-list-subheader>
    <v-list-item
      v-for="user in users"
      :key="user.id"
      exact
      link
      :to="{ name: 'UserQuestion', params: { id: user.id } }"
    >
      <v-row>
        <v-col cols="1">
          <user-avatar :has-avatar="!!user.avatar && user.avatar !== 'default.jpg'" :avatar="user.avatar" size="40" />
        </v-col>
        <v-col cols="3">
          <v-list-item-title>{{ user.nickname }}</v-list-item-title>
          <v-list-item-subtitle>@{{ user.username }}</v-list-item-subtitle>
        </v-col>
        <v-spacer />
        <v-col cols="8" class="d-flex align-center justify-end">
          <v-list-item-subtitle>{{ user.intro }}</v-list-item-subtitle>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
  <blank-page v-else />
</template>

<script setup lang="ts">
import { User } from '@/types/users'
import { defineProps, withDefaults, onMounted } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import BlankPage from '@/components/common/BlankPage.vue'

const { users } = withDefaults(
  defineProps<{
    users: User[]
  }>(),
  {
    users: () => [],
  }
)
// onMounted(() => {
//   console.log(users)
// })
</script>
