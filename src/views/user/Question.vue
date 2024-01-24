<template>
  <v-card flat v-for="item in fakeData" :key="item.title" class="pt-1">
    <v-card-title
      ><span class="text-h6 font-weight-bold">{{
        item.title
      }}</span></v-card-title
    >
    <v-card-subtitle>{{ item.data }}</v-card-subtitle>
    <v-card-actions>
      <v-btn variant="plain" color="on-background">
        <v-icon size="18" class="me-2">mdi-message-text</v-icon>
        回答
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
    title: "数据结构选择数组还是链表？",
    data: "2021-07-01",
  },
  {
    title: "程序有 Bug 但是调不出来怎么办？",
    data: "1926-08-17",
  },
];
</script>
