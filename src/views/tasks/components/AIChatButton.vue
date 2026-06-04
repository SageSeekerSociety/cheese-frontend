<template>
  <v-fade-transition>
    <v-fab
      class="ai-chat-fab"
      app
      color="primary"
      extended
      prepend-icon="mdi-creation"
      text="与 AI 助手对话"
      :active="open"
      @click="$emit('click')"
    ></v-fab>
  </v-fade-transition>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>

<style scoped>
.ai-chat-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 100;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.ai-chat-fab:hover {
  transform: scale(1.05);
}
</style>
