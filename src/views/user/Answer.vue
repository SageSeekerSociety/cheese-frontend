<template>
    <v-card flat v-for="item in fakeData" :key="item.title">
        <v-card-title><span class="text-h6 font-weight-bold">{{ item.title }}</span></v-card-title>
        <v-card-text>
            <p class="text-body-1">
            {{ item.author }}：{{ item.content }}
            </p>
        </v-card-text>
        <v-card-actions>
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
</template>

<script setup lang="ts">
const fakeData = [
  {
    title: '程序有 Bug 但是调不出来怎么办？',
    content: '当你遇到程序中的 Bug 而无法轻易调试时，可以尝试以下方法来解决问题：1. 细致审查代码：重新检查代码逻辑，特别是最近修改的部分。检查常见的错误来源，如变量名拼写错误、数据类型不匹配、数组边界问题等。',
    author: 'Administrator',
    like_count: 57,
  },
  {
    title: '求解复杂的线性代数方程组问题',
    content: '解决涉及多个未知数的线性代数方程组时，高斯消元法是一个非常有用的工具。这种方法通过行操作将矩阵转换为行阶梯形式或简化的行阶梯形式，从而简化求解过程。下面是一些关于如何应用高斯消元法的步骤和建议：',
    author: 'Administrator',
    like_count: 32,
  },
  {
    title: '程序有 Bug 但是调不出来怎么办？',
    content: '当你遇到程序中的 Bug 而无法轻易调试时，可以尝试以下方法来解决问题：1. 细致审查代码：重新检查代码逻辑，特别是最近修改的部分。检查常见的错误来源，如变量名拼写错误、数据类型不匹配、数组边界问题等。',
    author: 'Administrator',
    like_count: 57,
  },
  {
    title: '求解复杂的线性代数方程组问题',
    content: '解决涉及多个未知数的线性代数方程组时，高斯消元法是一个非常有用的工具。这种方法通过行操作将矩阵转换为行阶梯形式或简化的行阶梯形式，从而简化求解过程。下面是一些关于如何应用高斯消元法的步骤和建议：',
    author: 'Administrator',
    like_count: 32,
  },
]
</script>