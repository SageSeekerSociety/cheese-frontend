<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'

import AccountService from '@/services/account'
import { useSpaceStore } from '@/stores/space'

defineProps<{
  expanded: boolean
}>()

const { t } = useI18n()
const route = useRoute()
const spaceStore = useSpaceStore()
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
</script>

<template>
  <v-list nav density="compact" class="sidebar-list pa-2">
    <v-list-subheader v-show="expanded">{{ t('spaces.detail.allCategories') }}</v-list-subheader>
    <v-tooltip :disabled="expanded" location="end">
      <template #activator="{ props }">
        <v-list-item
          v-bind="expanded ? {} : props"
          rounded="lg"
          :to="{ name: 'SpacesDetailTasks', params: { spaceId: spaceId } }"
          color="primary"
          :exact="true"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-view-grid</v-icon>
          </template>
          <v-list-item-title v-show="expanded">{{ t('spaces.detail.allContests') }}</v-list-item-title>
        </v-list-item>
      </template>
      <span>{{ t('spaces.detail.allContests') }}</span>
    </v-tooltip>

    <!-- 显示分类列表 -->
    <template v-if="categories.length > 0">
      <v-tooltip
        v-for="category in activeCategories"
        :key="`category-${category.id}`"
        :disabled="expanded"
        location="end"
      >
        <template #activator="{ props }">
          <v-list-item
            v-bind="expanded ? {} : props"
            rounded="lg"
            :to="{
              name: 'SpacesDetailTasks',
              params: { spaceId: spaceId },
              query: { category: category.id },
            }"
            color="primary"
            :exact="true"
            class="sidebar-item"
          >
            <template #prepend>
              <v-icon>mdi-shape</v-icon>
            </template>
            <v-list-item-title v-show="expanded">{{ category.name }}</v-list-item-title>
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
        <span>{{ category.name }}</span>
      </v-tooltip>
    </template>

    <v-divider class="my-2"></v-divider>

    <!-- 个人分组 -->
    <v-tooltip :disabled="expanded" location="end">
      <template #activator="{ props }">
        <v-list-item
          v-bind="expanded ? {} : props"
          rounded="lg"
          :to="{ name: 'SpacesDetailTasks', params: { spaceId: spaceId }, query: { type: 'published' } }"
          color="primary"
          :exact="true"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-pencil-box-multiple</v-icon>
          </template>
          <v-list-item-title v-show="expanded">{{ t('spaces.detail.myPublishedContests') }}</v-list-item-title>
        </v-list-item>
      </template>
      <span>{{ t('spaces.detail.myPublishedContests') }}</span>
    </v-tooltip>

    <v-tooltip :disabled="expanded" location="end">
      <template #activator="{ props }">
        <v-list-item
          v-bind="expanded ? {} : props"
          rounded="lg"
          :to="{ name: 'SpacesDetailTasks', params: { spaceId: spaceId }, query: { type: 'joined' } }"
          color="primary"
          :exact="true"
          class="sidebar-item"
        >
          <template #prepend>
            <v-icon>mdi-account-check</v-icon>
          </template>
          <v-list-item-title v-show="expanded">{{ t('spaces.detail.myJoinedContests') }}</v-list-item-title>
        </v-list-item>
      </template>
      <span>{{ t('spaces.detail.myJoinedContests') }}</span>
    </v-tooltip>

    <!-- 管理员操作 -->
    <template v-if="isCurrentUserAtLeastAdmin">
      <v-divider class="my-2"></v-divider>
      <v-list-subheader v-show="expanded">{{ t('spaces.detail.adminOperations') }}</v-list-subheader>

      <v-tooltip :disabled="expanded" location="end">
        <template #activator="{ props }">
          <v-list-item
            v-bind="expanded ? {} : props"
            rounded="lg"
            :to="{ name: 'SpacesDetailAuditTasks', params: { spaceId: spaceId } }"
            color="primary"
            class="sidebar-item"
          >
            <template #prepend>
              <v-icon>mdi-check</v-icon>
            </template>
            <v-list-item-title v-show="expanded">{{ t('spaces.detail.auditContests') }}</v-list-item-title>
          </v-list-item>
        </template>
        <span>{{ t('spaces.detail.auditContests') }}</span>
      </v-tooltip>

      <v-tooltip :disabled="expanded" location="end">
        <template #activator="{ props }">
          <v-list-item
            v-bind="expanded ? {} : props"
            rounded="lg"
            :to="{ name: 'SpacesDetailManageTemplates', params: { spaceId: spaceId } }"
            color="primary"
            class="sidebar-item"
          >
            <template #prepend>
              <v-icon>mdi-file-document-edit</v-icon>
            </template>
            <v-list-item-title v-show="expanded">{{ t('spaces.detail.manageTemplates.title') }}</v-list-item-title>
          </v-list-item>
        </template>
        <span>{{ t('spaces.detail.manageTemplates.title') }}</span>
      </v-tooltip>

      <v-tooltip :disabled="expanded" location="end">
        <template #activator="{ props }">
          <v-list-item
            v-bind="expanded ? {} : props"
            rounded="lg"
            :to="{ name: 'SpacesDetailManageTopics', params: { spaceId: spaceId } }"
            color="primary"
            class="sidebar-item"
          >
            <template #prepend>
              <v-icon>mdi-tag-multiple</v-icon>
            </template>
            <v-list-item-title v-show="expanded">{{ t('spaces.detail.manageTopics.title') }}</v-list-item-title>
          </v-list-item>
        </template>
        <span>{{ t('spaces.detail.manageTopics.title') }}</span>
      </v-tooltip>

      <v-tooltip :disabled="expanded" location="end">
        <template #activator="{ props }">
          <v-list-item
            v-bind="expanded ? {} : props"
            rounded="lg"
            :to="{ name: 'SpacesDetailManageCategories', params: { spaceId: spaceId } }"
            color="primary"
            class="sidebar-item"
          >
            <template #prepend>
              <v-icon>mdi-shape</v-icon>
            </template>
            <v-list-item-title v-show="expanded">{{ t('spaces.detail.manageCategories.title') }}</v-list-item-title>
          </v-list-item>
        </template>
        <span>{{ t('spaces.detail.manageCategories.title') }}</span>
      </v-tooltip>
    </template>
  </v-list>
</template>

<style scoped lang="scss">
.sidebar-list {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: transparent transparent; /* Firefox */

  /* 默认状态下隐藏滚动条 */
  &::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: 4px;
  }

  /* 悬停时才显示滚动条 */
  &:hover::-webkit-scrollbar-thumb {
    background-color: rgba(var(--v-theme-primary), 0.2);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(var(--v-theme-primary), 0.4);
  }
}

.sidebar-item {
  transition: background-color 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}
</style>
