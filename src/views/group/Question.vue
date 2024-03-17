<template>
  <v-skeleton-loader type="paragraph" :loading="!loaded">
    <div class="w-100">
      <v-card v-for="item in groupQuestionList" :key="item.id" flat width="100%">
        <v-card-title
          ><span class="text-h6 font-weight-bold">{{ item.title }}</span></v-card-title
        >
        <v-card-text>
          <p class="text-body-1">{{ item.author.nickname }}:{{ item.content }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" variant="tonal">
            <v-icon size="24" class="me-2">mdi-menu-up</v-icon>
            {{ item.attitudes.difference }}
          </v-btn>
          <v-btn color="primary" variant="tonal" min-width="32px">
            <v-icon size="24">mdi-menu-down</v-icon>
          </v-btn>
          <v-btn variant="plain" color="on-background">
            <v-icon size="18" class="me-2">mdi-comment-outline</v-icon>
            评论
          </v-btn>
          <v-btn variant="plain" color="on-background">
            <v-icon size="18" class="me-2">mdi-star-outline</v-icon>
            收藏
          </v-btn>
          <v-btn variant="plain" color="on-background" min-width="32px">
            <v-icon size="18">mdi-dots-horizontal</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-skeleton-loader>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GroupApi } from '@/network/api/group'
import { useRoute } from 'vue-router'
import { Question } from '@/types'

const groupQuestionList = ref<Question[]>([])
const route = useRoute()
const groupId = computed(() => Number(route.params.groupId))
const loaded = ref(false)

function fetchGroupQuestionList() {
  const result = GroupApi.getGroupQuestionList(groupId.value, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}

onMounted(() => {
  fetchGroupQuestionList().then(({ data: { questions } }) => {
    groupQuestionList.value = questions
    loaded.value = true

    // console.log('***')
    // console.log(groupId)
    // console.log('***')

    console.log(groupQuestionList.value)
    console.log('***')
    // console.log(groupQuestionList.value.data[0].id)
  })
})
// const fakedata = {
//   data: [
//     {
//       id: 0,
//       title: 'string',
//       content: 'string',
//       author: {
//         id: 0,
//         nickname: 'string',
//         avatar: 'string',
//       },
//       like_count: 0,
//     },
//   ],
// }
</script>
