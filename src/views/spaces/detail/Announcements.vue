<template>
  <div class="page-header">
    <v-icon size="24">mdi-bullhorn</v-icon>
    <span class="text-subtitle-1">{{ t('spaces.detail.announcements') }}</span>
    <v-spacer></v-spacer>
    <v-btn
      v-if="isCurrentUserAtLeastAdmin"
      class="text-medium-emphasis"
      color="text"
      size="small"
      icon
      variant="text"
      @click="openAnnouncementCreating"
    >
      <v-icon left size="20">mdi-plus</v-icon>
    </v-btn>
  </div>
  <div class="pa-4">
    <v-card
      v-if="announcements.length === 0"
      class="announcement-empty-card"
      elevation="0"
      variant="tonal"
      color="surface-variant"
      rounded="lg"
    >
      <v-card-text class="announcement-empty-content">
        <v-icon class="announcement-empty-icon mb-2" icon="mdi-bell-badge-outline"></v-icon>
        <div class="announcement-empty-title">{{ t('spaces.detail.noAnnouncements') }}</div>
        <template v-if="isCurrentUserAtLeastAdmin">
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
        </template>
      </v-card-text>
    </v-card>
    <div v-else>
      <v-card
        v-for="(announcement, index) in announcements"
        :key="index"
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
            {{ t('spaces.detail.openAnnouncement') }} <v-icon size="x-small" icon="mdi-chevron-right"></v-icon>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>

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

<script setup lang="tsx">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { toast } from 'vuetify-sonner'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'

import { useDialog } from '@/plugins/dialog'
import AccountService from '@/services/account'
import { useSpaceStore } from '@/stores/space'
import { SpaceAnnouncement } from '@/types'

const { t } = useI18n()

const TipTapEditor = defineAsyncComponent(() => import('@/components/common/Editor/TipTapEditor.vue'))
const TipTapViewer = defineAsyncComponent(() => import('@/components/common/Editor/TipTapViewer.vue'))

const isAnnouncementCreatingOrUpdating = ref(false)
const updatingAnnouncementIndex = ref<number>()
const newAnnouncementTitle = ref('')
const newAnnouncementContent = ref('')
const newAnnouncementContentEditor = ref<InstanceType<typeof TipTapEditor>>()

const dialog = useDialog()
const spaceStore = useSpaceStore()
const { currentSpace: space, announcements } = storeToRefs(spaceStore)

const isCurrentUserAtLeastAdmin = computed(() => {
  const currentUser = AccountService._user.value
  return space.value?.admins?.some((admin) => admin.user.id === currentUser?.id)
})

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

const getAnnouncementPreview = (content: string, length = 120) => {
  const textContent = content.replace(/<[^>]*>/g, '').trim()
  return textContent.length > length ? textContent.substring(0, length) + '...' : textContent
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
</script>

<style lang="scss" scoped>
.announcement-section {
  position: relative;
  background-color: rgba(var(--v-theme-surface), 1);
  border-radius: 12px;
}

.announcement-header {
  position: relative;
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
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
