<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet min-height="70vh" rounded="lg" class="py-1 px-1">
          <div class="d-flex justify-space-between align-center pa-4">
            <div style="display: flex; align-items: center">
              <span class="text-h6 font-weight-bold">热门动态</span>
              <div style="padding-left: 8px"><post-insight-entry :item="null" /></div>
            </div>
          </div>
          <v-card v-for="item in fakeInsightData" :key="item.id" flat>
            <insight-card :item="item"></insight-card>
          </v-card>
          <div class="d-flex justify-space-between align-center pa-4">
            <div>
              <span class="text-h6 font-weight-bold">热门问题</span>
            </div>
          </div>
          <v-card v-for="item in fakeQuestionData" :key="item.title" flat>
            <v-card-title class="text-h6 font-weight-medium">{{ item.title }}</v-card-title>
            <v-card-text class="text-body-1 font-weight-regular answer-body-text pb-1">
              {{ item.author }}：{{ item.content }}
            </v-card-text>
            <v-card-actions class="px-3">
              <v-btn color="primary" variant="tonal">
                <v-icon size="24" class="me-2">mdi-menu-up</v-icon>
                {{ item.like_count }}
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
        </v-sheet>
      </v-col>
      <v-col cols="3">
        <v-btn color="primary" variant="flat" class="mb-4" block rounded="lg" :to="{ name: 'QuestionAsk' }">
          提问
        </v-btn>
        <v-sheet rounded="lg">
          <v-list rounded="lg">
            <v-list-item title="我的收藏">
              <template #prepend>
                <v-icon icon="mdi-star"></v-icon>
              </template>
            </v-list-item>
            <v-list-item title="我关注的问题">
              <template #prepend>
                <v-icon icon="mdi-crosshairs-question"></v-icon>
              </template>
              <template #append>
                <v-badge content="3" inline></v-badge>
              </template>
            </v-list-item>
            <v-list-item title="我的邀请">
              <template #prepend>
                <v-icon icon="mdi-account-plus"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import PostInsightEntry from '@/components/common/Insights/PostInsightPopup.vue'
import InsightCard from '@/components/common/Insights/InsightCard.vue'
import { Insight } from '@/types'
import { NewAttitudeType } from '@/constants'

const fakeQuestionData = [
  {
    title: 'TCP和UDP的区别与应用场景',
    content:
      'TCP（传输控制协议）和UDP（用户数据报协议）是互联网中最常用的两种传输层协议，它们在数据传输机制、可靠性和适用场景等方面有显著的不同。',
    author: '滕紫轩',
    like_count: 97,
  },
  {
    title: '数据结构选择数组还是链表？',
    content:
      '在你这种需要高效访问和插入的场景中，可能应该考虑使用数组。因为数组允许O(1)时间复杂度的随机访问，而链表则需要O(n)。',
    author: '吴俊',
    like_count: 48,
  },
  {
    title: '程序有 Bug 但是调不出来怎么办？',
    content:
      '当你遇到程序中的 Bug 而无法轻易调试时，可以尝试以下方法来解决问题：1. 细致审查代码：重新检查代码逻辑，特别是最近修改的部分。检查常见的错误来源，如变量名拼写错误、数据类型不匹配、数组边界问题等。',
    author: '关佳琪',
    like_count: 57,
  },
  {
    title: '求解复杂的线性代数方程组问题',
    content:
      '解决涉及多个未知数的线性代数方程组时，高斯消元法是一个非常有用的工具。这种方法通过行操作将矩阵转换为行阶梯形式或简化的行阶梯形式，从而简化求解过程。下面是一些关于如何应用高斯消元法的步骤和建议：',
    author: '任易轩',
    like_count: 32,
  },
]

const fakeInsightData: Insight[] = [
  {
    id: -1,
    content: '我们正在使用 Vue 3 开发这个应用。',
    author: {
      id: -1,
      username: 'li_hua',
      nickname: '李华',
      avatarId: 1,
      intro: 'Amateur Web developer',
      follow_count: 0,
      fans_count: 0,
      question_count: 0,
      answer_count: 0,
    },
    attitudes: {
      positive_count: 123,
      negative_count: 0,
      difference: 123,
      user_attitude: NewAttitudeType.None,
    },
    created_at: 20240101,
    updated_at: 20240102,
    comment_count: 0,
    view_count: 15080,
    medias: [
      {
        material_id: 1,
        type: 'image',
        url: 'https://www.positivethinking.tech/wp-content/uploads/2021/01/Logo-Vuejs.png',
        meta: {
          width: 500,
          height: 300,
          size: 1,
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Vue.png',
        },
        created_at: 20240101,
      },
      {
        material_id: -3,
        type: 'image',
        url: 'https://www.positivethinking.tech/wp-content/uploads/2021/01/Logo-Vuejs.png',
        meta: {
          width: 500,
          height: 300,
          size: 1,
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Vue.png',
        },
        created_at: 20240101,
      },
      {
        material_id: -3,
        type: 'image',
        url: 'https://www.positivethinking.tech/wp-content/uploads/2021/01/Logo-Vuejs.png',
        meta: {
          width: 500,
          height: 300,
          size: 1,
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Vue.png',
        },
        created_at: 20240101,
      },
      {
        material_id: -3,
        type: 'image',
        url: 'https://www.positivethinking.tech/wp-content/uploads/2021/01/Logo-Vuejs.png',
        meta: {
          width: 500,
          height: 300,
          size: 1,
          thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Vue.png',
        },
        created_at: 20240101,
      },
      {
        material_id: -4,
        type: 'image',
        url: 'https://cdn.usdairy.com/optimize/getmedia/b5108b6f-59c3-4cc4-b1d5-4b9b0d1e0c54/swiss.jpg.jpg.aspx?format=webp',
        meta: {
          width: 400,
          height: 400,
          size: 1,
          thumbnail:
            'https://cdn.usdairy.com/optimize/getmedia/b5108b6f-59c3-4cc4-b1d5-4b9b0d1e0c54/swiss.jpg.jpg.aspx?format=webp',
        },
        created_at: 20240101,
      },
    ],
  },
  {
    id: -2,
    content: '另一些测试内容',
    author: {
      id: -2,
      username: 'MikeMirzayanov',
      nickname: 'Mike',
      avatarId: 1,
      intro: 'From ITMO University',
      follow_count: 0,
      fans_count: 0,
      question_count: 0,
      answer_count: 0,
    },
    attitudes: {
      positive_count: 123,
      negative_count: 0,
      difference: 123,
      user_attitude: NewAttitudeType.None,
    },
    created_at: 20000101,
    updated_at: 20000101,
    comment_count: 7,
    view_count: 87,
    medias: [],
  },
]
</script>

<style scoped>
.answer-body-text {
  line-height: 1.5;
}
</style>
