<template>
  <v-container>
    <v-row>
      <v-col>
        <v-sheet min-height="70vh" rounded="lg" class="py-1 px-1">
          <v-card flat v-for="item in fakeGroups" :key="item.title">
            <router-link :to="`/group/${item.id}`" class="custom-link">
              <v-card-title>
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <span class="text-h6 font-weight-bold">{{
                      item.title
                    }}</span>
                  </div>
                  <v-btn :variant="item.isFollowed ? 'tonal' : 'flat'" color="primary">
                    {{ item.isFollowed ? "已加入" : "未加入" }}
                  </v-btn>
                </div>
              </v-card-title>

              <v-card-text>
                <p style="font-size: 16px" class="py-2">
                  <v-icon size="24" class="me-2">mdi-account</v-icon>
                  {{ item.leader }}
                </p>
                <p style="font-size: 16px" class="py-2">
                  <v-icon size="24" class="me-2">mdi-text</v-icon>
                  {{ item.description }}
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
            <v-list-item
              color="grey-lighten-4"
              link
              title="全部小组"
            ></v-list-item>
            <v-list-item
              color="grey-lighten-4"
              link
              title="我参与的小组"
            ></v-list-item>
            <v-list-item
              color="grey-lighten-4"
              link
              title="我管理的小组"
            ></v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item
              color="grey-lighten-4"
              link
              title="Refresh"
            ></v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const fakeGroups = [
  {
    id: 520,
    isFollowed: 1,
    title: "音乐入门学习组",
    leader: "Bocci",
    description: "散々雨に降られたって 笑っていられる",
  },
  {
    id: 1,
    isFollowed: 0,
    title: "编程入门学习组",
    leader: "风有盒",
    description:
      "你说得对，但是，原神的世界仿佛是风有盒。”这游戏的世界就像是被装进一个盒子里的自由元素力量。它展现了这样一个神奇的幻想世界，让玩家可以探索、发现、并且体验元素之力的无限可能性。在这个风有盒的世界里，你扮演的“旅行者”角色不断追寻真相，与性格迥异的同伴并肩作战，用他们独特的能力击败强敌，寻回失散的亲人。这仿佛是风在盒子里舞动，虽然有限，但也展现出无穷的可能性。而你所描述的游戏中的收入和成就，是游戏世界中的一种成就感，就像在这个盒子里获取了某种珍贵资源一样。尽管在游戏里取得了极高的成就，但也别忘了这个风有盒的世界仅是游戏的一部分。就像游戏里的战斗体验提升了全新的水平一样，这个风有盒的世界也让我们感受到了游戏设计的精妙之处。它推动着玩家去探索、挑战、并且超越自我。这样的体验或许就如同风在盒子里呼啸，虽受限却永远不停止。所以，或许风有盒并非束缚，而是一种引导，提醒我们在有限的空间里，依然能够创造出无限的可能性。",
  },
  {
    id: 2,
    isFollowed: 1,
    title: "英语口语提高小组",
    leader: "李华",
    description:
      "我们专注于提高英语口语能力，无论你是初学者还是已经具备一定基础的同学，都可以加入我们。每周会举办口语练习和讨论。",
  },
  {
    id: 3,
    isFollowed: 0,
    title: "机器学习研究小组",
    leader: "王子",
    description:
      "我们是一个研究机器学习领域的小组，欢迎对人工智能和机器学习有兴趣的同学加入。一起探讨最新的研究成果和技术。",
  },
  {
    id: 4,
    isFollowed: 1,
    title: "健康生活指导小组",
    leader: "刘媛",
    description:
      "我们致力于推广健康生活方式，包括饮食、运动和心理健康。欢迎关心健康的同学一起加入我们，分享健康知识和经验。",
  },
];
</script>
<style>
.custom-link {
  color: inherit; /* 继承父元素的颜色 */
  text-decoration: none; /*
去除默认的下划线样式 */
}
.followed {
  /* width: 60px;
  height: 30px;
  background-color: #fb7299;
  color: white;
  font-size: 16px;
  display: grid;
  place-items: center;
  border-radius: 5px; */
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
