<template>
  <v-defaults-provider :defaults="{ VBtn: { color: 'primary', variant: 'flat' }, VCard: { flat: true } }">
    <v-app :class="{ 'bg-page-background': pageBackground }">
      <v-sonner position="top-center" />
      <slot></slot>
      <dialog-container />
    </v-app>
  </v-defaults-provider>
</template>

<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'
import { VSonner } from 'vuetify-sonner'

const DialogContainer = defineAsyncComponent(() => import('./DialogContainer.vue'))

const { pageBackground = true } = defineProps<{
  pageBackground?: boolean
}>()
</script>
