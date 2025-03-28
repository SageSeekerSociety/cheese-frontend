<template>
  <div class="pa-4 pa-sm-6">
    <!-- 成员管理顶部操作区 -->
    <div class="d-flex flex-wrap gap-4 align-center mb-4">
      <div class="search-and-filter d-flex gap-4 flex-grow-1 flex-wrap">
        <v-text-field
          v-model="searchQuery"
          placeholder="搜索成员"
          variant="outlined"
          density="comfortable"
          hide-details
          single-line
          rounded="lg"
          prepend-inner-icon="mdi-magnify"
          class="search-field"
          clearable
        ></v-text-field>

        <v-select
          v-model="filter.role"
          label="角色"
          density="comfortable"
          hide-details
          flat
          rounded="lg"
          single-line
          variant="solo"
          clearable
          :items="roleOptions"
          class="role-filter"
        ></v-select>
      </div>

      <v-btn color="primary" prepend-icon="mdi-account-plus" rounded="lg" class="invite-btn" @click="openInviteDialog">
        添加成员
      </v-btn>
    </div>

    <!-- 成员列表 -->
    <v-card variant="flat" rounded="lg" class="members-card">
      <v-data-table
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="filteredMembers"
        :loading="loading"
        :items-length="totalMembers"
        item-value="id"
        class="members-table"
      >
        <!-- 成员信息列 -->
        <template #[`item.user`]="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3">
              <v-img :src="getAvatarUrl(item.user.avatarId)" />
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.user.nickname }}</div>
              <!-- <div class="text-caption text-medium-emphasis user-email">{{ item.user.email }}</div> -->
            </div>
          </div>
        </template>

        <!-- 角色列 -->
        <template #[`item.role`]="{ item }">
          <v-chip :color="getRoleColor(item.role)" variant="flat" size="small" class="role-chip">
            {{ getMemberRoleText(item.role) }}
          </v-chip>
        </template>

        <!-- 加入时间列 -->
        <template #[`item.createdAt`]="{ item }">
          <span class="text-body-2">{{ formatDate(item.createdAt) }}</span>
        </template>

        <!-- 操作列 -->
        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-end">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                  density="comfortable"
                ></v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="openChangeRoleDialog(item)">
                  <template #prepend>
                    <v-icon size="small">mdi-badge-account-horizontal</v-icon>
                  </template>
                  <v-list-item-title>变更角色</v-list-item-title>
                </v-list-item>
                <v-list-item
                  :disabled="isCurrentUserLeader && item.role === 'LEADER'"
                  @click="confirmRemoveMember(item)"
                >
                  <template #prepend>
                    <v-icon size="small" color="error">mdi-account-remove</v-icon>
                  </template>
                  <v-list-item-title class="text-error">移除成员</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>

        <!-- 空状态 -->
        <template #no-data>
          <div class="text-center py-8">
            <v-icon icon="mdi-account-group-outline" size="64" color="grey-lighten-2" class="mb-4"></v-icon>
            <h3 class="text-h6 font-weight-medium mb-2">暂无成员</h3>
            <p class="text-body-2 text-medium-emphasis mb-4">邀请新成员加入项目</p>
            <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openInviteDialog">添加成员</v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- 添加成员对话框 -->
    <v-dialog v-model="inviteDialog" max-width="600" persistent>
      <v-card rounded="lg">
        <v-card-title class="px-4 pt-4 pb-2">
          <span class="text-h6">添加项目成员</span>
        </v-card-title>
        <v-card-text class="px-4">
          <v-form ref="inviteFormEl" @submit.prevent="inviteMembers">
            <p class="text-body-2 text-medium-emphasis mb-4">从团队中选择成员添加到项目，或者邀请新的外部协作者</p>

            <v-tabs v-model="inviteTab" color="primary" class="mb-4">
              <v-tab value="team">从团队添加</v-tab>
              <v-tab value="external" disabled>邀请外部成员</v-tab>
            </v-tabs>

            <v-window v-model="inviteTab">
              <!-- 从团队添加成员 -->
              <v-window-item value="team">
                <v-autocomplete
                  v-model="selectedTeamMembers"
                  label="选择团队成员"
                  variant="outlined"
                  density="comfortable"
                  :items="availableTeamMembers"
                  item-title="nickname"
                  item-value="id"
                  return-object
                  multiple
                  chips
                  closable-chips
                  :rules="[(v) => v.length > 0 || '请选择至少一名成员']"
                >
                  <template #item="{ item, props }">
                    <v-list-item v-bind="props">
                      <template #prepend>
                        <v-avatar size="32">
                          <v-img :src="getAvatarUrl(item.raw.avatarId)" />
                        </v-avatar>
                      </template>
                      <v-list-item-title>{{ item.raw.nickname }}</v-list-item-title>
                      <!-- <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle> -->
                    </v-list-item>
                  </template>
                </v-autocomplete>

                <v-radio-group v-model="newMemberRole" label="成员角色" class="mt-4">
                  <v-radio value="MEMBER" label="项目成员 - 可以参与项目的所有工作"></v-radio>
                  <v-radio value="LEADER" label="项目负责人 - 可以管理项目和成员"></v-radio>
                </v-radio-group>
              </v-window-item>

              <!-- 邀请外部成员 (暂不可用) -->
              <v-window-item value="external">
                <div class="text-center py-6">
                  <v-icon icon="mdi-email-outline" size="48" color="grey-lighten-2" class="mb-3"></v-icon>
                  <h3 class="text-subtitle-1 font-weight-medium mb-2">邀请外部成员功能开发中</h3>
                  <p class="text-body-2 text-medium-emphasis">此功能即将推出，敬请期待</p>
                </div>
              </v-window-item>
            </v-window>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="inviteDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="adding" :disabled="selectedTeamMembers.length === 0" @click="inviteMembers">
            添加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 变更角色对话框 -->
    <v-dialog v-model="changeRoleDialog" max-width="500" persistent>
      <v-card rounded="lg">
        <v-card-title class="px-4 pt-4 pb-2">
          <span class="text-h6">变更成员角色</span>
        </v-card-title>
        <v-card-text class="px-4">
          <div v-if="selectedMember" class="d-flex align-center mb-4">
            <v-avatar size="44" class="mr-4">
              <v-img :src="getAvatarUrl(selectedMember.user.avatarId)" />
            </v-avatar>
            <div>
              <div class="text-h6">{{ selectedMember.user.nickname }}</div>
              <div class="text-caption text-medium-emphasis">
                当前角色: {{ getMemberRoleText(selectedMember.role) }}
              </div>
            </div>
          </div>

          <v-radio-group v-model="newRole" label="选择新角色">
            <v-radio value="LEADER" label="项目负责人 - 可以管理项目和成员"></v-radio>
            <v-radio value="MEMBER" label="项目成员 - 可以参与项目的所有工作"></v-radio>
            <v-radio value="EXTERNAL" label="外部协作者 - 仅有有限的访问权限"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="changeRoleDialog = false">取消</v-btn>
          <v-btn color="primary" :loading="updating" @click="changeRole">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 移除成员确认对话框 -->
    <v-dialog v-model="removeDialog" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="px-4 pt-4">确认移除成员</v-card-title>
        <v-card-text class="px-4">
          您确定要将 <strong>{{ selectedMember?.user.nickname }}</strong> 从项目中移除吗？此操作不可撤销。
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="removeDialog = false">取消</v-btn>
          <v-btn color="error" variant="tonal" :loading="removing" @click="removeMember">移除</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { ProjectMember, ProjectMemberRole, User } from '@/types'

