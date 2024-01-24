<template>
  <v-main>
    <v-container class="align-center fill-height">
      <v-row align="center">
        <!-- <v-img height="300" src="@/assets/logo.svg" /> -->
        <v-col cols="12" md="4">
          <h1 class="text-h3 font-weight-bold text-center">知是</h1>

          <div class="text-subtitle-1 font-weight-light mb-1 text-center">
            每个声音都值得被听见
          </div>
        </v-col>

        <v-col cols="12" md="8">
          <v-defaults-provider :defaults="defaults">
            <router-view v-slot="{ Component }">
              <v-scroll-x-reverse-transition mode="out-in">
                <component :is="Component" />
              </v-scroll-x-reverse-transition>
            </router-view>
          </v-defaults-provider>
        </v-col>
      </v-row>
    </v-container>
  </v-main>

  <v-footer app>
    <div class="text-center font-weight-light text-caption" style="width: 100%">
      <span class="mr-1">&copy; 2023</span>
      <span class="mr-1">|</span>
      <span class="mr-1"
        >Made with <v-icon color="red">mdi-heart</v-icon> by
        <a href="https://github.com/SageSeekerSociety" target="_blank"
          >SageSeekerSociety</a
        ></span
      >
    </div>
  </v-footer>
</template>

<script lang="ts" setup>
import MyApp from "@/components/common/MyApp.vue";
import { ref } from "vue";
const defaults = ref({
  VCard: {
    flat: true,
    rounded: "lg",
  },
  VTextField: {
    variant: "underlined",
  },
});
</script>
