<template>
  <v-container class="pb-0">
    <v-sheet class="profile-background-base" rounded="lg">
      <v-img
        class="rounded-t-lg align-end pb-4"
        height="200px"
        cover
        src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
      >
        <div class="d-flex align-center px-8">
          <span class="text-h4 font-weight-bold">
            {{ profile.name }}
            <v-chip> {{ profile.member_count > 40 ? '大圈子' : '小圈子' }} </v-chip>
          </span>
          <v-spacer />
          <v-btn variant="flat" :color="profile.is_member ? 'error' : 'primary'">
            <v-icon left class="me-2">
              {{ profile.is_member ? 'mdi-account-minus' : 'mdi-account-plus' }}
            </v-icon>
            {{ profile.is_member ? '退出圈子' : '加入圈子' }}
          </v-btn>
        </div>
      </v-img>
      <div class="py-4 mx-8 d-flex flex-column">
        <span>
          <v-icon left>mdi-account</v-icon>
          {{ profile.owner.user.nickname }}
        </span>
        <span>
          <v-icon left>mdi-format-quote-open</v-icon>
          {{ profile.intro }}
        </span>
      </div>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import { Group } from '@/types'

const { profile } = withDefaults(
  defineProps<{
    profile: Group
  }>(),
  {}
)
// const props = withDefaults(defineProps<GroupProps>(), {
//   groupData: (props) => props.groupData,
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
.info-bar-upper {
  display: flex;
  flex: 1;
  align-items: center;
}
.info-bar-lower {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
}
</style>
