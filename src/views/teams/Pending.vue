<template>
  <v-list class="pa-4">
    <!-- 我发起的申请副标题 -->
    <v-list-subheader>
      我发起的申请 <span v-if="!loadingMyRequests">{{ myRequests.length }}</span>
    </v-list-subheader>

    <!-- 我发起的申请 - 加载中 -->
    <div v-if="loadingMyRequests" class="d-flex flex-column align-center py-4">
      <v-progress-circular indeterminate color="primary" :size="40" :width="3" class="mb-3"></v-progress-circular>
      <p class="text-body-2 text-medium-emphasis">加载中...</p>
    </div>

    <!-- 我发起的申请 - 空状态 -->
    <div v-else-if="!myRequests.length" class="d-flex flex-column align-center py-4">
      <v-avatar size="48" class="bg-grey-lighten-4 mb-3">
        <v-icon icon="mdi-account-arrow-right" size="large" color="grey-darken-1"></v-icon>
      </v-avatar>
      <p class="text-subtitle-2 font-weight-medium text-center mb-1">暂无申请记录</p>
      <p class="text-caption text-center text-medium-emphasis">您还没有申请加入任何小队</p>
    </div>

    <!-- 我发起的申请列表 -->
    <v-list-item
      v-for="request in myRequests"
      :key="`request-${request.id}`"
      rounded="lg"
      class="mb-2 application-item"
    >
      <template #prepend>
        <v-avatar size="40" class="mr-3">
          <v-img :src="getAvatarUrl(request.team.avatarId)"></v-img>
        </v-avatar>
      </template>
      <v-list-item-title class="d-flex align-center">
        {{ request.team.name }}
        <v-chip :color="getStatusColor(request.status)" size="x-small" class="ml-2" variant="tonal">
          {{ getStatusText(request.status) }}
        </v-chip>
      </v-list-item-title>
      <v-list-item-subtitle class="text-caption"> 申请时间: {{ formatDate(request.createdAt) }} </v-list-item-subtitle>

      <template #append>
        <v-btn
          v-if="request.status === 'PENDING'"
          variant="text"
          color="error"
          size="small"
          icon="mdi-close"
          @click="cancelRequest(request.id)"
        ></v-btn>
      </template>
    </v-list-item>

    <!-- 分隔符 -->
    <v-divider v-if="myRequests.length || myInvitations.length" class="my-4"></v-divider>

    <!-- 收到的邀请副标题 -->
    <v-list-subheader>
      收到的邀请 <span v-if="!loadingMyInvitations">{{ myInvitations.length }}</span>
    </v-list-subheader>

    <!-- 收到的邀请 - 加载中 -->
    <div v-if="loadingMyInvitations" class="d-flex flex-column align-center py-4">
      <v-progress-circular indeterminate color="primary" :size="40" :width="3" class="mb-3"></v-progress-circular>
      <p class="text-body-2 text-medium-emphasis">加载中...</p>
    </div>

    <!-- 收到的邀请 - 空状态 -->
    <div v-else-if="!myInvitations.length" class="d-flex flex-column align-center py-4">
      <v-avatar size="48" class="bg-grey-lighten-4 mb-3">
        <v-icon icon="mdi-email-outline" size="large" color="grey-darken-1"></v-icon>
      </v-avatar>
      <p class="text-subtitle-2 font-weight-medium text-center mb-1">暂无邀请</p>
      <p class="text-caption text-center text-medium-emphasis">您暂时没有收到小队邀请</p>
    </div>

    <!-- 收到的邀请列表 -->
    <v-list-item
      v-for="invitation in myInvitations"
      :key="`invitation-${invitation.id}`"
      rounded="lg"
      class="mb-2 application-item"
    >
      <template #prepend>
        <v-avatar size="40" class="mr-3">
          <v-img :src="getAvatarUrl(invitation.team.avatarId)"></v-img>
        </v-avatar>
      </template>
      <v-list-item-title class="d-flex align-center">
        {{ invitation.team.name }}
        <v-chip :color="getStatusColor(invitation.status)" size="x-small" class="ml-2" variant="tonal">
          {{ getStatusText(invitation.status) }}
        </v-chip>
      </v-list-item-title>
      <v-list-item-subtitle class="text-caption">
        邀请时间: {{ formatDate(invitation.createdAt) }}
      </v-list-item-subtitle>

      <template #append>
        <div v-if="invitation.status === 'PENDING'" class="d-flex">
          <v-btn
            variant="text"
            color="success"
            size="small"
            icon="mdi-check"
            title="接受"
            class="mr-1"
            @click="acceptInvitation(invitation.id)"
          ></v-btn>
          <v-btn
            variant="text"
            color="error"
            size="small"
            icon="mdi-close"
            title="拒绝"
            @click="declineInvitation(invitation.id)"
          ></v-btn>
        </div>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import type { TeamMembershipApplication } from '@/types'

import { onMounted, ref } from 'vue'
import { toast } from 'vuetify-sonner'

import { getAvatarUrl } from '@/utils/materials'

import { TeamsApi } from '@/network/api/teams'

// 申请和邀请的状态
const myRequests = ref<TeamMembershipApplication[]>([])
const myInvitations = ref<TeamMembershipApplication[]>([])
const loadingMyRequests = ref(false)
const loadingMyInvitations = ref(false)

// 获取我发起的申请
const fetchMyJoinRequests = async () => {
  loadingMyRequests.value = true
  try {
    const response = await TeamsApi.listMyJoinRequests()
    myRequests.value = response.data.requests
  } catch (error) {
    console.error('获取申请列表失败', error)
    toast.error('获取申请列表失败')
  } finally {
    loadingMyRequests.value = false
  }
}

// 获取我收到的邀请
const fetchMyInvitations = async () => {
  loadingMyInvitations.value = true
  try {
    const response = await TeamsApi.listMyInvitations()
    myInvitations.value = response.data.invitations
  } catch (error) {
    console.error('获取邀请列表失败', error)
    toast.error('获取邀请列表失败')
  } finally {
    loadingMyInvitations.value = false
  }
}

// 取消申请
const cancelRequest = async (requestId: number) => {
  try {
    await TeamsApi.cancelMyJoinRequest(requestId)
    toast.success('申请已取消')
    await fetchMyJoinRequests()
  } catch (error) {
    console.error('取消申请失败', error)
    toast.error('取消申请失败')
  }
}

// 接受邀请
const acceptInvitation = async (invitationId: number) => {
  try {
    await TeamsApi.acceptInvitation(invitationId)
    toast.success('已接受邀请')
    await fetchMyInvitations()
  } catch (error) {
    console.error('接受邀请失败', error)
    toast.error('接受邀请失败')
  }
}

// 拒绝邀请
const declineInvitation = async (invitationId: number) => {
  try {
    await TeamsApi.declineInvitation(invitationId)
    toast.success('已拒绝邀请')
    await fetchMyInvitations()
  } catch (error) {
    console.error('拒绝邀请失败', error)
    toast.error('拒绝邀请失败')
  }
}

// 格式化日期
const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 获取状态颜色
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

// 获取状态文本
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

onMounted(async () => {
  await fetchMyJoinRequests()
  await fetchMyInvitations()
})
</script>

<style scoped>
.application-item {
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.application-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.1);
}
</style>
