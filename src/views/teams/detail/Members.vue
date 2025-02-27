<template>
  <v-card flat rounded="lg">
    <template #title>
      <v-icon left size="24">mdi-account-group</v-icon>
      全部成员
      <v-dialog v-model="isInviteDialogActive" max-width="500">
        <template #activator="{ props: activatorProps }">
          <v-btn v-if="isSelfOwner" v-bind="activatorProps" color="primary" variant="tonal" size="small">
            邀请成员
          </v-btn>
        </template>

        <template #default="{ isActive }">
          <v-form @submit.prevent="confirmInvite">
            <v-card title="邀请成员">
              <v-card-text>
                <div class="text-caption">当前只支持通过 UID 邀请成员</div>
                <v-text-field v-model.number="inviteUidInput" label="UID" />
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn type="button" @click="isActive.value = false">取消</v-btn>
                <v-btn type="submit">邀请</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </template>
      </v-dialog>
    </template>
    <template #text>
      <v-list>
        <v-list-item v-for="member in teamMembers" :key="member.user.id">
          <template #prepend>
            <v-avatar size="32" color="grey-lighten-2">
              <v-img :src="getAvatarUrl(member.user.avatarId)" />
            </v-avatar>
          </template>
          <template #title>
            {{ member.user.nickname }}
            <v-chip v-if="member.role === 'OWNER'" color="primary" size="small" variant="tonal">队长</v-chip>
            <v-chip v-else-if="member.role === 'ADMIN'" color="secondary" size="small" variant="tonal">管理员</v-chip>
          </template>
          <template #append>
            <v-tooltip v-if="isSelfOwner && member.role === 'MEMBER'">
              <template #activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  icon="mdi-account-arrow-up"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="promoteToAdmin(member.user.id)"
                ></v-btn>
              </template>
              <span>提升为管理员</span>
            </v-tooltip>
            <v-tooltip v-if="isSelfOwner && member.role === 'ADMIN'">
              <template #activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  icon="mdi-account-arrow-down"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="demoteToMember(member.user.id)"
                ></v-btn>
              </template>
              <span>降级为成员</span>
            </v-tooltip>
            <v-tooltip v-if="isSelfOwner && member.role !== 'OWNER'">
              <template #activator="{ props: activatorProps }">
                <v-btn
                  v-bind="activatorProps"
                  icon="mdi-delete"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="removeMember(member.user.id)"
                ></v-btn>
              </template>
              <span>移除成员</span>
            </v-tooltip>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-card>
</template>

<script setup lang="ts">
import type { TeamMember } from '@/types'

import { computed, inject, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vuetify-sonner'

import { getAvatarUrl } from '@/utils/materials'

import { teamDataInjectionKey } from '@/keys'
import { TeamsApi } from '@/network/api/teams'
import AccountService from '@/services/account'

const route = useRoute()
const isInviteDialogActive = ref(false)
const teamMembers = ref<TeamMember[]>([])
const inviteUidInput = ref<number>()
const teamData = inject(teamDataInjectionKey, ref())

const fetchTeamMembers = async (teamId: number) => {
  const {
    data: { members },
  } = await TeamsApi.getMembers(teamId)
  teamMembers.value = members
}

const isSelfOwner = computed(() => {
  if (!teamData.value) {
    return false
  }
  return AccountService.user?.id === teamData.value.owner.id
})

const confirmInvite = async () => {
  if (!teamData.value || !inviteUidInput.value) {
    return
  }
  try {
    const { data } = await TeamsApi.addMember(teamData.value.id, {
      role: 'MEMBER',
      userId: inviteUidInput.value,
    })
    toast.success('邀请成功')
  } catch (error) {
    console.error(error)
    toast.error(`邀请失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    inviteUidInput.value = undefined
    isInviteDialogActive.value = false
    await fetchTeamMembers(Number(route.params.teamId))
  }
}

const promoteToAdmin = async (userId: number) => {
  if (!teamData.value) {
    return
  }
  try {
    await TeamsApi.updateMember(teamData.value.id, userId, { role: 'ADMIN' })
    toast.success('提升为管理员成功')
  } catch (error) {
    console.error(error)
    toast.error(`提升为管理员失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    await fetchTeamMembers(Number(route.params.teamId))
  }
}

const demoteToMember = async (userId: number) => {
  if (!teamData.value) {
    return
  }
  try {
    await TeamsApi.updateMember(teamData.value.id, userId, { role: 'MEMBER' })
    toast.success('降级为成员成功')
  } catch (error) {
    console.error(error)
    toast.error(`降级为成员失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    await fetchTeamMembers(Number(route.params.teamId))
  }
}

const removeMember = async (userId: number) => {
  if (!teamData.value) {
    return
  }
  try {
    await TeamsApi.removeMember(teamData.value.id, userId)
    toast.success('移除成员成功')
  } catch (error) {
    console.error(error)
    toast.error(`移除成员失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    await fetchTeamMembers(Number(route.params.teamId))
  }
}

onMounted(async () => {
  await fetchTeamMembers(Number(route.params.teamId))
})
</script>
