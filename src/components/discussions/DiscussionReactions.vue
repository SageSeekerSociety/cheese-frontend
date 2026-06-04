<template>
  <div class="discussion-reactions d-flex align-center flex-wrap">
    <v-chip
      v-for="reactionSummary in sortedReactions"
      :key="reactionSummary.reactionType.id"
      :color="reactionSummary.hasReacted ? 'primary' : undefined"
      :variant="reactionSummary.hasReacted ? 'flat' : 'tonal'"
      size="small"
      class="mr-1 mb-1 reaction-chip"
      label
      @click="handleToggleReaction(reactionSummary.reactionType.id)"
    >
      {{ reactionSummary.reactionType.code }}
      <span class="reaction-count ml-1">
        {{ reactionSummary.count }}
      </span>
    </v-chip>

    <v-menu v-model="showEmojiMenu" :close-on-content-click="false" location="top start">
      <template #activator="{ props: menuActivatorProps }">
        <v-btn
          v-bind="menuActivatorProps"
          icon
          variant="text"
          size="small"
          color="grey-darken-1"
          class="add-reaction-btn ml-1 mb-1"
          density="comfortable"
        >
          <v-icon>mdi-emoticon-plus-outline</v-icon>
        </v-btn>
      </template>
      <v-card class="emoji-selector pa-1" elevation="3" rounded="lg" max-width="280px">
        <div class="d-flex flex-wrap">
          <v-btn
            v-for="reactionType in availableReactionTypes"
            :key="reactionType.id"
            icon
            variant="text"
            size="small"
            class="emoji-btn ma-1"
            @click="
              () => {
                handleToggleReaction(reactionType.id)
                showEmojiMenu = false
              }
            "
          >
            {{ reactionType.code }}
          </v-btn>
        </div>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import type { DiscussionReaction, ReactionType } from '@/types'

import { computed, ref } from 'vue'

const props = defineProps<{
  discussionId: number
  reactions: DiscussionReaction[] | undefined
  availableReactionTypes: ReactionType[]
}>()

const emit = defineEmits<{
  (e: 'toggle-reaction', payload: { discussionId: number; reactionTypeId: number }): void
}>()

const showEmojiMenu = ref(false)

const sortedReactions = computed(() => {
  if (!props.reactions) return []
  // Only show reactions with count > 0, sort by count desc, then by user reaction
  return [...props.reactions]
    .filter((r) => r.count > 0)
    .sort((a, b) => {
      if (a.hasReacted && !b.hasReacted) return -1
      if (!a.hasReacted && b.hasReacted) return 1
      return b.count - a.count
    })
})

const handleToggleReaction = (reactionTypeId: number) => {
  emit('toggle-reaction', { discussionId: props.discussionId, reactionTypeId })
}
</script>

<style scoped lang="scss">
.discussion-reactions {
  gap: 4px; /* Manage spacing between chips and button */
}

.reaction-chip {
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.75rem; // Slightly smaller for list view if needed
  min-width: 45px; // Ensure consistent width
  justify-content: center;

  .reaction-count {
    font-size: 0.7rem;
    font-weight: 500;
    opacity: 0.8;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.add-reaction-btn {
  opacity: 0.7;
  transition: all 0.2s ease;
  &:hover {
    opacity: 1;
    background-color: rgba(var(--v-theme-on-surface), 0.05);
  }
}

.emoji-selector {
  .emoji-btn {
    font-size: 1.25rem; // Larger emojis in picker
    transition: transform 0.15s ease;
    &:hover {
      transform: scale(1.2);
      background-color: rgba(var(--v-theme-on-surface), 0.05);
    }
  }
}
</style>
