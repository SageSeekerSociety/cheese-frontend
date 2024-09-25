<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-avatar size="96" color="grey-lighten-2">
            <v-img :src="getAvatarUrl(teamData?.avatarId)" />
          </v-avatar>
          <div class="ml-8">
            <div class="text-h5">{{ teamData?.name }}</div>
            <div class="text-body-2 mt-1 text-grey-darken-1">{{ teamData?.intro }}</div>
            <div class="mt-2 d-flex align-center">
              <div class="admin-avatars">
                <v-avatar
                  v-for="admin in ownerAndAdminExamples"
                  :key="admin.id"
                  size="32"
                  color="grey-lighten-2 admin-avatar"
                >
                  <v-img :src="getAvatarUrl(admin.avatarId)" />
                </v-avatar>
              </div>
              <div class="text-body-2 text-medium-emphasis admin-text">{{ ownerAndAdminsText }}</div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="3">
        <v-sheet rounded="lg">
          <v-list nav bg-color="transparent">
            <v-list-subheader>导航</v-list-subheader>
            <!-- <v-list-item rounded="lg" color="primary">
              <template #prepend>
                <v-icon>mdi-view-dashboard</v-icon>
              </template>
              <v-list-item-title>概览</v-list-item-title>
            </v-list-item> -->
            <v-list-item rounded="lg" color="primary" :to="{ name: 'TeamsDetailTasks', params: route.params }">
              <template #prepend>
                <v-icon>mdi-trophy</v-icon>
              </template>
              <v-list-item-title>赛题</v-list-item-title>
            </v-list-item>
            <v-list-item rounded="lg" color="primary" :to="{ name: 'TeamsDetailMembers', params: route.params }">
              <template #prepend>
                <v-icon>mdi-account-group</v-icon>
              </template>
              <v-list-item-title>成员</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="9">
        <router-view />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { TeamsApi } from '@/network/api/teams'
import { Team } from '@/types'
import { onMounted, ref, computed, provide } from 'vue'
import { getAvatarUrl } from '@/utils/materials'
import { teamDataInjectionKey } from '@/keys'

const route = useRoute()
const teamData = ref<Team>()
provide(teamDataInjectionKey, teamData)

const fetchTeamData = async (teamId: number) => {
  const {
    data: { team },
  } = await TeamsApi.detail(teamId)
  teamData.value = team
}

const ownerAndAdminExamples = computed(() => {
  if (!teamData.value) {
    return []
  }
  return [teamData.value.owner, ...(teamData.value.admins.examples || [])]
})

const ownerAndAdminTotal = computed(() => {
  if (!teamData.value) {
    return 0
  }
  return 1 + (teamData.value.admins.total || 0)
})

const ownerAndAdminsText = computed(() => {
  console.log(ownerAndAdminExamples.value, ownerAndAdminTotal.value)
  if (!ownerAndAdminTotal.value) {
    return '暂无管理员'
  } else if (ownerAndAdminTotal.value === 1) {
    return `创建者 ${ownerAndAdminExamples.value[0]!.nickname}`
  } else {
    return `创建者 ${ownerAndAdminExamples.value[0]!.nickname} 和 ${ownerAndAdminTotal.value - 1} 位管理员`
  }
})

onMounted(async () => {
  const teamId = Number(route.params.teamId)
  await fetchTeamData(teamId)
})
</script>

<style scoped lang="scss">
.admin-avatars {
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;

  .admin-avatar {
    border: 2px solid #fff;
    transition: all 0.3s ease;
  }

  .admin-avatar:not(:first-child) {
    margin-left: -12px;
  }

  &:hover {
    overflow: visible;

    .admin-avatar:not(:first-child) {
      margin-left: 4px;
    }
  }

  .admin-avatar:nth-child(1) {
    z-index: 10;
  }
  .admin-avatar:nth-child(2) {
    z-index: 9;
  }
  .admin-avatar:nth-child(3) {
    z-index: 8;
  }
  .admin-avatar:nth-child(4) {
    z-index: 7;
  }
  .admin-avatar:nth-child(5) {
    z-index: 6;
  }
}

.admin-text {
  margin-left: 12px;
  white-space: nowrap;
}
</style>
