<template>
  <v-card title="个人资料" rounded="lg">
    <template #text>
      <form class="pt-2 pl-5 pr-5" @submit.prevent="submit">
        <v-row>
          <v-col cols="4">
            <v-list-subheader inset>头像</v-list-subheader>
            <div class="avatar-upload">
              <v-img
                :src="previewUrl || getAvatarUrl(profile.avatarId)"
                aspect-ratio="1"
                class="rounded-lg avatar"
                rounded="0"
                size="180"
                color="grey-darken-1"
                cover
              />

              <file-select
                v-model="selectedAvatar"
                accept="image/*"
                :max="1"
                class="uploader"
                content-class="uploader-inner"
                @change="handleFileChange"
              >
                <div
                  class="rounded-lg d-flex flex-column align-center justify-center gap-4 pa-4 text-white uploader-inner"
                >
                  <v-icon size="32">mdi-camera</v-icon>
                  <div class="text-body-1 text-white">上传头像</div>
                </div>
              </file-select>
            </div>
          </v-col>
          <v-col cols="8">
            <v-list-subheader inset>昵称</v-list-subheader>
            <v-text-field v-model="selectedNickname" v-bind="nicknameProps"></v-text-field>
            <v-list-subheader inset>个人简介</v-list-subheader>
            <v-text-field v-model="selectedIntro" :counter="60" v-bind="introProps"></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="d-flex justify-end gap-4">
            <v-btn @click="handleReset">重置</v-btn>
            <v-btn color="primary" type="submit">保存</v-btn>
          </v-col>
        </v-row>
      </form>
    </template>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { toast } from 'vuetify-sonner'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { vuetifyConfig } from '@/utils/form'
import { getAvatarUrl } from '@/utils/materials'

import FileSelect from '@/components/common/FileSelect.vue'
import { AvatarsApi } from '@/network/api/avatars'
import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'

const profile = computed(() => AccountService._user.value!)

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
.avatar-upload {
  position: relative;

  .uploader {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border: 2px dashed rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.uploader-inner {
  height: 100%;
}
</style>
