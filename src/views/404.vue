<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-sheet flat rounded="lg">
            <v-empty-state
              title="404"
              text="这里什么都没有"
              icon="mdi-alert-circle"
              action-text="返回首页"
              @click:action="goHome"
            >
            </v-empty-state>
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>
