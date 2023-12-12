export default {
  path: "/",
  name: "Home",
  component: () => import("@/layouts/home/Home.vue"),
  children: [
    {
      path: "",
      name: "HomeDefault",
      component: () => import("@/views/home/Default.vue"),
    },
    {
      path: "explore",
      name: "HomeExplore",
      component: () => import("@/views/home/Explore.vue"),
    },
  ],
};
