<template>
  <v-main>
    <v-container>
      <v-alert
        type="info"
        title="知是学业社区正在火热建设中！"
        text="本页面尚未完成，为静态 Demo。您可以前往空间页面先体验部分功能，敬请期待！"
      >
        <template #append>
          <v-btn variant="text" color="text" :to="{ path: '/spaces' }">前往空间</v-btn>
        </template>
      </v-alert>
    </v-container>
    <router-view />
  </v-main>
</template>
