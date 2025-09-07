<template>
  <SecondaryNavigation>
    <div class="page-header">
      <span class="text-subtitle-1">首页</span>
      <v-spacer></v-spacer>
    </div>
    <v-list nav :lines="false">
      <v-list-item rounded="lg" prepend-icon="mdi-view-dashboard" to="/spaces" title="空间" color="primary">
      </v-list-item>
      <v-list-item rounded="lg" prepend-icon="mdi-account-group" to="/teams" title="小队" color="primary">
      </v-list-item>
    </v-list>
  </SecondaryNavigation>
</template>

<script setup lang="ts">
import SecondaryNavigation from '@/components/common/Navigation/SecondaryNavigation.vue'
</script>
