<template>
  <ProjectMembers :project-id="projectId" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import ProjectMembers from '../components/ProjectMembers.vue'

const route = useRoute()
const projectId = computed(() => Number(route.params.projectId))
</script>
