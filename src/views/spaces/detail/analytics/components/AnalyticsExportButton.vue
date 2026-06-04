<template>
  <v-btn :loading="loading" rounded="lg" color="primary" variant="flat" @click="download">
    <v-icon start>mdi-download</v-icon>
    {{ label }}
  </v-btn>
</template>

<script setup lang="ts">
import type { AnalyticsExportSection, SpaceAnalyticsQueryState } from '../utils'

import { ref } from 'vue'
import { toast } from 'vuetify-sonner'

import { buildAnalyticsExportUrl } from '../utils'

import accountService from '@/services/account'

const props = defineProps<{
  section: AnalyticsExportSection
  spaceId: number
  filters: SpaceAnalyticsQueryState
  label?: string
}>()

const loading = ref(false)

const download = async () => {
  loading.value = true
  try {
    const resp = await fetch(
      buildAnalyticsExportUrl(import.meta.env.VITE_NEW_API_BASE_URL, props.spaceId, props.section, props.filters),
      {
        headers: accountService.accessToken ? { Authorization: `Bearer ${accountService.accessToken}` } : {},
      }
    )

    if (!resp.ok) {
      throw new Error(`Export failed: ${resp.status}`)
    }

    const blob = await resp.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `space-${props.spaceId}-${props.section}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error(error)
    toast.error('导出失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
