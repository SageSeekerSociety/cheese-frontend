<template>
  <v-container class="pb-0">
    <v-sheet class="profile-background-base" height="40vh" rounded="lg">
      <v-img
        id="header-img"
        class="rounded-t-lg"
        height="65%"
        aspect-ratio="16/9"
        cover
        :src="props.userData.userHeaderImg"
      />
      <v-container class="cut-align-center">
        <v-avatar class="rounded-avatar" color="white" size="180" rounded="lg">
          <!-- Your avatar content goes here -->
          <v-img :src="props.userData.userAvatar" />
        </v-avatar>
        <v-container class="info-wrapper">
          <div class="info-bar-upper">
            <span class="text-h4 font-weight-bold me-4">
              {{ props.userData.username }}
            </span>
            <v-spacer />
            <v-btn color="primary" variant="flat">
              <v-icon left>mdi-cog</v-icon>
              编辑资料
            </v-btn>
          </div>
          <div class="info-bar-lower">
            <span>
              <v-icon left>mdi-format-quote-open</v-icon>
              {{ props.userData.userDesc }}
            </span>
            <span>
              <v-icon left>mdi-account</v-icon>
              {{ props.userData.userDesc }}
            </span>
          </div>
        </v-container>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import { UserProps } from './types'

const props = withDefaults(defineProps<UserProps>(), {
  userData: () => ({}),
})
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