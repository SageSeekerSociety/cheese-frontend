<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <div class="d-flex flex-column flex-md-row align-start align-md-center">
          <v-avatar size="96" :image="getAvatarUrl(space?.avatarId)" />
          <div class="ml-0 ml-md-8 mt-4 mt-md-0 flex-grow-1">
            <div class="text-h5">{{ space?.name }}</div>
            <div class="text-body-2 mt-1 text-grey-darken-1">{{ space?.intro }}</div>
            <div class="mt-2 admin-info-container">
              <div class="admin-avatars">
                <v-avatar
                  v-for="admin in space?.admins"
                  :key="admin.user.id"
                  size="32"
                  class="admin-avatar"
                  :image="getAvatarUrl(admin.user.avatarId)"
                />
              </div>
              <div class="text-body-2 text-medium-emphasis admin-text">{{ adminText }}</div>
            </div>
          </div>
          <div v-if="isCurrentUserAtLeastAdmin" class="flex-shrink-0 mt-4 mt-md-0">
            <v-btn class="ms-0 ms-md-4" prepend-icon="mdi-pencil" rounded="lg">
              <div class="text-none font-weight-regular">{{ t('spaces.detail.editInfo') }}</div>

              <v-dialog v-if="isCurrentUserAtLeastAdmin" v-model="isUpdating" activator="parent" width="800">
                <template #default>
                  <v-card>
                    <v-card-title>{{ t('spaces.detail.editSpaceInfo') }}</v-card-title>
                    <v-card-text>
                      <v-form>
                        <v-container fluid>
                          <v-row>
                            <v-col cols="12" md="4">
                              <avatar-uploader v-model="selectedAvatar" />
                            </v-col>
                            <v-col cols="12" md="8">
                              <v-text-field v-model="name" :label="t('spaces.detail.spaceName')" v-bind="nameProps" />

                              <v-list-subheader>{{ t('spaces.detail.intro') }}</v-list-subheader>
                              <v-text-field v-model="intro" :counter="255" v-bind="introProps" />
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-form>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn color="primary" @click="closeUpdating">{{ t('spaces.detail.cancel') }}</v-btn>
                      <v-btn color="primary" @click="submitUpdate">{{ t('spaces.detail.update') }}</v-btn>
                    </v-card-actions>
                  </v-card>
                </template>
              </v-dialog>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 仅当有公告或用户是管理员时显示公告行 -->
    <v-row v-if="announcements.length > 0 || isCurrentUserAtLeastAdmin" class="mt-2">
      <v-col cols="12">
        <div class="position-relative">
          <!-- 管理员的空状态设计 -->
          <v-card
            v-if="announcements.length === 0 && isCurrentUserAtLeastAdmin"
            class="announcement-empty-card"
            elevation="0"
            variant="tonal"
            color="surface-variant"
            rounded="lg"
          >
            <v-card-text class="announcement-empty-content">
              <v-icon class="announcement-empty-icon mb-2" icon="mdi-bell-badge-outline"></v-icon>
              <div class="announcement-empty-title">{{ t('spaces.detail.noAnnouncements') }}</div>
              <div class="announcement-empty-subtitle">发布一条公告，让成员了解最新动态</div>
              <v-btn
                color="primary"
                variant="flat"
                class="announcement-empty-btn mt-4"
                prepend-icon="mdi-plus-circle"
                rounded="pill"
                @click="openAnnouncementCreating"
              >
                {{ t('spaces.detail.publishAnnouncement') }}
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- 有公告时的显示区域 -->
          <div v-if="announcements.length > 0">
            <div class="announcement-slider">
              <v-btn
                v-if="isCurrentUserAtLeastAdmin"
                color="primary"
                variant="elevated"
                size="small"
                icon="mdi-plus"
                class="floating-add-btn"
                :title="t('spaces.detail.publishAnnouncement')"
                @click="openAnnouncementCreating"
              ></v-btn>

              <v-btn
                v-if="announcements.length > itemsPerRow"
                class="slider-control slider-prev"
                icon="mdi-chevron-left"
                variant="text"
                :disabled="activeStartIndex === 0"
                @click="slidePrev"
              ></v-btn>

              <div class="slider-container px-2">
                <v-row>
                  <v-col
                    v-for="(announcement, index) in visibleAnnouncements"
                    :key="index"
                    :cols="12"
                    :sm="announcements.length === 1 ? 12 : 6"
                    :md="12 / Math.min(visibleAnnouncements.length, 4)"
                    class="px-2 slide-item"
                  >
                    <v-card
                      class="announcement-card h-100 d-flex flex-column"
                      elevation="0"
                      rounded="lg"
                      @click="openAnnouncementDialog(announcement)"
                    >
                      <v-card-title class="pb-0 pt-3 px-4 d-flex align-center justify-space-between">
                        <div class="announcement-title text-truncate">{{ announcement.title }}</div>
                      </v-card-title>
                      <v-card-subtitle class="pt-1 pb-0 px-4 d-flex align-center justify-space-between">
                        <span class="text-caption">{{ dayjs(announcement.createdAt).format('MM-DD') }}</span>
                        <div v-if="isCurrentUserAtLeastAdmin" class="d-flex align-center">
                          <v-btn
                            icon="mdi-pencil"
                            size="small"
                            density="comfortable"
                            variant="text"
                            class="me-1"
                            color="primary"
                            @click.stop="openAnnouncementUpdating(announcements.indexOf(announcement))"
                          ></v-btn>
                          <v-btn
                            icon="mdi-delete"
                            size="small"
                            density="comfortable"
                            variant="text"
                            color="error"
                            @click.stop="deleteAnnouncement(announcements.indexOf(announcement))"
                          ></v-btn>
                        </div>
                      </v-card-subtitle>
                      <v-card-text class="pt-2 pb-3 px-4 flex-grow-1 d-flex flex-column">
                        <div class="announcement-preview flex-grow-1">
                          {{ getAnnouncementPreview(announcement.content, 100) }}
                        </div>
                        <div class="text-primary text-caption text-end mt-2 read-more-text">
                          {{ t('spaces.detail.showMore') }} <v-icon size="x-small" icon="mdi-chevron-right"></v-icon>
                        </div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>

              <v-btn
                v-if="announcements.length > itemsPerRow"
                class="slider-control slider-next"
                icon="mdi-chevron-right"
                variant="text"
                :disabled="activeStartIndex >= announcements.length - itemsPerRow"
                @click="slideNext"
              ></v-btn>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Main content row, sidebar is removed, router-view takes full width -->
    <v-row class="mt-2">
      <v-col cols="12">
        <router-view />
      </v-col>
    </v-row>
  </v-container>
  <v-dialog v-model="isAnnouncementCreatingOrUpdating" width="800">
    <template #default="{ isActive }">
      <v-card>
        <v-card-title>{{
          updatingAnnouncementIndex !== undefined
            ? t('spaces.detail.editAnnouncement')
            : t('spaces.detail.publishAnnouncement')
        }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitAnnouncement">
            <v-text-field v-model="newAnnouncementTitle" :label="t('spaces.detail.announcementTitle')" />
            <tip-tap-editor
              ref="newAnnouncementContentEditor"
              v-model="newAnnouncementContent"
              output="html"
              :label="t('spaces.detail.announcementContent')"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="isActive.value = false">{{ t('spaces.detail.cancel') }}</v-btn>
          <v-btn color="primary" @click="submitAnnouncement">{{ t('spaces.detail.publish') }}</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<script lang="tsx" setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'
import { getAvatarUrl } from '@/utils/materials'
import { setTitle } from '@/utils/title'

import AvatarUploader from '@/components/common/AvatarUploader.vue'
import { AvatarsApi } from '@/network/api/avatars'
import { SpacesApi } from '@/network/api/spaces'
import { useDialog } from '@/plugins/dialog'
import AccountService from '@/services/account'
import { useSpaceStore } from '@/stores/space'
import { SpaceAnnouncement } from '@/types'

const TipTapEditor = defineAsyncComponent(() => import('@/components/common/Editor/TipTapEditor.vue'))
const TipTapViewer = defineAsyncComponent(() => import('@/components/common/Editor/TipTapViewer.vue'))

const route = useRoute()
const dialog = useDialog()
const { t } = useI18n()

const spaceStore = useSpaceStore()
const { currentSpace: space, announcements } = storeToRefs(spaceStore)

const isAnnouncementCreatingOrUpdating = ref(false)
const updatingAnnouncementIndex = ref<number>()
const newAnnouncementTitle = ref('')
const newAnnouncementContent = ref('')
const newAnnouncementContentEditor = ref<InstanceType<typeof TipTapEditor>>()

const isUpdating = ref(false)

const { handleSubmit, defineField, handleReset, resetForm } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      name: z.string().max(32),
      intro: z.string().max(255),
    })
  ),
})

