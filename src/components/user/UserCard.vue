<template>
  <v-container class="pb-0">
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
        <user-avatar
          :has-avatar="true"
          :avatar="getUrlByAvatarId(profile.avatarId)"
          :size="120"
          :class="'rounded-lg'"
          :rounded="0"
        />
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
                <v-dialog v-model="isEditDialogVisible" width="800">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" color="primary" variant="flat" @click="handleReset">
                      <v-icon left>mdi-cog</v-icon>
                      编辑资料
                    </v-btn>
                  </template>
                  <template #default="{ isActive }">
                    <v-card title="修改信息">
                      <form class="pt-2 pl-5 pr-5" @submit.prevent="submit">
                        <div class="d-flex flex-row justify-space-between">
                          <div class="flex-grow-1 me-5">
                            <v-list-subheader inset>昵称</v-list-subheader>
                            <v-text-field
                              ref="nicknameField"
                              v-model="selectedNickname"
                              v-bind="nicknameProps"
                            ></v-text-field>
                            <v-list-subheader inset>个人简介</v-list-subheader>
                            <v-text-field v-model="selectedIntro" :counter="60" v-bind="introProps"></v-text-field>
                          </div>
                          <div>
                            <v-list-subheader inset>头像预览</v-list-subheader>
                            <div class="position-relative" style="width: 175px; height: 175px">
                              <div
                                class="overlay rounded-lg"
                                @click="avatarInput.click()"
                                @mouseover="overlay = true"
                                @mouseleave="overlay = false"
                              >
                                <v-icon v-show="overlay" class="position-absolute" color="white">mdi-upload</v-icon>
                              </div>
                              <user-avatar
                                v-if="croppedUrl == ''"
                                :has-avatar="true"
                                :avatar="getUrlByAvatarId(profile.avatarId)"
                                :size="175"
                                :class="'rounded-lg'"
                                :rounded="0"
                              />
                              <img v-else :src="croppedUrl" style="width: 175px; height: 175px" class="rounded-lg" />
                              <input
                                ref="avatarInput"
                                accept="image/*"
                                type="file"
                                style="display: none"
                                @change="previewAvatar"
                              />
                            </div>
                          </div>
                        </div>
                      </form>
                      <v-card-actions>
                        <v-btn @click="submit"> 提交 </v-btn>
                        <v-btn @click="reset"> 重置 </v-btn>
                        <v-spacer />
                        <v-btn @click="isActive.value = false"> 关闭 </v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>
                <v-dialog v-model="isCropperDialogVisible" max-width="450">
                  <template #default="{ isActive }">
                    <v-card>
                      <cropper
                        ref="avatarCropper"
                        class="cropper"
                        :src="previewUrl"
                        :stencil-props="{
                          aspectRatio: 1,
                        }"
                      />
                      <v-card-actions>
                        <v-btn @click="cropAvatar"> 确认 </v-btn>
                        <v-spacer />
                        <v-btn @click="isActive.value = false"> 取消 </v-btn>
                      </v-card-actions>
                    </v-card>
                  </template>
                </v-dialog>
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
                :to="{ name: 'UserFollowing', params: { id: $route.params.id } }"
              >
                {{ profile.fans_count }}<br />关注
              </v-btn>
              |
              <v-btn
                :ripple="false"
                variant="plain"
                color="black"
                :to="{ name: 'UserFollower', params: { id: $route.params.id } }"
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
import { ref, onMounted, computed, inject, watch, Ref } from 'vue'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { number, z } from 'zod'
import { User } from '@/types/users'
import { UserApi } from '@/network/api/users'
import { AvatarApi } from '@/network/api/avatars'
import { useForm } from 'vee-validate'
import { vuetifyConfig } from '@/utils/form'
import { Cropper } from 'vue-advanced-cropper'
import { getUrlByAvatarId } from '@/utils/user'
import AccountService from '@/services/account'
import UserAvatar from '../common/UserAvatar.vue'
import 'vue-advanced-cropper/dist/style.css'
import { getErrorMessage } from '@/utils/errors'

const profile = inject<Ref<User>>('userData', ref({} as User))
const userRefresh = inject<Function>('userRefresh', () => {
  toast.error('userRefresh not provided.')
})

const myId = computed(() => AccountService._user.value?.id as number)
const isActivatedUser = computed(() => {
  return myId.value === profile?.value.id
})

const isFollowLoading = ref(false)
const isFollowing = ref(true)

const previewUrl = ref('')
const croppedUrl = ref('')
const croppedBlob = ref({} as Blob)
const overlay = ref(false)
const isCropperDialogVisible = ref(false)
const isEditDialogVisible = ref(false)
const avatarInput = ref(null)
const avatarCropper = ref(null)
const nicknameField = ref(null)

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
        .array(z.instanceof(File).refine((v) => v.size < 1024 * 1024, { message: '文件大小不能超过 2MB' }))
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
    croppedUrl.value = ''
  },
  { immediate: true }
)

const [selectedNickname, nicknameProps] = defineField('nickname', vuetifyConfig)
const [selectedIntro, introProps] = defineField('intro', vuetifyConfig)
// const [selectedAvatar, avatarProps] = defineField('avatar', vuetifyConfig)

const reset = () => {
  croppedUrl.value = ''
  if (avatarInput.value) avatarInput.value.value = ''
  handleReset()
}

const previewAvatar = (event: Event) => {
  const fileInput = event.target as HTMLInputElement
  const file = fileInput.files?.[0]

  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const target = e.target as FileReader
    previewUrl.value = target.result as string
    isCropperDialogVisible.value = true
  }
  reader.readAsDataURL(file)
}

const cropAvatar = () => {
  if (avatarCropper.value) {
    croppedUrl.value = avatarCropper.value.getResult().canvas.toDataURL()
    avatarCropper.value.getResult().canvas.toBlob((blob: Blob) => {
      croppedBlob.value = blob
    })
    isCropperDialogVisible.value = false
  }
}

watch(isCropperDialogVisible, () => {
  if (isCropperDialogVisible.value == false) {
    nicknameField.value?.focus()
  }
})

const uploadAvatar = async () => {
  const formData = new FormData()
  const blob = croppedBlob.value
  formData.append('avatar', blob)
  try {
    const { data: result } = await AvatarApi.uploadAvatar(formData)
    return result.avatarid
  } catch (e) {
    toast.error('头像大小不能超过1MB，请重新调整')
  }
  return -1
}

const submit = handleSubmit(async (values) => {
  const avatarId = croppedUrl.value == '' ? profile.value.avatarId : await uploadAvatar()
  if (avatarId == -1) return
  const submitData = {
    nickname: values.nickname,
    intro: values.intro,
    avatarId: avatarId,
  }
  try {
    await UserApi.updateUserInfo(profile.value.id, submitData)
  } catch (e) {
    toast.error(getErrorMessage(e))
  }
  toast.success('用户信息更新成功')
  isEditDialogVisible.value = false
  userRefresh()
})
</script>

<style scoped>
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
.overlay {
  position: absolute;
  z-index: 10;
  width: 175px;
  height: 175px;
  background-color: rgba(0, 0, 0, 0);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.3s;
}

.overlay:hover {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
