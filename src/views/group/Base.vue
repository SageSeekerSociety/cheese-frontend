<template>
  <group-card v-if="loaded" :profile="groupInfo" />
  <v-container>
    <v-container fluid class="pa-0">
      <v-row no-gutters>
        <v-col>
          <v-sheet rounded="lg" flat class="me-4">
            <v-tabs v-model="selectedTab">
              <v-tab v-for="tab in tabs" :key="tab.label" :to="tab.route" exact>
                {{ tab.label }}
              </v-tab>
            </v-tabs>
            <router-view />
          </v-sheet>
        </v-col>
        <v-col cols="3">
          <v-card rounded="lg" flat>
            <v-card-item>
              <v-card-title> 小组信息 </v-card-title>
            </v-card-item>
            <v-card-text class="pa-0">
              <v-list>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-help</v-icon>
                  </template>
                  <v-list-item-title> {{ groupInfo.question_count }} 个问题 </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-comment-question</v-icon>
                  </template>
                  <v-list-item-title> {{ groupInfo.answer_count }} 个回答 </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title> {{ groupInfo.member_count }} 个成员 </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import GroupCard from '@/components/group/GroupCard.vue'
import { GroupApi } from '@/network/api/group'
import { useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { Group } from '@/types'
import { useRouter } from 'vue-router'

// const groupInfo = ref<Group>({} as Group)
const groupInfo = {
  id: 123456789,
  name: 'Group A',
  intro: "This is Group A's introduction",
  owner: {
    user: {
      id: 987654321,
      username: 'owner1',
      nickname: 'Owner One',
      avatar: 'https://example.com/avatar1.png',
      intro: 'This user has not set an introduction yet.',
      follow_count: 100,
      fans_count: 50,
      question_count: 20,
      answer_count: 30,
      is_follow: true,
    },
    membership: {
      created_at: 1649251200,
      from: 'application',
      joined_at: 1649251300,
      is_pending: false,
    },
    role: 'owner',
    contributions: {
      score: 1000,
      question_count: 50,
      answer_count: 80,
      check_in_count: 10,
    },
  },
  created_at: 1649251400,
  updated_at: 1649251500,
  member_count: 100,
  question_count: 200,
  answer_count: 300,
  is_member: true,
  topics: [
    {
      id: 1,
      name: 'Topic A',
    },
    {
      id: 2,
      name: 'Topic B',
    },
  ],
  role: 'admin',
}

const route = useRoute()
const router = useRouter()
const groupId = computed(() => Number(route.params.groupId))
const loaded = ref(false)
const selectedTab = ref(0)

// console.log(groupId)
watch(
  () => route.params.groupId,
  () => {
    window.location.reload()
  }
)
// onMounted(() => {
//   // console.log('***')
//   fetchGroupInfo().then(({ data: { group } }) => {
//     groupInfo.value = group
loaded.value = true
//     console.log(groupInfo.value)
//   })
// })

// function fetchGroupInfo() {
//   const result = GroupApi.getGroupInfo(groupId.value)
//   return result
// }

function createTarget() {}

// const fakeGroupData = {
//   groupid: 520,
//   groupName: '音乐入门学习组',
//   groupDesc: '散々雨に降られたって 笑っていられる',
//   groupAvatar: 'https://ods2.oddba.cn/user_files/66368/bbs/35961729_1676268464.png',
//   groupAdmin: 'Bocci',
// }

const tabs = [
  {
    label: '提问',
    route: {
      name: 'GroupQuestion',
      params: { groupId: route.params.groupId },
    },
  },
  {
    label: '打卡',
    route: {
      name: 'GroupTarget',
      params: { groupId: route.params.groupId },
    },
  },
  {
    label: '圈子成员',
    route: {
      name: 'GroupMember',
      params: { groupId: route.params.groupId },
    },
  },
]

const linkitems = [
  {
    title: '创建问题',
    disabled: false,
    fun: () => {
      console.log('创建问题')
    },
  },
  {
    title: '创建打卡',
    disabled: false,
    fun: () => {
      console.log('创建打卡')
    },
  },
  {
    title: '管理小组',
    disabled: false,
    fun: () => {
      console.log('管理小组')
      router.push({ name: 'GroupEdit' })
    },
  },
]
</script>
