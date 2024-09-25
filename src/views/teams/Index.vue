<template>
  <v-container>
    <v-row>
      <v-col cols="12" md="8">
        <v-card rounded="lg">
          <v-card-title>加入小队</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="fetchSearchResults(searchQuery)">
              <v-text-field
                v-model="searchQuery"
                density="compact"
                flat
                hide-details
                label="搜索小队 ID 或名称"
                prepend-inner-icon="mdi-magnify"
                rounded="lg"
                single-line
                variant="solo-filled"
                class="flex-grow-1"
              ></v-text-field>
            </v-form>
            <template v-if="!searchTeamsData.length">
              <v-empty-state v-if="!searchQuery" title="输入小队 ID 或名称" text="搜索小队" icon="mdi-magnify" />
              <v-empty-state v-else title="没有找到小队" text="请尝试其他搜索词" icon="mdi-emoticon-sad" />
            </template>
            <v-list>
              <v-list-item
                v-for="team in searchTeamsData"
                :key="team.id"
                :title="team.name"
                :subtitle="team.intro"
                :prepend-avatar="getAvatarUrl(team.avatarId)"
                :to="{ name: 'TeamsDetail', params: { teamId: team.id } }"
              >
                <template #append>
                  <v-btn variant="tonal" color="primary" @click.stop.prevent="joinTeam(team.id)"> 申请加入 </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <div class="d-flex flex-column justify-stretch teams-right-container">
          <v-btn prepend-icon="mdi-plus" color="primary" block rounded="lg" @click="openCreateTeamDialog">
            创建小队
          </v-btn>
          <v-card rounded="lg">
            <v-card-title>我的小队</v-card-title>
            <v-card-text>
              <v-empty-state
                v-if="!myTeams.length"
                title="还没有小队"
                text="创建一个新的小队，或者加入一个现有的小队"
                icon="mdi-emoticon-sad"
              />
              <v-list>
                <v-list-item
                  v-for="team in myTeams"
                  :key="team.id"
                  :title="team.name"
                  :subtitle="team.intro"
                  :prepend-avatar="getAvatarUrl(team.avatarId)"
                  :to="{ name: 'TeamsDetail', params: { teamId: team.id } }"
                />
              </v-list>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="createTeamDialog" width="600">
    <v-card>
      <v-card-title>创建小队</v-card-title>
      <v-card-text>
        <v-form>
          <v-container fluid>
            <v-row>
              <v-col cols="12" md="4">
                <avatar-uploader v-model="teamAvatar" />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field v-model="teamName" label="小队名称" />
                <v-textarea v-model="teamDescription" label="小队描述" />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="primary" @click="createTeam">创建</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AvatarUploader from '@/components/common/AvatarUploader.vue'
import { AvatarsApi } from '@/network/api/avatars'
import { TeamsApi } from '@/network/api/teams'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import type { Team } from '@/types'
import { getAvatarUrl } from '@/utils/materials'
import AccountService from '@/services/account'

const createTeamDialog = ref(false)
const searchQuery = ref('')
const searchTeamsData = ref<Team[]>([])
const myTeams = ref<Team[]>([])
const teamName = ref('')
const teamDescription = ref('')
const teamAvatar = ref<File | undefined>()

const router = useRouter()

const openCreateTeamDialog = () => {
  createTeamDialog.value = true
}
const createTeam = async () => {
  if (teamAvatar.value) {
    const {
      data: { avatarId },
    } = await AvatarsApi.createAvatar(teamAvatar.value)
    const {
      data: { team },
    } = await TeamsApi.create({
      name: teamName.value,
      intro: teamDescription.value,
      avatarId,
    })
    toast.success('创建小队成功')
    router.push(`/teams/${team.id}`)
  }
}
const fetchMyTeams = async () => {
  const {
    data: { teams },
  } = await TeamsApi.getMyTeams()
  myTeams.value = teams
}
const fetchSearchResults = async (query: string) => {
  if (!query) {
    searchTeamsData.value = []
    return
  }
  const {
    data: { teams },
  } = await TeamsApi.search({ query })
  searchTeamsData.value = teams
}
const joinTeam = async (teamId: number) => {
  if (!AccountService.user) {
    toast.error('请先登录')
    return
  }
  const {
    data: { team },
  } = await TeamsApi.addMember(teamId, { userId: AccountService.user.id, role: 'MEMBER' })
  console.log(team)
  toast.success('申请加入小队成功')
  // router.push({ name: 'TeamsDetail', params: { teamId } })
}

onMounted(async () => {
  await fetchMyTeams()
})
</script>

<style scoped>
.teams-right-container {
  gap: 16px;
}
</style>
