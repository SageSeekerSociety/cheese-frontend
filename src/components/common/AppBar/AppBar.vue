<template>
  <v-app-bar app flat>
    <v-container class="mx-auto d-flex align-center justify-center">
      <span class="text-h5 font-weight-bold me-4">🧀知是</span>
      <v-btn
        v-for="link in props.links"
        :key="link.key"
        :text="link.title"
        :to="link.path"
        variant="text"
      ></v-btn>
      <v-spacer></v-spacer>
      <v-responsive max-width="240" class="me-4">
        <v-text-field
          density="compact"
          flat
          hide-details
          label="搜索"
          prepend-inner-icon="mdi-magnify"
          rounded="lg"
          single-line
          variant="solo-filled"
        ></v-text-field>
      </v-responsive>
      <v-btn icon class="me-4">
        <v-icon>mdi-bell</v-icon>
      </v-btn>
      <v-menu
        open-on-hover
        location="bottom center"
        :offset="16"
        :close-on-content-click="false"
        v-if="loggedIn"
      >
        <template v-slot:activator="{ props }">
          <user-avatar
            :has-avatar="hasAvatar"
            :avatar="avatar"
            :size="32"
            v-bind="props"
          ></user-avatar>
        </template>

        <v-list max-width="300px">
          <v-list-item :title="nickname" :subtitle="intro">
            <template v-slot:prepend>
              <user-avatar
                :has-avatar="hasAvatar"
                :avatar="avatar"
                :size="48"
              ></user-avatar>
            </template>
          </v-list-item>
          <v-list-item>
            <div class="d-flex ga-2">
              <v-chip prepend-icon="mdi-cheese" color="primary">50</v-chip>
            </div>
          </v-list-item>
          <v-list-item>
            <v-progress-linear
              model-value="50"
              color="primary"
              rounded
            ></v-progress-linear>
            <div class="text-caption text-medium-emphasis">
              还差 50 声望值升级到下一级
            </div>
          </v-list-item>
          <v-divider class="mt-2"></v-divider>
          <v-list-item to="/user">
            <template v-slot:prepend>
              <v-icon icon="mdi-account"></v-icon>
            </template>
            <v-list-item-title>个人中心</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <template v-slot:prepend>
              <v-icon icon="mdi-exit-to-app"></v-icon>
            </template>
            <v-list-item-title>退出登录</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn
        v-else
        to="/account/signin"
        variant="tonal"
        color="primary"
        prepend-icon="mdi-account"
        >登录</v-btn
      >
    </v-container>
  </v-app-bar>
</template>

<script setup lang="ts">
import { AppBarProps } from "./types";
import { computed } from "vue";
import AccountService from "@/services/account";
import UserAvatar from "../UserAvatar.vue";

const props = withDefaults(defineProps<AppBarProps>(), {
  links: () => [],
});
const loggedIn = computed(() => AccountService._loggedIn.value);
const hasAvatar = computed(
  () =>
    !!AccountService._user.value?.avatar &&
    AccountService._user.value?.avatar != "default.jpg" &&
    AccountService._user.value?.avatar != "deafult.jpg"
);
const avatar = computed(() => AccountService._user.value?.avatar);
const nickname = computed(() => AccountService._user.value?.nickname ?? "");
const intro = computed(() => AccountService._user.value?.intro ?? "");
</script>
