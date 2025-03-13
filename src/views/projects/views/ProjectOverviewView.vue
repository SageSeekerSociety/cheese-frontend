<template>
  <ProjectOverview :project="project" />
</template>

<script setup lang="ts">
import type { Project } from '@/types'

import { inject } from 'vue'

import ProjectOverview from '../components/ProjectOverview.vue'

// 通过inject获取父组件提供的数据
const project = inject<Project | null>('project', null)
</script>
