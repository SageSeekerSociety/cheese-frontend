<template>
  <SecondaryNavigation>
    <AssistantSidebar :expanded="!rail" @toggle-expand="rail = !rail" />
  </SecondaryNavigation>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import AssistantSidebar from './AssistantSidebar.vue'

import SecondaryNavigation from '@/components/common/Navigation/SecondaryNavigation.vue'

const drawer = ref(true)
const rail = ref(false)
</script>

<style scoped></style>
