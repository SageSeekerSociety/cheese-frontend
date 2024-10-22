<template>
  <v-sheet flat rounded="lg">
    <v-toolbar title="选择赛题模板" color="transparent" density="compact">
      <template #prepend>
        <v-btn variant="text" prepend-icon="mdi-chevron-left" @click="goBack">返回</v-btn>
      </template>
    </v-toolbar>

    <v-list>
      <v-list-item prepend-icon="mdi-file-outline" title="从空白赛题开始" @click="selectTemplate(null)"></v-list-item>
      <v-list-item
        v-for="(template, index) in templates"
        :key="index"
        :title="template.name"
        :subtitle="template.description"
        @click="selectTemplate(template)"
      >
        <template #prepend>
          <v-icon>mdi-file-document-outline</v-icon>
        </template>
      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { SpaceTaskTemplate } from '@/types'
import { useSpaceStore } from '@/store/space'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const spaceId = Number(route.params.spaceId)

const spaceStore = useSpaceStore()
const { templates } = storeToRefs(spaceStore)

const goBack = () => {
  router.go(-1)
}

const selectTemplate = (template: SpaceTaskTemplate | null) => {
  router.push({
    name: 'SpacesDetailPublishTask',
    params: { spaceId },
    query: { templateId: template ? templates.value.indexOf(template).toString() : 'blank' },
  })
}
</script>
