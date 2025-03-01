<template>
  <v-container class="pb-0 px-0">
    <v-sheet class="profile-background-base" height="30vh" rounded="lg">
      <v-img
        id="header-img"
        class="rounded-t-lg"
        height="65%"
        aspect-ratio="16/9"
        src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
        cover
      />
      <v-container class="cut-align-center">
        <user-avatar :avatar="getAvatarUrl(profile.avatarId)" :size="120" :class="'rounded-lg'" :rounded="0" />
        <v-container class="info-wrapper">
          <v-row>
            <v-col class="text-h4 font-weight-bold me-4">
              {{ profile.nickname }}
            </v-col>
            <v-spacer />
            <v-col class="text-right">
              <div v-if="!isActivatedUser">
                <v-btn
                  variant="flat"
                  :loading="isFollowLoading"
                  :color="isFollowing ? 'grey' : 'primary'"
                  :prepend-icon="isFollowing ? 'mdi-check' : 'mdi-plus'"
                  @click="updateFollowing"
                >
                  {{ isFollowing ? '已关注' : '关注' }}
                </v-btn>
              </div>
              <div v-else>
                <v-btn color="primary" variant="flat" :to="{ name: 'UserSettingsProfile' }">
                  <v-icon left>mdi-cog</v-icon>
                  编辑资料
                </v-btn>
              </div>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="10" class="d-flex flex-column">
              <div class="text-truncate">
                <v-icon left>mdi-format-quote-open</v-icon>
                {{ profile.intro }}
              </div>
              <div class="text-truncate">
                <v-icon left>mdi-account</v-icon>
                {{ profile.username }}
              </div>
            </v-col>
            <v-spacer />
            <v-col cols="2" class="d-flex align-center justify-end">
              <v-btn
                :ripple="false"
                variant="plain"
                color="black"
                :to="{ name: 'UserFollowing', params: { id: profile.id } }"
              >
                {{ profile.fans_count }} <br />关注
              </v-btn>
              |
              <v-btn
                :ripple="false"
                variant="plain"
                color="black"
                :to="{ name: 'UserFollower', params: { id: profile.id } }"
              >
                {{ profile.follow_count }} <br />粉丝
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-sheet>
  </v-container>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import type { User } from '@/types/users'

import { computed, inject, onMounted, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'
import { getAvatarUrl } from '@/utils/materials'

import FileSelect from '../common/FileSelect.vue'
import UserAvatar from '../common/UserAvatar.vue'

import { AvatarsApi } from '@/network/api/avatars'
import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'

const profile = inject<Ref<User>>('userData', ref({} as User))

const myId = computed(() => AccountService._user.value?.id as number)
const isActivatedUser = computed(() => {
  return myId.value === profile?.value.id
})

const isFollowLoading = ref(false)
const isFollowing = ref(true)

const followUser = async () => {
  const result = await UserApi.followUser(profile?.value.id as number)
  isFollowing.value = true
  isFollowLoading.value = false
  return result
}

const unfollowUser = async () => {
  const result = await UserApi.unfollowUser(profile?.value.id as number)
  isFollowing.value = false
  isFollowLoading.value = false
  return result
}

const updateFollowing = async () => {
  isFollowLoading.value = true
  if (!profile) return
  if (isFollowing.value) {
    await unfollowUser()
  } else {
    await followUser()
  }
}

const { handleSubmit, defineField, handleReset, resetForm } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      nickname: z.string().min(4).max(16),
      intro: z.string().max(60),
      avatar: z
        .array(z.instanceof(File).refine((v) => v.size < 2 * 1024 * 1024, { message: '文件大小不能超过 2MB' }))
        .optional(),
    })
  ),
})

onMounted(() => {})

watch(
  profile,
  (newVal) => {
    if (!newVal) return
    resetForm({
      values: {
        nickname: newVal.nickname,
        intro: newVal.intro,
      },
    })
  },
  { immediate: true }
)

const [selectedNickname, nicknameProps] = defineField('nickname', vuetifyConfig)
const [selectedIntro, introProps] = defineField('intro', vuetifyConfig)
const [selectedAvatar, avatarProps] = defineField('avatar', vuetifyConfig)
const previewUrl = ref('')
const handleFileChange = () => {
  previewUrl.value = ''
  const length = selectedAvatar.value?.length ?? 0
  if (length > 0) {
    readAvatar()
  }
}
const readAvatar = () => {
  if (!selectedAvatar.value) return
  if (selectedAvatar.value.length === 0) return
  const file = selectedAvatar.value[0]
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = (event) => {
    previewUrl.value = event.target?.result as string
  }
}
const submit = handleSubmit(async (values) => {
  let avatarId = profile.value.avatarId
  if (selectedAvatar.value) {
    try {
      const { data } = await AvatarsApi.createAvatar(selectedAvatar.value[0])
      avatarId = data.avatarId
    } catch (error) {
      toast.error('上传头像失败')
      return
    }
  }
  const submitData = {
    nickname: values.nickname,
    intro: values.intro,
    avatarId: avatarId,
  }
  try {
    await UserApi.updateUserInfo(profile.value.id, submitData)
    toast.success('更新成功')
    resetForm()
  } catch (error) {
    toast.error('更新失败')
  }
})
</script>

<style scoped lang="scss">
.profile-background-base {
  position: relative;
}
.cut-align-center {
  position: absolute;
  display: flex;
  top: 65%;
  transform: translateY(-50%);
  padding: 40px;
}
.rounded-avatar {
  border: 4px solid white;
}
.info-wrapper {
  display: flex;
  flex-direction: column;
  padding-left: 30px;
  padding-right: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.avatar-upload {
  position: relative;

  .uploader {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border: 2px dashed rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.25);
  }
}
</style>

<style lang="scss">
.uploader-inner {
  height: 100%;
}
</style>
