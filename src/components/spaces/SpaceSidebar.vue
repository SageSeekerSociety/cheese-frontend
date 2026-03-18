<template>
  <SecondaryNavigation>
    <v-menu offset="8">
      <template #activator="{ isActive, props }">
        <div class="page-header page-header-menu" v-bind="props" :class="{ 'page-header-menu-active': isActive }">
          <v-avatar size="24" :image="getAvatarUrl(space?.avatarId)" />
          <span class="text-subtitle-1">{{ space?.name }}</span>
          <v-spacer></v-spacer>
          <v-icon v-if="isActive">mdi-chevron-up</v-icon>
          <v-icon v-else>mdi-chevron-down</v-icon>
        </div>
      </template>
      <v-list>
        <v-list-item :title="t('spaces.detail.editInfo')" prepend-icon="mdi-pencil" @click="openEditProfile">
        </v-list-item>
        <v-list-item :title="t('spaces.detail.manageAdmins')" prepend-icon="mdi-account-cog" @click="openManageAdmins">
        </v-list-item>
      </v-list>
    </v-menu>
    <v-list nav density="compact" class="sidebar-list pa-2">
      <v-list-item
        rounded="lg"
        :to="{ name: 'SpacesAnnouncements', params: { spaceId: spaceId } }"
        color="primary"
        class="sidebar-item"
      >
        <template #prepend>
          <v-icon>mdi-bullhorn</v-icon>
        </template>
        <v-list-item-title>{{ t('spaces.detail.announcements') }}</v-list-item-title>
      </v-list-item>
      <v-list-subheader>{{ t('spaces.detail.allCategories') }}</v-list-subheader>
      <v-list-item
        rounded="lg"
        :to="{ name: 'SpacesDetailTasksList', params: { spaceId: spaceId } }"
        :active="isTasksLinkActive()"
        color="primary"
        class="sidebar-item"
      >
        <template #prepend>
          <v-icon>mdi-view-grid</v-icon>
        </template>
        <v-list-item-title>{{ t('spaces.detail.allContests') }}</v-list-item-title>
      </v-list-item>

      <!-- 显示分类列表 -->
      <template v-if="categories.length > 0">
        <v-list-item
          v-for="category in activeCategories"
          :key="`category-${category.id}`"
          rounded="lg"
          :to="{
            name: 'SpacesDetailTasksList',
            params: { spaceId: spaceId },
            query: { category: category.id },
          }"
          :active="isTasksLinkActive({ category: category.id.toString() })"
          color="primary"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-shape</v-icon>
          </template>
          <v-list-item-title>{{ category.name }}</v-list-item-title>
          <template v-if="space?.defaultCategoryId === category.id" #append>
            <v-tooltip location="end">
              <template #activator="{ props: tooltipProps }">
                <v-icon v-bind="tooltipProps" size="small" color="warning">mdi-star</v-icon>
              </template>
              {{ t('spaces.detail.manageCategories.defaultCategory') }}
            </v-tooltip>
          </template>
        </v-list-item>
      </template>

      <v-divider class="my-2"></v-divider>

      <!-- 个人分组 -->
      <v-list-item
        rounded="lg"
        :to="{ name: 'SpacesDetailTasksList', params: { spaceId: spaceId }, query: { type: 'published' } }"
        :active="isTasksLinkActive({ type: 'published' })"
        color="primary"
        class="sidebar-item"
      >
        <template #prepend>
          <v-icon>mdi-pencil-box-multiple</v-icon>
        </template>
        <v-list-item-title>{{ t('spaces.detail.myPublishedContests') }}</v-list-item-title>
      </v-list-item>

      <v-list-item
        rounded="lg"
        :to="{ name: 'SpacesDetailTasksList', params: { spaceId: spaceId }, query: { type: 'joined' } }"
        :active="isTasksLinkActive({ type: 'joined' })"
        color="primary"
        class="sidebar-item"
      >
        <template #prepend>
          <v-icon>mdi-account-check</v-icon>
        </template>
        <v-list-item-title>{{ t('spaces.detail.myJoinedContests') }}</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- Discussions Link -->
      <v-list-item
        rounded="lg"
        :to="{ name: 'SpacesDetailDiscussions', params: { spaceId: spaceId } }"
        color="primary"
        class="sidebar-item"
      >
        <template #prepend>
          <v-icon>mdi-forum-outline</v-icon>
        </template>
        <v-list-item-title>{{ t('spaces.discussions.title') }}</v-list-item-title>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- 管理员操作 -->
      <template v-if="isCurrentUserAtLeastAdmin">
        <v-list-subheader>{{ t('spaces.detail.adminOperations') }}</v-list-subheader>

        <v-list-item
          rounded="lg"
          :to="{ name: 'SpacesDetailAuditTasks', params: { spaceId: spaceId } }"
          color="primary"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-check</v-icon>
          </template>
          <v-list-item-title>{{ t('spaces.detail.auditContests') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          rounded="lg"
          :to="{ name: 'SpacesDetailManageTemplates', params: { spaceId: spaceId } }"
          color="primary"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-file-document-edit</v-icon>
          </template>
          <v-list-item-title>{{ t('spaces.detail.manageTemplates.title') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          rounded="lg"
          :to="{ name: 'SpacesDetailAnalytics', params: { spaceId: spaceId } }"
          color="primary"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-chart-line</v-icon>
          </template>
          <v-list-item-title>{{ t('spaces.detail.analytics.title') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          rounded="lg"
          :to="{ name: 'SpacesDetailManageTopics', params: { spaceId: spaceId } }"
          color="primary"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-tag-multiple</v-icon>
          </template>
          <v-list-item-title>{{ t('spaces.detail.manageTopics.title') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          rounded="lg"
          :to="{ name: 'SpacesDetailManageCategories', params: { spaceId: spaceId } }"
          color="primary"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-shape</v-icon>
          </template>
          <v-list-item-title>{{ t('spaces.detail.manageCategories.title') }}</v-list-item-title>
        </v-list-item>
      </template>
    </v-list>
  </SecondaryNavigation>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import { getAvatarUrl } from '@/utils/materials'

import SecondaryNavigation from '@/components/common/Navigation/SecondaryNavigation.vue'
import AccountService from '@/services/account'
import { useSpaceStore } from '@/stores/space'

const { t } = useI18n()
const route = useRoute()
const spaceStore = useSpaceStore()
const { openEditProfile, openManageAdmins } = spaceStore
const { currentSpace: space, categories } = storeToRefs(spaceStore)

const isCurrentUserAtLeastAdmin = computed(() => {
  const currentUser = AccountService._user.value
  return space.value?.admins?.some((admin) => admin.user.id === currentUser?.id)
})

// 获取未归档的分类列表用于侧边栏展示
const activeCategories = computed(() => {
  return categories.value.filter((category) => !category.archivedAt).sort((a, b) => a.displayOrder - b.displayOrder)
})

const spaceId = computed(() => Number(route.params.spaceId))

/**
 * 判断一个指向任务列表的链接是否应该被激活
 * @param {object} query - 该 v-list-item 的 :to.query 对象
 */
function isTasksLinkActive(query: object = {}): boolean {
  // 1. 首先，判断当前是否处于任何 "tasks" 相关的路由下。
  //    使用 `route.matched` 是最可靠的方式，它可以检查当前路由的所有父级记录。
  const isUnderTasksSection = route.matched.some((record) => record.name === 'SpacesDetailTasks')

  // 如果当前页面根本不属于 tasks 板块，直接返回 false
  if (!isUnderTasksSection) {
    return false
  }

  // 2. 如果处于 tasks 板块内（包括列表页、详情页、编辑页等），
  //    则精确比较当前 URL 的 query 参数和链接目标的 query 参数。
  return JSON.stringify(route.query) === JSON.stringify(query)
}
</script>

<style scoped lang="scss">
.sidebar-item {
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}
</style>
