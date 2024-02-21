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
                  <v-btn v-bind="props" color="primary" variant="text" block @click="resetDefault">
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
                          <v-text-field
                            v-model="selectedNickname.value.value"
                            :error-messages="selectedNickname.errorMessage.value"
                          <v-list-subheader inset>个人简介</v-list-subheader>
                          <v-text-field
                            v-model="selectedIntro.value.value"
                            :counter="60"
                            :error-messages="selectedIntro.errorMessage.value"
                          ></v-text-field>

                          <v-list-subheader inset>头像</v-list-subheader>
                          <v-file-input
                            v-model="selectedAvatar.value.value"
                            accept="image/*"
                            prepend-icon="mdi-plus"
                            label="选择文件"
                            chips
                            show-size
                            outlined
                            :rules="avatarRules"
                            @change="handleFileChange"
                          />
                        </v-col>
                        <v-col cols="4">
                          <v-list-subheader inset>预览</v-list-subheader>
                          <v-img
                            v-if="selectedAvatar.value.value.length > 0"
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
                      <v-btn @click="resetDefault"> 重置 </v-btn>
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
import { ref, onMounted, watch, computed, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { UserApi } from '@/network/api/user'
import { ImageApi } from '@/network/api/image'
import { User } from '@/types/users'
import { useField, useForm } from 'vee-validate'
import AccountService from '@/services/account'
import AppBar from '@/components/common/AppBar/AppBar.vue'
import UserCard from '@/components/user/UserCard.vue'

const selectedTab = ref(0)
const route = useRoute()
const userID = computed(() => parseInt(route.params.id[0]))
const userData = ref({} as User)
const loaded = ref(false)

const isActiveUser = computed(() => {
  return () => parseInt(route.params.id[0]) === AccountService._user.value?.id
})

onMounted(async () => {
  const { data } = await fetchData()
  userData.value = data
  loaded.value = true
})

watch(
  // 切换用户时刷新
  () => route.params.id,
  () => {
    window.location.reload()
  }
)

const fetchData = async () => {
  return await UserApi.getUserInfo(userID.value)
}

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    nickname(value: string) {
      if (value?.length > 16) return '昵称不能超过16个字符。'
      if (value?.length < 4) return '昵称不能少于4个字符。'
      return true
    },
    intro(value: string) {
      if (value?.length > 60) return '个人简介不能超过60个字符。'
      if (value?.length < 1) return '个人简介不能为空。'
      return true
    },
    avatar(value: File[]) {
      if (typeof value !== 'undefined' && value.length > 0 && value[0].size > 2 * 1024 * 1024)
        return '文件大小不能超过2MB。'
      return true
    },
  },
})

const avatarRules = [
  (value: File[]) => {
    if (typeof value !== 'undefined' && value.length > 0 && value[0].size > 2 * 1024 * 1024)
      return '文件大小不能超过2MB。'
    return true
  },
]
const selectedNickname = useField('nickname')
const selectedIntro = useField('intro')
const selectedAvatar = useField('avatar')
const previewUrl = ref('')
const resetDefault = () => {
  previewUrl.value = ''
  selectedNickname.value.value = userData.value.nickname
  selectedIntro.value.value = userData.value.intro
  selectedAvatar.value.value = []
}
const handleFileChange = () => {
  previewUrl.value = ''
  if (selectedAvatar.value.value.length > 0) {
    readAvatar()
  }
}
const readAvatar = () => {
  const reader = new FileReader()
  reader.readAsDataURL(selectedAvatar.value.value[0])
  reader.onload = (event) => {
    previewUrl.value = event.target?.result as string
  }
}
const uploadAvatar = () => {
  const result = ImageApi.upload(selectedAvatar.value.value[0])
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
