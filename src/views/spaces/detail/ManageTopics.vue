<template>
  <v-sheet flat rounded="lg">
    <v-toolbar :title="t('spaces.detail.manageTopics.title')" color="transparent" density="compact">
      <template #append>
        <v-btn color="primary" prepend-icon="mdi-plus">
          {{ t('spaces.detail.manageTopics.addTopics') }}

          <v-dialog v-model="addTopicsDialog" activator="parent" width="800">
            <template #default="{ isActive }">
              <v-card>
                <v-card-title>{{ t('spaces.detail.manageTopics.addTopics') }}</v-card-title>
                <v-card-text>
                  <topic-selector v-model="selectedTopics" always-adding />
                </v-card-text>
                <v-card-actions>
                  <v-btn color="primary" @click="isActive.value = false">
                    {{ t('spaces.detail.manageTopics.cancel') }}
                  </v-btn>
                  <v-btn color="primary" @click="confirmAddTopics">
                    {{ t('spaces.detail.manageTopics.add') }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </template>
          </v-dialog>
        </v-btn>
      </template>
    </v-toolbar>

    <v-list v-if="classificationTopics.length > 0" rounded="lg">
      <v-list-item v-for="(topic, index) in classificationTopics" :key="index" :title="topic.name">
        <template #append>
          <v-btn icon="mdi-delete" variant="text" @click="deleteClassificationTopic(topic.id)"></v-btn>
        </template>
      </v-list-item>
    </v-list>

    <v-sheet v-else class="pa-4 text-center">
      <p class="text-medium-emphasis">{{ t('spaces.detail.manageTopics.noTopics') }}</p>
    </v-sheet>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vuetify-sonner'
import { storeToRefs } from 'pinia'

import TopicSelector from '@/components/common/TopicSelector.vue'
import { useSpaceStore } from '@/store/space'
import { Topic } from '@/types'

const spaceStore = useSpaceStore()
const { classificationTopics } = storeToRefs(spaceStore)
const { deleteClassificationTopic, addClassificationTopics } = spaceStore
const { t } = useI18n()

const selectedTopics = ref<Topic[]>([])
const addTopicsDialog = ref(false)

const confirmAddTopics = async () => {
  try {
    await addClassificationTopics(selectedTopics.value.map((topic) => topic.id))
    selectedTopics.value = []
    addTopicsDialog.value = false
    toast.success(t('spaces.detail.manageTopics.addSuccess'))
  } catch (error) {
    toast.error(t('spaces.detail.manageTopics.addFailed'))
  }
}
</script>
