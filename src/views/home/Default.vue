<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet min-height="70vh" rounded="lg" class="py-1 px-1">
          <div class="d-flex justify-space-between align-center pa-4">
            <div>
              <span class="text-h6 font-weight-bold">热门问题</span>
            </div>
          </div>
          <v-card v-for="item in fakeData" :key="item.title" flat>
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
        <v-btn color="primary" variant="flat" class="mb-4" block rounded="lg"> 提问 </v-btn>
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
const fakeData = [
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
</script>

<style scoped>
.answer-body-text {
  line-height: 1.5;
}
</style>
