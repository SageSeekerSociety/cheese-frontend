<template>
  <v-list v-if="users.length" lines="two">
    <v-list-subheader inset>展示了{{ users.length }}位用户</v-list-subheader>
    <v-list-item v-for="user in users" :key="user.id" link :to="{ name: 'User', params: { id: user.id } }">
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
  <v-container v-else>
    <v-row align="center" justify="center" class="pt-7 pb-7">
      <v-col cols="12" sm="8" md="6">
        <v-card class="text-center text-grey-darken-1" flat>
          <v-icon size="64">mdi-book-alert-outline</v-icon>
          <v-card-text> 空空如也... </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { User } from '@/types/users'
import { defineProps, withDefaults, onMounted } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'

const { users } = withDefaults(
  defineProps<{
    users: User[]
  }>(),
  {
    users: () => [],
  }
)

onMounted(() => {
  console.log(users)
})
</script>
