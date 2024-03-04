<template>
  <app-bar :links="links" />
  <v-main v-if="loaded" class="bg-grey-lighten-3">
    <user-card :key="userData.id" :profile="userData" />
    <v-container class="d-flex row">
      <v-row>
        <v-col class="pr-0">
          <v-sheet rounded="lg">
            <router-view />
          </v-sheet>
        </v-col>
        <v-col cols="3">
          <v-sheet class="pt-3 pb-3 rounded-lg">
            <v-tabs v-model="selectedTab" direction="vertical">
              <v-tab v-for="tab in tabs" :key="tab.label" :to="tab.route" exact>
                {{ tab.label }}
              </v-tab>
            </v-tabs>

            <div v-if="isActiveUser()">
              <v-divider class="my-2" />
              <v-dialog width="800">
                <template #activator="{ props }">
                  <v-btn v-bind="props" color="primary" variant="text" block @click="handleReset">
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
                            v-if="(selectedAvatar?.values?.length ?? 0) > 0"
                            :src="previewUrl"
                            aspect-ratio="1"
                            class="rounded-lg"
                            rounded="0"
                            size="180"
                          />
                          <v-img
                            v-else
                            :src="userData.avatar"
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
          </v-sheet>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useRoute } from 'vue-router'
import { UserApi } from '@/network/api/users'
import { ImageApi } from '@/network/api/image'
import { User } from '@/types/users'
import { useForm } from 'vee-validate'
import AccountService from '@/services/account'
import AppBar from '@/components/common/AppBar/AppBar.vue'
import UserCard from '@/components/user/UserCard.vue'
import { vuetifyConfig } from '@/utils/form'

const selectedTab = ref(0)
const route = useRoute()
const userID = computed(() => parseInt(route.params.id as string))
const userData = ref({} as User)
const loaded = ref(false)

const isActiveUser = computed(() => {
  return () => userID.value === AccountService._user.value?.id
})

watch(
  // 切换用户时刷新
  () => route.params.id,
  () => {
    window.location.reload()
  }
)

const { handleSubmit, defineField, handleReset, resetForm } = useForm({
  validationSchema: toTypedSchema(
    z.object({
      nickname: z.string().min(4).max(16),
      intro: z.string().max(60),
      avatar: z
        .array(z.instanceof(File).refine((v) => v.size < 2 * 1024 * 1024, { message: '文件大小不能超过 2MB' }))
        .nonempty(),
    })
  ),
})

const fetchData = async () => {
  return await UserApi.getUserInfo(userID.value)
}

onMounted(async () => {
  const {
    data: { user },
  } = await fetchData()
  userData.value = user
  loaded.value = true
  resetForm({
    values: {
      nickname: user.nickname,
      intro: user.intro,
    },
  })
})

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

const links = [
  {
    key: 'Home',
    title: '首页',
    path: '/',
  },
  {
    key: 'Question',
    title: '问答',
    path: '/questions',
  },
  {
    key: 'Group',
    title: '圈子',
    path: '/groups',
  },
]

const tabs = [
  {
    label: '提问',
    route: {
      name: 'UserQuestion',
      params: { id: route.params.id },
    },
  },
  {
    label: '回答',
    route: {
      name: 'UserAnswer',
      params: { id: route.params.id },
    },
  },
  {
    label: '关注',
    route: {
      name: 'UserFollowing',
      params: { id: route.params.id },
    },
  },
  {
    label: '粉丝',
    route: {
      name: 'UserFollower',
      params: { id: route.params.id },
    },
  },
]
</script>
@/network/api/users/user
