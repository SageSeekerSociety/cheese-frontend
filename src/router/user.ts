export default {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/user/User.vue'),
    children: [
    ],
}