const [name, nameProps] = defineField('name', vuetifyConfig)
const [intro, introProps] = defineField('intro', vuetifyConfig)
const selectedAvatar = ref<File>()

// 滑动轮播相关变量
const activeStartIndex = ref(0)
const windowWidth = ref(window.innerWidth)

// 响应式布局 - 根据屏幕宽度确定每行显示的公告数量
const itemsPerRow = computed(() => {
  if (windowWidth.value < 600) return 1 // xs 屏幕 (手机)
  if (windowWidth.value < 960) return 2 // sm 屏幕 (平板)
  if (windowWidth.value < 1264) return 3 // md 屏幕 (笔记本)
  return 4 // lg 和更大屏幕 (桌面)
})

// 确保activeStartIndex始终有效
watchEffect(() => {
  // 如果公告总数小于等于每行显示数量，重置为0
  if (announcements.value.length <= itemsPerRow.value) {
    activeStartIndex.value = 0
  }
  // 否则确保不会超出范围
  else if (activeStartIndex.value > Math.max(0, announcements.value.length - itemsPerRow.value)) {
    activeStartIndex.value = Math.max(0, announcements.value.length - itemsPerRow.value)
  }
})

// 计算当前可见的公告，没有副作用
const visibleAnnouncements = computed(() => {
  // 如果公告总数小于等于每行显示数量，则显示所有公告
  if (announcements.value.length <= itemsPerRow.value) {
    return announcements.value
  }

  const endIndex = Math.min(activeStartIndex.value + itemsPerRow.value, announcements.value.length)
  return announcements.value.slice(activeStartIndex.value, endIndex)
})