import { computed, defineProps, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { VForm } from 'vuetify/lib/components/index.mjs'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import { ProjectsApi } from '@/network/api/projects'
import { currentUserId } from '@/services/account'

// 定义 props
const props = defineProps<{
  projectId: number
}>()

const router = useRouter()

// 成员列表状态
const members = ref<ProjectMember[]>([])
const totalMembers = ref(0)
const loading = ref(true)
const itemsPerPage = ref(10)
const availableTeamMembers = ref<User[]>([])
const isCurrentUserLeader = ref(false)

// 表格头部定义
const headers = [
  { title: '成员', key: 'user', align: 'start' as const, width: '40%' },
  { title: '角色', key: 'role', sortable: true, align: 'start' as const, width: '20%' },
  { title: '加入时间', key: 'createdAt', sortable: true, align: 'start' as const, width: '20%' },
  { title: '操作', key: 'actions', sortable: false, align: 'end' as const, width: '20%' },
]

// 搜索和过滤
const searchQuery = ref('')
const filter = ref({
  role: '',
})

// 角色选项
const roleOptions = [
  { title: '所有角色', value: '' },
  { title: '项目负责人', value: 'LEADER' },
  { title: '项目成员', value: 'MEMBER' },
  { title: '外部协作者', value: 'EXTERNAL' },
]

// 邀请对话框状态
const inviteDialog = ref(false)
const inviteTab = ref('team')
const selectedTeamMembers = ref<User[]>([])
const newMemberRole = ref<ProjectMemberRole>('MEMBER')
const inviteFormEl = ref<InstanceType<typeof VForm> | null>(null)
const adding = ref(false)

// 变更角色对话框状态
const changeRoleDialog = ref(false)
const selectedMember = ref<ProjectMember | null>(null)
const newRole = ref<ProjectMemberRole>('MEMBER')
const updating = ref(false)

// 移除成员对话框状态
const removeDialog = ref(false)
const removing = ref(false)

// 基于搜索和过滤条件的成员列表
const filteredMembers = computed(() => {
  let result = [...members.value]

  // 搜索条件
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter((member) => member.user.nickname.toLowerCase().includes(query))
  }

  // 角色过滤
  if (filter.value.role) {
    result = result.filter((member) => member.role === filter.value.role)
  }

  return result
})

