<template>
  <v-container>
    <v-row>
      <v-col v-if="data">
        <v-card rounded="lg" flat>
          <v-card-title>{{ data.title }}</v-card-title>
          <v-card-text>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="question-content" v-html="contentHtml"></div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { setTitle } from '@/utils/title'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
import { QuestionApi } from '@/network/api/question'
import { Question } from '@/types'
import { parse } from '@/utils/parser'

const route = useRoute()
const router = useRouter()

const data = ref<Question | null>(null)

const contentHtml = computed(() => {
  if (data.value) {
    return parse(JSON.parse(data.value.content))
  }
  return ''
})

const load = async (id: number) => {
  const res = await QuestionApi.detail(id)
  data.value = res.data
  console.log(res)
}

onMounted(async () => {
  await load(parseInt(route.params.id as string))
})

watch(data, (newVal) => {
  if (newVal) {
    setTitle(newVal.title, route)
  }
})
</script>

<style lang="scss">
.question-content {
  table {
    // font-family: verdana, arial, sans-serif;
    // font-size: 12px;
    color: #333333;
    border-width: 1px;
    border-color: #666666;
    border-collapse: collapse;
    // border-radius: 16px;
  }

  table th {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #666666;
    background-color: #dedede;
  }

  table td {
    border-width: 1px;
    padding: 8px;
    border-style: solid;
    border-color: #666666;
    background-color: #ffffff;
  }
}
</style>
