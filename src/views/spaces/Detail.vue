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
                  color="admin-avatar"
                  :image="getAvatarUrl(admin.user.avatarId)"
                />
              </div>
              <div class="text-body-2 text-medium-emphasis admin-text">{{ adminText }}</div>
            </div>
          </div>
          <div v-if="isCurrentUserAtLeastAdmin" class="flex-shrink-0 mt-4 mt-md-0">
            <v-btn-group color="primary" density="comfortable" variant="flat" rounded="lg" divided>
              <v-btn class="pe-2" prepend-icon="mdi-pencil">
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

                                <v-list-subheader inset>{{ t('spaces.detail.intro') }}</v-list-subheader>
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

              <v-btn size="small" icon>
                <v-icon icon="mdi-menu-down"></v-icon>

                <v-menu activator="parent" location="bottom end" transition="fade-transition">
                  <v-list density="compact" min-width="250" rounded="lg" slim>
                    <v-list-item
                      prepend-icon="mdi-bullhorn"
                      :title="t('spaces.detail.publishAnnouncement')"
                      link
                      @click="openAnnouncementCreating"
                    ></v-list-item>
                  </v-list>
                </v-menu>
              </v-btn>
            </v-btn-group>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col v-for="(announcement, index) in announcements" :key="index" cols="12" sm="4" md="3">
        <v-card rounded="lg" hover @click="openAnnouncementDialog(announcement)">
          <template #title>
            <div class="d-flex flex-row align-center">
              <v-icon>mdi-bullhorn</v-icon>
              <div class="ml-2">{{ announcement.title }}</div>
              <div class="flex-grow-1"></div>
              <template v-if="isCurrentUserAtLeastAdmin">
                <v-btn icon size="small" variant="text" @click.stop="openAnnouncementUpdating(index)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon size="small" variant="text" @click.stop="deleteAnnouncement(index)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </template>
            </div>
          </template>
          <template #text>
            <div class="text-body-2 text-medium-emphasis">
              {{ announcement.publisher }} 发布于 {{ dayjs(announcement.createdAt).format('YYYY-MM-DD HH:mm') }}
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="3">
        <v-sheet rounded="lg">
          <v-list nav bg-color="transparent">
            <v-list-subheader>{{ t('spaces.detail.allCategories') }}</v-list-subheader>
            <v-list-group prepend-icon="mdi-trophy" value="tasks">
              <template #activator="{ props }">
                <v-list-item
                  rounded="lg"
                  :to="{ name: 'SpacesDetailTasks', params: { spaceId: space?.id }, query: { type: 'all' } }"
                  v-bind="props"
                >
                  <template #prepend>
                    <v-icon>mdi-trophy</v-icon>
                  </template>
                  <v-list-item-title>{{ t('spaces.detail.contests') }}</v-list-item-title>
                </v-list-item>
              </template>

              <v-list-item
                rounded="lg"
                :to="{ name: 'SpacesDetailTasks', params: { spaceId: space?.id }, query: { type: 'all' } }"
                color="primary"
                exact
              >
                <v-list-item-title>{{ t('spaces.detail.allContests') }}</v-list-item-title>
              </v-list-item>

              <v-list-item
                rounded="lg"
                :to="{ name: 'SpacesDetailTasks', params: { spaceId: space?.id }, query: { type: 'published' } }"
                color="primary"
                exact
              >
                <v-list-item-title>{{ t('spaces.detail.myPublishedContests') }}</v-list-item-title>
              </v-list-item>

              <v-list-item
                rounded="lg"
                :to="{ name: 'SpacesDetailTasks', params: { spaceId: space?.id }, query: { type: 'joined' } }"
                color="primary"
                exact
              >
                <v-list-item-title>{{ t('spaces.detail.myJoinedContests') }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <template v-if="isCurrentUserAtLeastAdmin">
              <v-list-subheader>{{ t('spaces.detail.adminOperations') }}</v-list-subheader>
              <v-list-item
                rounded="lg"
                :to="{ name: 'SpacesDetailAuditTasks', params: { spaceId: space?.id } }"
                color="primary"
              >
                <template #prepend>
                  <v-icon>mdi-check</v-icon>
                </template>
                <v-list-item-title>{{ t('spaces.detail.auditContests') }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                rounded="lg"
                :to="{ name: 'SpacesDetailManageTemplates', params: { spaceId: space?.id } }"
                color="primary"
              >
                <template #prepend>
                  <v-icon>mdi-file-document-edit</v-icon>
                </template>
                <v-list-item-title>{{ t('spaces.detail.manageTemplates.title') }}</v-list-item-title>
              </v-list-item>
              <v-list-item
                rounded="lg"
                :to="{ name: 'SpacesDetailManageTopics', params: { spaceId: space?.id } }"
                color="primary"
              >
                <template #prepend>
                  <v-icon>mdi-tag-multiple</v-icon>
                </template>
                <v-list-item-title>{{ t('spaces.detail.manageTopics.title') }}</v-list-item-title>
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
import { computed, onMounted, ref } from 'vue'
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
import TipTapEditor from '@/components/common/Editor/TipTapEditor.vue'
import TipTapViewer from '@/components/common/Editor/TipTapViewer.vue'
import { AvatarsApi } from '@/network/api/avatars'
import { SpacesApi } from '@/network/api/spaces'
import { useDialog } from '@/plugins/dialog'
import AccountService from '@/services/account'
import { useSpaceStore } from '@/store/space'
import { SpaceAnnouncement } from '@/types'

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

const isCurrentUserAtLeastAdmin = computed(() => {
  const currentUser = AccountService._user.value
  return space.value?.admins?.some((admin) => admin.user.id === currentUser?.id)
})

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