// 滑动方法
const slideNext = () => {
  if (activeStartIndex.value < announcements.value.length - itemsPerRow.value) {
    activeStartIndex.value++
  }
}

const slidePrev = () => {
  if (activeStartIndex.value > 0) {
    activeStartIndex.value--
  }
}

// 监听窗口大小变化
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

const closeUpdating = () => {
  isUpdating.value = false
  selectedAvatar.value = undefined
  handleReset()
}

const adminText = computed(() => {
  if (!space.value?.admins?.length) {
    return t('spaces.detail.noAdmins')
  } else if (space.value?.admins?.length === 1) {
    return t('spaces.detail.creator', { creator: space.value?.admins[0].user.nickname })
  } else {
    return t('spaces.detail.creatorAndAdmins', {
      creator: space.value?.admins[0].user.nickname,
      count: space.value?.admins.length - 1,
    })
  }
})

const isCurrentUserAtLeastAdmin = computed(() => {
  const currentUser = AccountService._user.value
  return space.value?.admins?.some((admin) => admin.user.id === currentUser?.id)
})

const getSpace = async (spaceId: number) => {
  await spaceStore.fetchSpace(spaceId)
  resetForm({
    values: {
      name: space.value?.name,
      intro: space.value?.intro,
    },
  })
}

const openAnnouncementCreating = () => {
  newAnnouncementTitle.value = ''
  newAnnouncementContent.value = ''
  updatingAnnouncementIndex.value = undefined
  isAnnouncementCreatingOrUpdating.value = true
}

const openAnnouncementUpdating = (index: number) => {
  newAnnouncementTitle.value = announcements.value[index].title
  newAnnouncementContent.value = announcements.value[index].content
  updatingAnnouncementIndex.value = index
  isAnnouncementCreatingOrUpdating.value = true
}

const openAnnouncementDialog = (announcement: SpaceAnnouncement) => {
  dialog.custom(announcement.title, () => <TipTapViewer value={announcement.content} />, { showCancel: false })
}

const deleteAnnouncement = async (index: number) => {
  const result = await dialog.confirm(t('spaces.detail.confirmDeleteAnnouncement')).wait()
  if (!result) {
    return
  }
  await spaceStore.deleteAnnouncement(index)
}

const submitAnnouncement = async () => {
  if (!isCurrentUserAtLeastAdmin.value) {
    toast.error(t('spaces.detail.noPermission'))
    return
  }
  const newAnnouncement: SpaceAnnouncement = {
    title: newAnnouncementTitle.value,
    content: newAnnouncementContent.value,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    publisher: AccountService._user.value?.nickname || '',
  }

  try {
    if (updatingAnnouncementIndex.value !== undefined) {
      await spaceStore.updateAnnouncement(updatingAnnouncementIndex.value, newAnnouncement)
    } else {
      await spaceStore.addAnnouncement(newAnnouncement)
    }
    isAnnouncementCreatingOrUpdating.value = false
    updatingAnnouncementIndex.value = undefined
    toast.success(t('spaces.detail.publishSuccess'))
  } catch (error) {
    toast.error(t('spaces.detail.publishFailed'))
    console.error('发布公告失败:', error)
  }
}

