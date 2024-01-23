export default {
    path: '/account',
    name: 'Account',
    component: () => import('@/layouts/account/Account.vue'),
    children: [
        {
            path: 'signin',
            name: 'SignIn',
            component: () => import('@/views/account/SignIn.vue'),
        },
        {
            path: 'signup',
            name: 'SignUpStart',
            component: () => import('@/views/account/signup/Start.vue'),
        },
        {
            path: 'signup/verify-email',
            name: 'SignUpVerifyEmail',
            component: () => import('@/views/account/signup/VerifyEmail.vue'),
        },
    ],
}