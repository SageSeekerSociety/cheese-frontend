<template>
  <v-app :class="{ 'bg-page-background': props.pageBackground }">
    <v-sonner position="top-center" />
    <slot></slot>
  </v-app>
</template>

<script lang="ts" setup>
import { VSonner } from "vuetify-sonner";

const props = withDefaults(
  defineProps<{
    pageBackground?: boolean;
  }>(),
  {
    pageBackground: true,
  }
);
</script>
