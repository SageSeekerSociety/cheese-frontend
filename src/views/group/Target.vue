<template>
  <!-- <v-card v-for="target in groupTargetList.targets" :key="target.id" min-height="100px" flat>
    <v-card-title
      ><span class="text-h6 font-weight-bold">{{ target.name }}</span></v-card-title
    >
    <v-card-text>
      <p class="text-body-1">{{ item.author }}：{{ item.content }}</p>
      <p class="text-body-1">{{ target.intro }}</p>
    </v-card-text>
    <v-divider></v-divider>
  </v-card> -->
  <v-card v-if="loaded" flat class="pt-2 pb-2 rounded-lg mx-auto pl-5 pr-5">
    <v-card v-for="target in groupTargetList.targets" :key="target.id" min-height="100px" flat>
      <v-card-title
        ><span class="text-h6 font-weight-bold">{{ target.name }}</span></v-card-title
      >
      <v-card-text>
        <!-- <p class="text-body-1">{{ item.author }}：{{ item.content }}</p> -->
        <p class="text-body-1">{{ target.intro }}</p>
      </v-card-text>
      <v-divider></v-divider>
    </v-card>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { TargetList } from '@/types/targetlist'
import { GroupApi } from '@/network/api/group'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'

const groupTargetList = ref<TargetList>({} as TargetList)
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

onMounted(() => {
  fetchGroupTargetList().then((result) => {
    groupTargetList.value = result.data
    loaded.value = true
    console.log('***')
    console.log(groupId)
    console.log('***')

    console.log(groupTargetList.value)
  })
})
const fakeData = [
  {
    id: 0,
    title: '健身打卡目标',
    content: '每天早晨进行一小时的有氧运动，交替锻炼肌肉群，保持饮食规律，每周至少进行三次重量训练。',
    author: '张健身达人',
    like_count: 120,
  },
  {
    id: 1,
    title: '阅读打卡目标',
    content: '每周阅读至少两本书籍，涵盖不同领域如心理学、历史、科幻等。记录读书笔记并分享观点。',
    author: '书香追逐者',
    like_count: 88,
  },
  {
    id: 2,
    title: '学习编程打卡目标',
    content: '每日坚持练习编程，掌握一门新技能，完成至少一个小型项目，参与在线编程社区并分享经验。',
    author: 'CodeXplorer',
    like_count: 105,
  },
  {
    id: 3,

    title: '绘画挑战目标',
    content: '每周完成一幅创意绘画作品，尝试不同的艺术风格和媒介，并在社交平台上展示作品创作过程。',
    author: 'ArtisticSoul',
    like_count: 92,
  },
  {
    id: 4,
    title: '烹饪新菜品目标',
    content: '每月学习一道新的烹饪菜品，探索不同的厨艺和食材搭配，并与朋友家人分享美食体验。',
    author: 'ChefExplorer',
    like_count: 78,
  },
  {
    id: 5,
    title: '音乐创作挑战目标',
    content: '每周创作一首新的音乐作品，尝试不同的乐器和风格，分享作品并收集听众反馈。',
    author: 'MelodyCreator',
    like_count: 110,
  },
  {
    id: 6,
    title: '写作挑战目标',
    content: '每天坚持写作，尝试各种文体，记录观察与思考，提高表达能力和创作水平。',
    author: 'WordsmithWanderer',
    like_count: 96,
  },
]
</script>
@/network/api/group/group
