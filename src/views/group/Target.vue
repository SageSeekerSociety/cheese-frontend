<template>
  <template v-if="loaded">
    <v-card
      v-for="target in fakedata"
      :key="target.id"
      min-height="100px"
      flat
      :to="{ name: 'GroupTargetBase', params: { targetId: target.id } }"
    >
      <v-card-title>
        <span class="text-h6 font-weight-bold">{{ target.name }}</span>
      </v-card-title>
      <v-card-text>
        <!-- <p class="text-body-1">{{ item.author }}：{{ item.content }}</p> -->
        <p class="text-body-1">{{ target.intro }}</p>
      </v-card-text>
    </v-card>
  </template>
  <template v-else>
    <v-skeleton-loader type="paragraph"></v-skeleton-loader>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GroupApi } from '@/network/api/group'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { GroupTarget } from '@/types'

const groupTargetList = ref<GroupTarget[]>([])
const route = useRoute()
const groupId = Number(route.params.groupId)
const loaded = ref(false)

function fetchGroupTargetList() {
  const result = GroupApi.getGroupTargetList(groupId, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}

// onMounted(() => {
//   fetchGroupTargetList().then(({ data: { targets } }) => {
//     groupTargetList.value = targets
loaded.value = true
//     // console.log('***')
//     // console.log(groupId)
//     // console.log('***')

//     // console.log(groupTargetList.value)
//   })
// })
const fakedata = [
  {
    id: 123456789,
    name: 'Target 1',
    intro: '',
    created_at: 1649251200,
    is_timed: false,
    frequency: 'once',
    is_material_required: false,
    start_time: 1649251300,
    end_time: 1649251400,
    materials: [
      {
        type: 'video',
        allow_multiple: false,
        allow_file_type: ['mp4', 'avi'],
        title: 'Video Material',
        description: 'Description for video material',
        required: false,
      },
      {
        type: 'image',
        allow_multiple: false,
        allow_file_type: ['jpg', 'png'],
        title: 'Image Material',
        description: 'Description for image material',
        required: false,
      },
    ],
  },
  {
    id: 987654321,
    name: 'Target 2',
    intro: '',
    created_at: 1649251500,
    is_timed: false,
    frequency: 'daily',
    is_material_required: false,
    start_time: 1649251600,
    end_time: 1649251700,
    materials: [
      {
        type: 'file',
        allow_multiple: false,
        allow_file_type: ['pdf', 'docx'],
        title: 'File Material',
        description: 'Description for file material',
        required: false,
      },
      {
        type: 'video',
        allow_multiple: false,
        allow_file_type: ['mp4', 'avi'],
        title: 'Video Material',
        description: 'Description for video material',
        required: false,
      },
    ],
  },
]
</script>
