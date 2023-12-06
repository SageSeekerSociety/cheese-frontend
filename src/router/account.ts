export default {
    path: '/account',
    name: 'Account',
    component: () => import('@/layouts/account/Account.vue'),
    children: [
        {
            path: 'signin',
            name: 'SignIn',
            component: () => import('@/views/account/Login.vue'),
        },
        {
            path: 'signup',
            name: 'SignUp',
            component: () => import('@/views/account/Register.vue'),
        },
    ],
}