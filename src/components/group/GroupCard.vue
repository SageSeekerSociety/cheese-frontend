<template>
  <v-container class="pb-0">
    <v-sheet class="profile-background-base" height="40vh" rounded="lg">
      <v-img
        class="rounded-t-lg"
        height="65%"
        aspect-ratio="16/9"
        cover
        src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
      />
      <v-container class="cut-align-center">
        <v-avatar class="rounded-avatar" color="white" size="180" rounded="lg">
          <!-- Your avatar content goes here -->
          <v-img v-if="profile" src="https://cdn.vuetifyjs.com/images/parallax/material.jpg" />
        </v-avatar>
        <v-container class="info-wrapper">
          <div class="info-bar-upper">
            <span class="text-h4 font-weight-bold me-4">
              {{ profile.name }}
            </span>
          </div>
          <div class="info-bar-lower">
            <span>
              <v-icon left>mdi-account</v-icon>
              {{ profile.owner.nickname }}
            </span>
            <span>
              <v-icon left>mdi-format-quote-open</v-icon>
              {{ profile.intro }}
            </span>
          </div>
        </v-container>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import { Group } from '@/types/group'

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
