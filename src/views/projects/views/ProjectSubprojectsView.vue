<template>
  <ProjectSubprojects :parent-project="project" :subprojects="subprojects" @refresh="refreshSubprojects" />
</template>

<script setup lang="ts">
import type { Project } from '@/types'

import { inject } from 'vue'

import ProjectSubprojects from '../components/ProjectSubprojects.vue'

// 通过inject获取父组件提供的数据
const project = inject<Project | null>('project', null)
const subprojects = inject<Project[]>('subprojects', [])
const refreshSubprojects = inject<() => Promise<void>>('refreshSubprojects', async () => {})
</script>
