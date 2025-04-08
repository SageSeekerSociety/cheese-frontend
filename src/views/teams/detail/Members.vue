<template>
  <v-container class="px-6 py-4">
    <!-- 操作区 -->
    <div class="d-flex align-center mb-4">
      <v-spacer></v-spacer>
      <v-dialog v-model="isInviteDialogActive" max-width="500">
        <template #activator="{ props: activatorProps }">
          <v-btn
            v-if="isSelfAdmin"
            v-bind="activatorProps"
            color="primary"
            prepend-icon="mdi-account-plus"
            size="small"
          >
            邀请成员
          </v-btn>
        </template>

        <template #default="{ isActive }">
          <v-form @submit.prevent="confirmInvite">
            <v-card title="邀请成员">
              <v-card-text>
                <div class="text-caption mb-2">当前只支持通过 UID 邀请成员</div>
                <v-text-field
                  v-model.number="inviteUidInput"
                  label="UID"
                  variant="outlined"
                  hide-details
                  class="mb-4"
                />
                <v-select
                  v-model="inviteRoleInput"
                  :items="roleOptions"
                  label="角色"
                  variant="outlined"
                  hide-details
                  class="mb-4"
                ></v-select>
                <v-textarea
                  v-model="inviteMessageInput"
                  label="邀请消息（可选）"
                  variant="outlined"
                  placeholder="请输入邀请说明..."
                  rows="3"
                  auto-grow
                  hide-details
                ></v-textarea>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn type="button" variant="text" @click="isActive.value = false">取消</v-btn>
                <v-btn type="submit" color="primary" variant="tonal">邀请</v-btn>
              </v-card-actions>
            </v-card>
          </v-form>
        </template>
      </v-dialog>
    </div>

    <!-- 标签页 -->
    <v-tabs v-model="activeTab" color="primary" class="mb-4">
      <v-tab value="members">成员列表</v-tab>
      <v-tab v-if="isSelfAdmin" value="requests">
        加入申请
        <v-badge
          v-if="pendingRequests.length > 0"
          :content="pendingRequests.length"
          color="error"
          class="ml-2"
        ></v-badge>
      </v-tab>
      <v-tab v-if="isSelfAdmin" value="invitations">已发送邀请</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <!-- 成员列表 -->
      <v-window-item value="members">
        <v-card flat rounded="lg">
          <v-list>
            <v-list-item v-for="member in teamMembers" :key="member.user.id" class="member-item">
              <template #prepend>
                <v-avatar size="40" color="grey-lighten-2" class="mr-3">
                  <v-img :src="getAvatarUrl(member.user.avatarId)" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ member.user.nickname }}
                <v-chip v-if="member.role === 'OWNER'" color="primary" size="small" variant="tonal" class="ml-2"
                  >队长</v-chip
                >
                <v-chip v-else-if="member.role === 'ADMIN'" color="secondary" size="small" variant="tonal" class="ml-2"
                  >管理员</v-chip
                >
              </v-list-item-title>
              <template #append>
                <div class="d-flex align-center">
                  <v-tooltip v-if="isSelfOwner && member.role === 'MEMBER'" location="bottom">
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
                  <v-tooltip v-if="isSelfOwner && member.role === 'ADMIN'" location="bottom">
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
                  <v-tooltip v-if="isSelfAdmin && member.role !== 'OWNER'" location="bottom">
                    <template #activator="{ props: activatorProps }">
                      <v-btn
                        v-bind="activatorProps"
                        icon="mdi-delete"
                        variant="text"
                        color="error"
                        size="small"
                        @click="removeMember(member.user.id)"
                      ></v-btn>
                    </template>
                    <span>移除成员</span>
                  </v-tooltip>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- 无成员时的提示 -->
        <div v-if="teamMembers.length === 0" class="text-center py-12">
          <v-icon icon="mdi-account-group" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">暂无成员</h3>
          <p class="text-body-2 text-medium-emphasis mb-6">邀请成员加入小队，开始协作</p>
        </div>
      </v-window-item>

      <!-- 加入申请 -->
      <v-window-item value="requests">
        <v-card v-if="loadingRequests" flat class="d-flex justify-center align-center pa-6">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-card>

        <v-card v-else-if="joinRequests.length === 0" flat class="text-center py-12">
          <v-icon icon="mdi-account-arrow-right" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">暂无加入申请</h3>
          <p class="text-body-2 text-medium-emphasis">没有用户申请加入小队</p>
        </v-card>

        <v-card v-else flat rounded="lg">
          <v-list>
            <v-list-item
              v-for="request in joinRequests"
              :key="request.id"
              class="request-item"
              :class="{ 'pending-request': request.status === 'PENDING' }"
            >
              <template #prepend>
                <v-avatar size="40" color="grey-lighten-2" class="mr-3">
                  <v-img :src="getAvatarUrl(request.user.avatarId)" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ request.user.nickname }}
                <v-chip :color="getStatusColor(request.status)" size="x-small" variant="tonal" class="ml-2">
                  {{ getStatusText(request.status) }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle v-if="request.message" class="text-caption text-truncate">
                {{ request.message }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption">
                申请时间: {{ formatDate(request.createdAt) }}
              </v-list-item-subtitle>

              <template #append>
                <div v-if="request.status === 'PENDING'" class="d-flex">
                  <v-btn
                    variant="text"
                    color="success"
                    size="small"
                    prepend-icon="mdi-check"
                    class="mr-2"
                    @click="approveRequest(request.id)"
                  >
                    批准
                  </v-btn>
                  <v-btn
                    variant="text"
                    color="error"
                    size="small"
                    prepend-icon="mdi-close"
                    @click="rejectRequest(request.id)"
                  >
                    拒绝
                  </v-btn>
                </div>
                <div
                  v-else-if="request.status === 'APPROVED' || request.status === 'REJECTED'"
                  class="text-caption text-medium-emphasis"
                >
                  {{ request.processedBy?.nickname ? `由 ${request.processedBy.nickname} 处理` : '已处理' }}
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-window-item>

      <!-- 已发送邀请 -->
      <v-window-item value="invitations">
        <v-card v-if="loadingInvitations" flat class="d-flex justify-center align-center pa-6">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
        </v-card>

        <v-card v-else-if="teamInvitations.length === 0" flat class="text-center py-12">
          <v-icon icon="mdi-email-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
          <h3 class="text-h6 font-weight-medium mb-2">暂无发出的邀请</h3>
          <p class="text-body-2 text-medium-emphasis">点击右上角的"邀请成员"发送邀请</p>
        </v-card>

        <v-card v-else flat rounded="lg">
          <v-list>
            <v-list-item
              v-for="invitation in teamInvitations"
              :key="invitation.id"
              class="invitation-item"
              :class="{ 'pending-invitation': invitation.status === 'PENDING' }"
            >
              <template #prepend>
                <v-avatar size="40" color="grey-lighten-2" class="mr-3">
                  <v-img :src="getAvatarUrl(invitation.user.avatarId)" />
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-medium">
                {{ invitation.user.nickname }}
                <v-chip :color="getStatusColor(invitation.status)" size="x-small" variant="tonal" class="ml-2">
                  {{ getStatusText(invitation.status) }}
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle v-if="invitation.message" class="text-caption text-truncate">
                {{ invitation.message }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="text-caption">
                邀请时间: {{ formatDate(invitation.createdAt) }}
              </v-list-item-subtitle>

              <template #append>
                <v-btn
                  v-if="invitation.status === 'PENDING'"
                  variant="text"
                  color="error"
                  size="small"
                  icon="mdi-delete"
                  @click="cancelInvitation(invitation.id)"
                ></v-btn>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-window-item>
    </v-window>
  </v-container>
</template>

<script setup lang="ts">
import type { TeamMember, TeamMembershipApplication } from '@/types'

import { computed, inject, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vuetify-sonner'

import { getAvatarUrl } from '@/utils/materials'

import { teamDataInjectionKey } from '@/keys'
import { TeamsApi } from '@/network/api/teams'
import AccountService from '@/services/account'

const route = useRoute()
const isInviteDialogActive = ref(false)
const teamMembers = ref<TeamMember[]>([])
const teamData = inject(teamDataInjectionKey, ref())

const activeTab = ref('members')

const updateActiveTabFromRoute = () => {
  if (route.query.tab && ['members', 'requests', 'invitations'].includes(route.query.tab as string)) {
    activeTab.value = route.query.tab as string
  }

  if (route.query.applicationId) {
    if (route.query.type === 'invitation') {
      activeTab.value = 'invitations'
    } else {
      activeTab.value = 'requests'
    }
  }
}

onMounted(() => {
  const teamId = Number(route.params.teamId)
  fetchTeamMembers(teamId)

  updateActiveTabFromRoute()
})

watch(
  [teamData, activeTab],
  ([newTeamData, newTab]) => {
    if (!newTeamData || !isSelfAdmin.value) return

    const teamId = Number(route.params.teamId)

    if (newTab === 'requests') {
      fetchJoinRequests(teamId)
    } else if (newTab === 'invitations') {
      fetchTeamInvitations(teamId)
    }
  },
  { immediate: true }
)

watch(
  () => route.query,
  () => {
    updateActiveTabFromRoute()
  },
  { immediate: true }
)

const inviteUidInput = ref<number>()
const inviteRoleInput = ref('MEMBER')
const inviteMessageInput = ref('')

const joinRequests = ref<TeamMembershipApplication[]>([])
const loadingRequests = ref(false)

const teamInvitations = ref<TeamMembershipApplication[]>([])
const loadingInvitations = ref(false)

const roleOptions = [
  { title: '普通成员', value: 'MEMBER' },
  { title: '管理员', value: 'ADMIN' },
]

const fetchTeamMembers = async (teamId: number) => {
  const {
    data: { members },
  } = await TeamsApi.getMembers(teamId)
  teamMembers.value = members
}

const fetchJoinRequests = async (teamId: number) => {
  loadingRequests.value = true
  try {
    const response = await TeamsApi.listTeamJoinRequests(teamId)
    joinRequests.value = response.data.applications
  } catch (error) {
    console.error('获取加入申请失败', error)
    toast.error('获取加入申请失败')
  } finally {
    loadingRequests.value = false
  }
}

const fetchTeamInvitations = async (teamId: number) => {
  loadingInvitations.value = true
  try {
    const response = await TeamsApi.listTeamInvitations(teamId)
    teamInvitations.value = response.data.invitations
  } catch (error) {
    console.error('获取已发送邀请失败', error)
    toast.error('获取已发送邀请失败')
  } finally {
    loadingInvitations.value = false
  }
}

const isSelfOwner = computed(() => {
  if (!teamData.value) {
    return false
  }
  return AccountService.user?.id === teamData.value.owner.id
})

const isSelfAdmin = computed(() => {
  if (!teamData.value || !AccountService.user) {
    return false
  }

  if (teamData.value.owner.id === AccountService.user.id) {
    return true
  }

  const isAdmin = teamData.value.admins.examples?.some((admin) => admin.id === AccountService.user?.id)

  return !!isAdmin
})

const pendingRequests = computed(() => {
  return joinRequests.value.filter((request) => request.status === 'PENDING')
})

const confirmInvite = async () => {
  if (!teamData.value || !inviteUidInput.value) {
    return
  }
  try {
    await TeamsApi.createInvitation(teamData.value.id, {
      userId: inviteUidInput.value,
      role: inviteRoleInput.value as any,
      message: inviteMessageInput.value || undefined,
    })
    toast.success('邀请已发送')
  } catch (error) {
    console.error(error)
    toast.error(`邀请失败: ${error instanceof Error ? error.message : '未知错误'}`)
  } finally {
    inviteUidInput.value = undefined
    inviteRoleInput.value = 'MEMBER'
    inviteMessageInput.value = ''
    isInviteDialogActive.value = false
    await fetchTeamInvitations(Number(route.params.teamId))
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

const approveRequest = async (requestId: number) => {
  if (!teamData.value) return

  try {
    await TeamsApi.approveJoinRequest(teamData.value.id, requestId)
    toast.success('已批准申请')
    // 刷新数据
    await Promise.all([fetchJoinRequests(teamData.value.id), fetchTeamMembers(teamData.value.id)])
  } catch (error) {
    console.error('批准申请失败', error)
    toast.error('批准申请失败')
  }
}

const rejectRequest = async (requestId: number) => {
  if (!teamData.value) return

  try {
    await TeamsApi.rejectJoinRequest(teamData.value.id, requestId)
    toast.success('已拒绝申请')
    // 刷新数据
    await fetchJoinRequests(teamData.value.id)
  } catch (error) {
    console.error('拒绝申请失败', error)
    toast.error('拒绝申请失败')
  }
}

const cancelInvitation = async (invitationId: number) => {
  if (!teamData.value) return

  try {
    await TeamsApi.cancelInvitation(teamData.value.id, invitationId)
    toast.success('已取消邀请')
    // 刷新数据
    await fetchTeamInvitations(teamData.value.id)
  } catch (error) {
    console.error('取消邀请失败', error)
    toast.error('取消邀请失败')
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'warning'
    case 'APPROVED':
    case 'ACCEPTED':
      return 'success'
    case 'REJECTED':
    case 'DECLINED':
    case 'CANCELED':
      return 'error'
    default:
      return 'grey'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return '待处理'
    case 'APPROVED':
      return '已批准'
    case 'ACCEPTED':
      return '已接受'
    case 'REJECTED':
      return '已拒绝'
    case 'DECLINED':
      return '已拒绝'
    case 'CANCELED':
      return '已取消'
    default:
      return '未知'
  }
}
</script>

<style scoped lang="scss">
.member-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin-bottom: 2px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.request-item,
.invitation-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  margin-bottom: 4px;
  border-left: 3px solid transparent;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}

.pending-request {
  border-left-color: var(--v-theme-warning);
  background-color: rgba(var(--v-theme-warning), 0.05);
}

.pending-invitation {
  border-left-color: var(--v-theme-info);
  background-color: rgba(var(--v-theme-info), 0.05);
}
</style>
