<template>
  <v-container class="pb-0">
    <v-sheet class="profile-background-base" height="30vh" rounded="lg">
      <v-img
        id="header-img"
        class="rounded-t-lg"
        height="65%"
        aspect-ratio="16/9"
        src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
        cover
      />
      <v-container class="cut-align-center">
        <user-avatar :has-avatar="hasAvatar" :avatar="profile.avatar" :size="120" :class="'rounded-lg'" :rounded="0" />
        <v-container class="info-wrapper">
          <v-row>
            <v-col class="text-h4 font-weight-bold me-4">
              {{ profile.nickname }}
            </v-col>
            <v-spacer />
            <v-col class="text-right">
              <v-btn color="primary" variant="flat">
                <v-icon left>mdi-plus</v-icon>
                关注
              </v-btn>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="4" class="d-flex flex-column">
              <div>
                <v-icon left>mdi-format-quote-open</v-icon>
                {{ profile.intro }}
              </div>
              <div>
                <v-icon left>mdi-account</v-icon>
                {{ profile.username }}
              </div>
            </v-col>
            <v-spacer />
            <v-col cols="4" class="d-flex align-center justify-end">
              <v-btn
                :ripple="false"
                variant="plain"
                color="black"
                :to="{ name: 'UserFollowing', params: { id: $route.params.id } }"
              >
                {{ fakeData.following }} <br />关注
              </v-btn>
              |
              <v-btn
                :ripple="false"
                variant="plain"
                color="black"
                :to="{ name: 'UserFollower', params: { id: $route.params.id } }"
              >
                {{ fakeData.follower }} <br />粉丝
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import { User } from '@/types/users'
import UserAvatar from '../common/UserAvatar.vue'

const { profile } = withDefaults(
  defineProps<{
    profile: User
  }>(),
  {}
)

const hasAvatar = computed(
  () => !!profile?.avatar && profile?.avatar != 'default.jpg' && profile?.avatar != 'deafult.jpg'
)

const fakeData = {
  following: 114,
  follower: 514,
}

// onMounted(() => {
//   console.log(222, profile, profile.avatar)
// })
</script>

<style scoped>
.profile-background-base {
  position: relative;
}
.cut-align-center {
  position: absolute;
  display: flex;
  top: 65%;
  transform: translateY(-50%);
  padding: 40px;
}
.rounded-avatar {
  border: 4px solid white;
}
.info-wrapper {
  display: flex;
  flex-direction: column;
  padding-left: 30px;
  padding-right: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
