<template>
  <v-chip
    size="small"
    density="comfortable"
    variant="tonal"
    color="primary"
    class="cite-chip"
    :title="title"
    prepend-icon="mdi-book-open-variant"
    @click="open"
  >
    记忆
  </v-chip>
</template>

<script setup lang="ts">
interface Props {
  sourceType?: string
  sourceId: string
  snippet?: string
}
const props = defineProps<Props>()
const title = props.snippet || '来自你的记忆'
const open = () => {
  window.dispatchEvent(
    new CustomEvent('open-cite', {
      detail: { source_type: props.sourceType ?? 'EPISODIC_MEMORY', source_id: props.sourceId, snippet: props.snippet },
    })
  )
}
</script>

<style scoped>
.cite-chip {
  vertical-align: baseline;
}
</style>
