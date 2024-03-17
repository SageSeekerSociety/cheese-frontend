<template>
  <v-list v-if="members.length" lines="two">
    <v-list-subheader inset>圈子共有{{ members.length }}位成员</v-list-subheader>
    <v-list-item
      v-for="member in members"
      :key="member.user.id"
      link
      :to="{ name: 'User', params: { id: member.user.id } }"
    >
      <v-row>
        <v-col cols="1">
          <user-avatar
            :has-avatar="!!member.user.avatar && member.user.avatar !== 'default.jpg'"
            :avatar="member.user.avatar"
            size="40"
          />
        </v-col>
        <v-col cols="3">
          <v-list-item-title>{{ member.user.nickname }}</v-list-item-title>
          <v-list-item-subtitle>{{ member.role }}</v-list-item-subtitle>
        </v-col>
        <v-spacer />
        <v-col cols="8" class="d-flex align-center justify-end">
          <v-list-item-subtitle>{{ member.user.intro }}</v-list-item-subtitle>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list>
  <blank-page v-else />
</template>

<script setup lang="ts">
import { GroupMember } from '@/types'
import { defineProps, withDefaults, onMounted } from 'vue'
import UserAvatar from '@/components/common/UserAvatar.vue'
import BlankPage from '@/components/common/BlankPage.vue'

const { members } = withDefaults(
  defineProps<{
    members: GroupMember[]
  }>(),
  {
    members: () => [],
  }
)
// onMounted(() => {
//   console.log(users)
// })
</script>
