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
                            v-model="nickname.value.value"
                            :counter="20"
                            :error-messages="nickname.errorMessage.value"
                          ></v-text-field>

                          <v-list-subheader inset>个人简介</v-list-subheader>
                          <v-text-field
                            v-model="intro.value.value"
                            :counter="300"
                            :error-messages="intro.errorMessage.value"
                          ></v-text-field>

                          <v-list-subheader inset>头像</v-list-subheader>
                          <v-file-input
                            v-model="selectedFile"
                            accept="image/*"
                            prepend-icon="mdi-plus"
                            label="选择文件"
                            chips
                            show-size
                            show-size-hint
                            outlined
                            @change="handleFileChange"
                          />
                        </v-col>
                        <v-col cols="4">
                          <v-list-subheader inset>预览</v-list-subheader>
                          <v-img
                            v-if="selectedFile.length > 0"
                            :src="previewUrl"
                            aspect-ratio="1"
                            class="rounded-lg"
                            rounded="0"
                            size="180"
                          />
                          <v-img
                            v-else
                            :src="userData.avatar"
                            color="grey-darken-1"
                            aspect-ratio="1"
                            class="rounded-lg"
                            rounded="0"
                            size="180"
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

onMounted(() => {
  fetchData().then((result) => {
    userData.value = result.data as User
    loaded.value = true
    // console.log(AccountService._loggedIn.value);
  })
})
watch(
  // 切换用户时刷新
  () => route.params.id,
  () => {
    window.location.reload()
  }
)
function fetchData() {
  const result = UserApi.getUserInfo(userID.value)
  return result
}

const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    nickname(value: string) {
      if (value?.length >= 4 && value.length <= 20) return true
      return '昵称的长度需要在4-20个字符之间。'
    },
    intro(value: string) {
      if (value?.length <= 300) return true
      return '个人简介不能超过300个字符。'
    },
    avatar(value: string) {
      return true
    },
  },
})
const nickname = useField('nickname')
const intro = useField('intro')
const submit = handleSubmit((values) => {
  uploadAvatar()
  values.avatar = 'default.jpg'
  alert(JSON.stringify(values, null, 2))
})
const selectedFile = ref([])
const previewUrl = ref('')
const resetDefault = () => {
  nickname.value.value = userData.value.nickname
  intro.value.value = userData.value.intro
  selectedFile.value = []
}
const handleFileChange = () => {
  if (selectedFile.value) {
    readAvatar()
  } else {
    previewUrl.value = ''
  }
}
const readAvatar = () => {
  const reader = new FileReader()
  reader.onload = (event) => {
    previewUrl.value = event.target?.result as string
  }
  reader.readAsDataURL(selectedFile.value[0] as Blob)
}
const uploadAvatar = () => {
  const formData = new FormData()
  formData.append('file', selectedFile.value[0])
  const result = ImageApi.upload(formData)
  return result
}

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