onMounted(async () => {
  await getSpace(Number(route.params.spaceId))
  setTitle(space.value?.name || '空间', route)
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.spaceId !== from.params.spaceId) {
    await getSpace(Number(to.params.spaceId))
  }
})

const submitUpdate = handleSubmit(async (data) => {
  console.log('submitUpdate', data)
  if (!space.value?.id) {
    return
  }
  try {
    let avatarId = undefined
    if (selectedAvatar.value) {
      const { data: avatarData } = await AvatarsApi.createAvatar(selectedAvatar.value)
      avatarId = avatarData.avatarId
    }
    await SpacesApi.update(space.value.id, {
      name: data.name === space.value.name ? undefined : data.name,
      intro: data.intro,
      avatarId,
    })
    closeUpdating()
    toast.success(t('spaces.detail.updateSuccess'))
  } catch (error) {
    toast.error(t('spaces.detail.updateFailed'))
  } finally {
    await getSpace(Number(route.params.spaceId))
  }
})

const getAnnouncementPreview = (content: string, length = 120) => {
  // 从HTML内容中提取纯文本预览
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  return textContent.length > length ? textContent.substring(0, length) + '...' : textContent
}
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
    border: 2px solid white;
    transition: margin-left 0.3s ease;
    &:not(:first-child) {
      margin-left: -12px;
    }
  }

  &:hover .admin-avatar:not(:first-child) {
    margin-left: -8px;
  }

  .admin-avatar {
    position: relative;
    &:nth-child(1) {
      z-index: 5;
    }
    &:nth-child(2) {
      z-index: 4;
    }
    &:nth-child(3) {
      z-index: 3;
    }
    &:nth-child(4) {
      z-index: 2;
    }
    &:nth-child(5) {
      z-index: 1;
    }
  }
}

.admin-text {
  margin-left: 12px;
  white-space: nowrap;
}

.floating-add-btn {
  position: absolute;
  top: -16px;
  right: 16px;
  z-index: 10;
  border-radius: 50%;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.announcement-section {
  position: relative;
  background-color: rgba(var(--v-theme-surface), 1);
  border-radius: 12px;
}

.announcement-header {
  position: relative;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.cursor-pointer {
  cursor: pointer;
}

.announcement-card {
  position: relative;
  border: 1px solid rgba(var(--v-theme-primary), 0.15);
  background-color: rgba(var(--v-theme-surface), 1);
  min-height: 150px;
  max-height: 150px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 40px;
    background: linear-gradient(to bottom, rgb(var(--v-theme-primary)), rgba(var(--v-theme-primary), 0.4));
    border-radius: 0 2px 2px 0;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background-color: rgba(var(--v-theme-primary), 0.02);
  }
}

.announcement-title {
  font-size: 1rem;
  font-weight: 500;
  max-width: 80%;
  line-height: 1.3;
}

.announcement-preview {
  color: rgba(var(--v-theme-on-surface), 0.7);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  font-size: 0.875rem;
  line-height: 1.2;
}

.read-more-text {
  font-size: 0.75rem;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  font-weight: 500;

  .v-icon {
    transition: transform 0.2s ease;
  }
}

.announcement-card:hover {
  .read-more-text {
    opacity: 1;

    .v-icon {
      transform: translateX(2px);
    }
  }
}

.announcement-slider {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  .slider-container {
    flex: 1;
    overflow: hidden;
  }

  .slider-control {
    position: absolute;
    z-index: 2;
    width: 40px;
    height: 40px;
    background-color: rgba(var(--v-theme-surface), 0.95);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(var(--v-theme-surface), 0.95);
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
      color: rgb(var(--v-theme-primary));
    }

    &:disabled {
      opacity: 0.4;
      pointer-events: none;
    }
  }

  .slider-prev {
    left: -20px;
  }

  .slider-next {
    right: -20px;
  }
}

.slide-item {
  transition: all 0.3s ease;
}

.announcement-empty-card {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(var(--v-theme-primary), 0.08);
}

.announcement-empty-content {
  text-align: center;
  padding: 28px 16px;
  margin: 0 auto;
  width: 100%;
  max-width: 380px;
}

.announcement-empty-icon {
  font-size: 48px;
  color: rgba(var(--v-theme-primary), 0.8);
  margin-bottom: 16px;
}

.announcement-empty-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.85);
  margin-bottom: 8px;
}

.announcement-empty-subtitle {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 8px;
  line-height: 1.5;
  max-width: 280px;
  margin-left: auto;
  margin-right: auto;
}

.announcement-empty-btn {
  transition: all 0.2s ease;
  font-weight: 500;
}
</style>
