<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet min-height="70vh" rounded="lg" class="py-1 px-1">
          <v-card v-for="item in fakeGroups" :key="item.id" flat>
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
                  {{ item.owner.user.nickname }}
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
            <v-list-item color="grey-lighten-4" link title="最活跃月榜" @click="fetchAllGroupsData"></v-list-item>
            <v-list-item color="grey-lighten-4" link title="新建的圈子"></v-list-item>
            <v-list-item color="grey-lighten-4" link title="猜你喜欢"></v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item color="grey-lighten-4" link title="创建一个小组" @click="createGroup"></v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { GroupApi } from '@/network/api/group'
import { Group } from '@/types'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// const groupList = ref<Group[]>([])
const fakeGroups = [
  {
    id: 123456789,
    name: 'Group A',
    intro: "This is Group A's introduction",
    owner: {
      user: {
        id: 987654321,
        username: 'owner1',
        nickname: 'Owner One',
        avatar: 'https://example.com/avatar1.png',
        intro: 'This user has not set an introduction yet.',
        follow_count: 100,
        fans_count: 50,
        question_count: 20,
        answer_count: 30,
        is_follow: true,
      },
      membership: {
        created_at: 1649251200,
        from: 'application',
        joined_at: 1649251300,
        is_pending: false,
      },
      role: 'owner',
      contributions: {
        score: 1000,
        question_count: 50,
        answer_count: 80,
        check_in_count: 10,
      },
    },
    created_at: 1649251400,
    updated_at: 1649251500,
    member_count: 100,
    question_count: 200,
    answer_count: 300,
    is_member: true,
    is_public: true,
    topics: [
      {
        id: 1,
        name: 'Topic A',
      },
      {
        id: 2,
        name: 'Topic B',
      },
    ],
    role: 'admin',
  },
  {
    id: 987654321,
    name: 'Group B',
    intro: "This is Group B's introduction",
    owner: {
      user: {
        id: 123456789,
        username: 'owner2',
        nickname: 'Owner Two',
        avatar: 'https://example.com/avatar2.png',
        intro: 'This user has not set an introduction yet.',
        follow_count: 80,
        fans_count: 40,
        question_count: 10,
        answer_count: 20,
        is_follow: false,
      },
      membership: {
        created_at: 1649251600,
        from: 'application',
        joined_at: 1649251700,
        is_pending: false,
      },
      role: 'member',
      contributions: {
        score: 500,
        question_count: 30,
        answer_count: 40,
        check_in_count: 5,
      },
    },
    created_at: 1649251800,
    updated_at: 1649251900,
    member_count: 50,
    question_count: 100,
    answer_count: 150,
    is_member: true,
    is_public: false,
    topics: [
      {
        id: 3,
        name: 'Topic C',
      },
      {
        id: 4,
        name: 'Topic D',
      },
    ],
    role: 'owner',
  },
]

const router = useRouter()

// onMounted(() => {
//   fetchAllGroupsData().then(({ data: { groups } }) => {
//     groupList.value = groups
//   })
// })

function fetchAllGroupsData() {
  const result = GroupApi.getAllGroupList({
    pageStart: 0,
    pageSize: 10,
  })
  return result
}
function createGroup() {
  console.log('create group')
  router.push({ name: 'GroupCreate' }) // Replace '/create' with the actual path of your create page
}
// const fakeGroups = [
//   {
//     id: 520,
//     is_member: 1,
//     name: '音乐入门学习组',
//     owner:''
//     description: '散々雨に降られたって 笑っていられる',
//   },
//   {
//     id: 1,
//     is_member: 0,
//     name: '编程入门学习组',
//     leader: '风有盒',
//     description:
//       '你说得对，但是，原神的世界仿佛是风有盒。”这游戏的世界就像是被装进一个盒子里的自由元素力量。它展现了这样一个神奇的幻想世界，让玩家可以探索、发现、并且体验元素之力的无限可能性。在这个风有盒的世界里，你扮演的“旅行者”角色不断追寻真相，与性格迥异的同伴并肩作战，用他们独特的能力击败强敌，寻回失散的亲人。这仿佛是风在盒子里舞动，虽然有限，但也展现出无穷的可能性。而你所描述的游戏中的收入和成就，是游戏世界中的一种成就感，就像在这个盒子里获取了某种珍贵资源一样。尽管在游戏里取得了极高的成就，但也别忘了这个风有盒的世界仅是游戏的一部分。就像游戏里的战斗体验提升了全新的水平一样，这个风有盒的世界也让我们感受到了游戏设计的精妙之处。它推动着玩家去探索、挑战、并且超越自我。这样的体验或许就如同风在盒子里呼啸，虽受限却永远不停止。所以，或许风有盒并非束缚，而是一种引导，提醒我们在有限的空间里，依然能够创造出无限的可能性。',
//   },
//   {
//     id: 2,
//     is_member: 1,
//     title: '英语口语提高小组',
//     leader: '李华',
//     description:
//       '我们专注于提高英语口语能力，无论你是初学者还是已经具备一定基础的同学，都可以加入我们。每周会举办口语练习和讨论。',
//   },
//   {
//     id: 3,
//     is_member: 0,
//     title: '机器学习研究小组',
//     leader: '王子',
//     description:
//       '我们是一个研究机器学习领域的小组，欢迎对人工智能和机器学习有兴趣的同学加入。一起探讨最新的研究成果和技术。',
//   },
//   {
//     id: 4,
//     is_member: 1,
//     title: '健康生活指导小组',
//     leader: '刘媛',
//     description:
//       '我们致力于推广健康生活方式，包括饮食、运动和心理健康。欢迎关心健康的同学一起加入我们，分享健康知识和经验。',
//   },
// ]
//
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
