<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center">
          <v-avatar size="96" :image="getAvatarUrl(space?.avatarId)" />
          <div class="ml-8">
            <div class="text-h5">{{ space?.name }}</div>
            <div class="text-body-2 mt-1 text-grey-darken-1">{{ space?.intro }}</div>
            <div class="mt-2 admin-info-container">
              <div class="admin-avatars">
                <v-avatar
                  v-for="admin in space?.admins"
                  :key="admin.user.id"
                  size="32"
                  color="admin-avatar"
                  :image="getAvatarUrl(admin.user.avatarId)"
                />
              </div>
              <div class="text-body-2 text-medium-emphasis admin-text">{{ adminText }}</div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <!-- 大屏下左右布局，左侧导航，右侧内容 -->
      <v-col cols="12" md="3">
        <v-sheet rounded="lg">
          <v-list nav bg-color="transparent">
            <v-list-subheader>全部分类</v-list-subheader>
            <v-list-item
              rounded="lg"
              :to="{ name: 'SpacesDetailTasks', params: { spaceId: space?.id } }"
              color="primary"
            >
              <template #prepend>
                <v-icon>mdi-trophy</v-icon>
              </template>
              <v-list-item-title>赛题</v-list-item-title>
            </v-list-item>
            <template v-if="isCurrentUserAtLeastAdmin">
              <v-list-subheader>管理员操作</v-list-subheader>
              <v-list-item
                rounded="lg"
                :to="{ name: 'SpacesDetailAuditTasks', params: { spaceId: space?.id } }"
                color="primary"
              >
                <template #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
                <v-list-item-title>审核赛题</v-list-item-title>
              </v-list-item>
            </template>
          </v-list>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="9">
        <router-view />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { SpacesApi } from '@/network/api/spaces'
import { ref, onMounted, computed } from 'vue'
import { Space } from '@/types'
import { getAvatarUrl } from '@/utils/materials'
import AccountService from '@/services/account'

const route = useRoute()

const space = ref<Space>()

const adminText = computed(() => {
  if (!space.value?.admins?.length) {
    return '暂无管理员'
  } else if (space.value?.admins?.length === 1) {
    return `创建者 ${space.value?.admins[0].user.nickname}`
  } else {
    return `创建者 ${space.value?.admins[0].user.nickname} 和 ${space.value?.admins.length - 1} 位管理员`
  }
})

const getSpace = async (spaceId: number) => {
  const res = await SpacesApi.detail(spaceId)
  space.value = res.data.space
}

const isCurrentUserAtLeastAdmin = computed(() => {
  const currentUser = AccountService._user.value
  return space.value?.admins?.some((admin) => admin.user.id === currentUser?.id)
})

onMounted(async () => {
  await getSpace(Number(route.params.spaceId))
})

onBeforeRouteUpdate(async (to) => {
  await getSpace(Number(to.params.spaceId))
})
</script>

<style scoped lang="scss">
.admin-info-container {
  display: flex;
  align-items: center;
}

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
