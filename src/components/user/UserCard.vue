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
        <user-avatar :has-avatar="hasAvatar" :avatar="profile.avatar" :size="120" :class="'rounded-lg'" :rounded="0" />
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
                <v-dialog width="800">
                  <template #activator="{ props }">
                    <v-btn v-bind="props" color="primary" variant="flat" @click="handleReset">
                      <v-icon left>mdi-cog</v-icon>
                      编辑资料
                    </v-btn>
                  </template>
                  <template #default="{ isActive }">
                    <v-card title="修改信息">
                      <form class="pt-2 pl-5 pr-5" @submit.prevent="submit">
                        <v-row>
                          <v-col cols="8">
                            <v-list-subheader inset>昵称</v-list-subheader>
                            <v-text-field v-model="selectedNickname" v-bind="nicknameProps"></v-text-field>
                            <v-list-subheader inset>个人简介</v-list-subheader>
                            <v-text-field v-model="selectedIntro" :counter="60" v-bind="introProps"></v-text-field>

                            <v-list-subheader inset>头像</v-list-subheader>
                            <v-file-input
                              v-model="selectedAvatar"
                              accept="image/*"
                              prepend-icon="mdi-plus"
                              label="选择文件"
                              chips
                              show-size
                              outlined
                              v-bind="avatarProps"
                              @change="handleFileChange"
                            />
                          </v-col>
                          <v-col cols="4">
                            <v-list-subheader inset>预览</v-list-subheader>
                            <v-img
                              :src="previewUrl"
                              aspect-ratio="1"
                              class="rounded-lg"
                              rounded="0"
                              size="180"
                              color="grey-darken-1"
                            />
                          </v-col>
                        </v-row>
                      </form>
                      <v-card-actions>
                        <v-btn @click="submit"> 提交 </v-btn>
                        <v-btn @click="handleReset"> 重置 </v-btn>
                        <v-spacer />
                        <v-btn @click="isActive.value = false"> 关闭 </v-btn>
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
                {{ profile.fans_count }} <br />关注
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
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { User } from '@/types/users'
import { UserApi } from '@/network/api/users'
import { ImageApi } from '@/network/api/image'
import { useForm } from 'vee-validate'
import { vuetifyConfig } from '@/utils/form'
import AccountService from '@/services/account'
import UserAvatar from '../common/UserAvatar.vue'

const profile = inject<Ref<User>>('userData', ref({} as User))

const hasAvatar = computed(() => {
  return !!profile?.value.avatar && profile?.value.avatar != 'default.jpg' && profile?.value.avatar != 'deafult.jpg'
})

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
const uploadAvatar = () => {
  if (!selectedAvatar.value) return
  if (selectedAvatar.value.length === 0) return
  const file = selectedAvatar.value[0]
  const formData = new FormData()
  formData.append('file', file)
  const result = ImageApi.upload(formData)
  return result
}
const submit = handleSubmit((values) => {
  // uploadAvatar()
  const submitData = {
    nickname: values.nickname,
    intro: values.intro,
    avatar: 'default.jpg',
  }
  alert(JSON.stringify(submitData, null, 2))
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
</style>