// 获取项目成员列表
const fetchMembers = async () => {
  try {
    loading.value = true
    const response = await ProjectsApi.getMembers(props.projectId)
    members.value = response.data.members
    totalMembers.value = response.data.members.length

    // 检查当前用户是否为项目负责人
    isCurrentUserLeader.value = members.value.some((m) => m.user.id === currentUserId.value && m.role === 'LEADER')
  } catch (error) {
    console.error('获取项目成员失败', error)
  } finally {
    loading.value = false
  }
}

// 获取可邀请的团队成员
const fetchTeamMembers = async () => {
  try {
    // const response = await ProjectsApi.getAvailableMembers(props.projectId)
    // 过滤掉已经在项目中的成员
    // const projectMemberIds = members.value.map((m) => m.user.id)
    // availableTeamMembers.value = response.data.members.filter((user: User) => !projectMemberIds.includes(user.id))
  } catch (error) {
    console.error('获取团队成员失败', error)
  }
}

// 打开邀请成员对话框
const openInviteDialog = () => {
  selectedTeamMembers.value = []
  newMemberRole.value = 'MEMBER'
  fetchTeamMembers()
  inviteDialog.value = true
}

// 邀请成员
const inviteMembers = async () => {
  if (selectedTeamMembers.value.length === 0) return

  try {
    adding.value = true

    // 一次只添加一个成员，循环添加多个成员
    for (const user of selectedTeamMembers.value) {
      await ProjectsApi.addMember(props.projectId, user.id, newMemberRole.value)
    }

    // 刷新成员列表
    await fetchMembers()
    inviteDialog.value = false
  } catch (error) {
    console.error('添加成员失败', error)
  } finally {
    adding.value = false
  }
}

// 打开变更角色对话框
const openChangeRoleDialog = (member: ProjectMember) => {
  selectedMember.value = member
  newRole.value = member.role
  changeRoleDialog.value = true
}

// 变更成员角色
const changeRole = async () => {
  if (!selectedMember.value) return

  try {
    updating.value = true
    // await ProjectsApi.changeMemberRole(props.projectId, selectedMember.value.id, {
    //   role: newRole.value,
    // })

    // 刷新成员列表
    await fetchMembers()
    changeRoleDialog.value = false
  } catch (error) {
    console.error('变更角色失败', error)
  } finally {
    updating.value = false
  }
}

// 确认移除成员
const confirmRemoveMember = (member: ProjectMember) => {
  selectedMember.value = member
  removeDialog.value = true
}

// 移除成员
const removeMember = async () => {
  if (!selectedMember.value) return

  try {
    removing.value = true
    await ProjectsApi.removeMember(props.projectId, selectedMember.value.id)

    // 刷新成员列表
    await fetchMembers()
    removeDialog.value = false
  } catch (error) {
    console.error('移除成员失败', error)
  } finally {
    removing.value = false
  }
}

// 格式化日期
const formatDate = (timestamp: number) => {
  return dayjs(timestamp).format('YYYY/MM/DD')
}

// 获取成员角色文本
const getMemberRoleText = (role: ProjectMemberRole): string => {
  const roleMap: Record<ProjectMemberRole, string> = {
    LEADER: '项目负责人',
    MEMBER: '项目成员',
    EXTERNAL: '外部协作者',
  }
  return roleMap[role] || '项目成员'
}

// 获取角色对应的颜色
const getRoleColor = (role: ProjectMemberRole): string => {
  const colorMap: Record<ProjectMemberRole, string> = {
    LEADER: 'primary',
    MEMBER: 'success',
    EXTERNAL: 'grey',
  }
  return colorMap[role] || 'grey'
}

onMounted(() => {
  fetchMembers()
})
</script>

<style scoped lang="scss">
.search-and-filter {
  @media (min-width: 600px) {
    max-width: 70%;
  }
}

.search-field {
  min-width: 220px;
  flex-grow: 1;
}

.role-filter {
  min-width: 140px;
}

.members-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.12);
  }
}

.members-table {
  :deep(.v-table) {
    background-color: transparent;
  }

  :deep(.v-table__wrapper) {
    border-radius: 0;
  }

  :deep(th) {
    font-weight: 500 !important;
    background-color: rgba(0, 0, 0, 0.015);
    color: rgba(0, 0, 0, 0.75) !important;
    white-space: nowrap;
    letter-spacing: 0.3px;
    padding: 0 16px;
    height: 48px;
  }

  :deep(td) {
    color: rgba(0, 0, 0, 0.8);
    padding: 0 16px;
    height: 56px;
  }

  :deep(tr:hover td) {
    background-color: rgba(var(--v-theme-primary), 0.03) !important;
  }

  :deep(.v-data-table-footer) {
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    background-color: rgba(0, 0, 0, 0.01);
  }
}

.user-email {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.role-chip {
  font-weight: 500;
  min-width: 85px;
  justify-content: center;
}

.invite-btn {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.09);
  }
}

@media (max-width: 600px) {
  .search-and-filter {
    width: 100%;
  }

  .invite-btn {
    width: 100%;
  }
}
</style>
