<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet min-height="70vh" rounded="lg" class="py-1 px-1">
          <v-card v-for="item in groupList.groups" :key="item.id" flat>
            <router-link :to="{ name: 'GroupDetail', params: { groupId: item.id } }" class="custom-link">
              <v-card-title>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <span class="text-h6 font-weight-bold">{{ item.name }}</span>
                  </div>
                  <v-btn :variant="item.is_member ? 'tonal' : 'flat'" color="primary">
                    {{ item.is_member ? '已加入' : '未加入' }}
                  </v-btn>
                </div>
              </v-card-title>

              <v-card-text>
                <p style="font-size: 16px" class="py-2">
                  <v-icon size="24" class="me-2">mdi-account</v-icon>
                  {{ item.owner.nickname }}
                </p>
                <p style="font-size: 16px" class="py-2">
                  <v-icon size="24" class="me-2">mdi-text</v-icon>
                  {{ item.intro }}
                </p>
              </v-card-text>
            </router-link>
            <v-divider></v-divider>
          </v-card>
        </v-sheet>
      </v-col>

      <v-col cols="3">
        <v-sheet rounded="lg">
          <v-list rounded="lg">
            <!-- <v-btn> Button</v-btn> -->
            <v-list-item color="grey-lighten-4" link title="全部小组" @click="fetchAllGroupsData"></v-list-item>
            <v-list-item color="grey-lighten-4" link title="我参与的小组"></v-list-item>
            <v-list-item color="grey-lighten-4" link title="我管理的小组"></v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item color="grey-lighten-4" link title="创建一个小组" @click="createGroup"></v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

import { GroupApi } from '@/network/api/group'

import { GroupList } from '@/types/grouplist'

const groupList = ref<GroupList>({} as GroupList)
const router = useRouter()

onMounted(() => {
  fetchAllGroupsData().then((result) => {
    groupList.value = result.data
  })
})

function fetchAllGroupsData() {
  const result = GroupApi.getAllGroupList({
    pageStart: 0,
    pageSize: 10,
  })
  console.log(1)
  return result
}

function createGroup() {
  console.log('create group')
  router.push({ name: 'GroupCreate' }) // Replace '/create' with the actual path of your create page
}
</script>

<style>
.custom-link {
  color: inherit; /* 继承父元素的颜色 */
  text-decoration: none; /*
去除默认的下划线样式 */
}
.followed {
  background: rgba(0, 0, 0, 0.45);
  box-shadow: 0 0 0 2px hsla(0, 0%, 100%, 0.3);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  float: left;
  text-align: center;
  margin: 0 20px 17px 0;
  width: 76px;
  line-height: 30px;
}
.unfollowed {
  width: 60px;
  height: 30px;
  background-color: grey;
  color: white;
  font-size: 16px;
  display: grid;
  place-items: center; /* 水平和垂直居中 */
  border-radius: 5px;
}

.h-f-btn {
  background: rgba(0, 0, 0, 0.45);
  box-shadow: 0 0 0 2px hsla(0, 0%, 100%, 0.3);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  display: inline-block;
  font-size: 14px;
  float: left;
  text-align: center;
  margin: 0 20px 17px 0;
  width: 76px;
  line-height: 30px;
}
.h-follow {
  background: #f25d8e;
  box-shadow: 0 0 0 2px #fff;
  color: #fff;
}
</style>
@/network/api/group/group
