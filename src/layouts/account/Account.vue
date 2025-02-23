<template>
  <v-main>
    <v-container class="align-center fill-height">
      <v-row align="center">
        <!-- <v-img height="300" src="@/assets/logo.svg" /> -->
        <v-col cols="12" md="4">
          <div class="text-center">
            <v-row align="center" class="mb-4">
              <v-col cols="6" md="12" class="py-0">
                <v-img :src="logo" :max-width="display.mdAndUp ? 160 : 100" contain class="mx-auto" />
              </v-col>
              <v-col cols="6" md="12" class="py-0">
                <h1 class="text-h3 font-weight-bold mb-2">知是</h1>
                <div class="text-subtitle-1 font-weight-light text-center">知无界，识有光</div>
              </v-col>
            </v-row>
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

  <v-footer app color="transparent">
    <div class="text-center font-weight-light text-caption" style="width: 100%">
      <span class="mr-1">&copy; 2023 - 2025</span>
      <span class="mr-1">|</span>
      <span class="mr-1"
        >Made with <v-icon color="red">mdi-heart</v-icon> by
        <a href="https://github.com/SageSeekerSociety" target="_blank">SageSeekerSociety</a></span
      >
    </div>
  </v-footer>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useDisplay } from 'vuetify'

import logo from '@/assets/logo.svg'

const display = useDisplay()

const defaults = ref({
  VCard: {
    flat: true,
    rounded: 'lg',
  },
  VTextField: {
    variant: 'underlined',
  },
})
</script>
