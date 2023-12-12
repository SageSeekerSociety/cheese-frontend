export default {
  path: "/team",
  name: "Team",
  component: () => import("@/layouts/team/Team.vue"),
  children: [
    {
      path: "",
      name: "TeamDefault",
      component: () => import("@/views/team/Default.vue"),
    },
    {
      path: ":teamId", // 定义动态路由参数 teamId
      name: "TeamId",
      component: () => import("@/views/team/Base.vue"), // 对应的视图组件
      children: [
        {
          path: "",
          name: "TeamIdDefault",
          component: () => import("@/views/team/Question.vue"), // 对应的视图组件
        },
        // {
        //   path: "question", // 定义动态路由参数 teamId
        //   name: "Question",
        //   component: () => import("@/views/team/Question.vue"), // 对应的视图组件
        // },

        {
          path: "target", // 定义动态路由参数 teamId
          name: "Target",
          component: () => import("@/views/team/Target.vue"), // 对应的视图组件
        },
      ],
    },
  ],
};
