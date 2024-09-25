<template>
  <v-defaults-provider :defaults="{ VBtn: { color: 'primary', variant: 'flat' }, VCard: { flat: true } }">
    <v-app :class="{ 'bg-page-background': props.pageBackground }">
      <v-sonner position="top-center" />
      <slot></slot>
    </v-app>
  </v-defaults-provider>
</template>

<script lang="ts" setup>
import { VSonner } from 'vuetify-sonner'

const props = withDefaults(
  defineProps<{
    pageBackground?: boolean
  }>(),
  {
    pageBackground: true,
  }
)
</script>
