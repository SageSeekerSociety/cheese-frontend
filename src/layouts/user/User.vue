<template>
    <v-app class="bg-page-background">
        <app-bar :links="links" />
        <v-main class="bg-grey-lighten-3">
            <user-card :userData="fakeUserData"/>
            <v-container class="d-flex row">
                <v-row>
                    <v-col class="pr-0">
                        <v-sheet rounded="lg">
                            <v-tabs v-model="selectedTab">
                                <v-tab v-for="tab in tabs" :key="tab.label" :to="tab.route" exact>
                                    {{ tab.label }}
                                </v-tab>
                            </v-tabs>
                            <router-view />
                        </v-sheet>
                    </v-col>
                    <v-col cols="3">
                        <v-sheet rounded="lg">
                            <v-list rounded="lg">
                                <v-list-item v-for="n in 5" :key="n" link :title="`List Item ${n}`"></v-list-item> 
                                <v-divider class="my-2"></v-divider>
                                <v-list-item color="grey-lighten-4" link title="Refresh"></v-list-item>
                            </v-list>
                        </v-sheet>
                    </v-col>
                </v-row>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AppBar from '@/components/common/AppBar/AppBar.vue'
import UserCard from '@/components/common/user/UserCard.vue'

const links = [
    {
        key: "Home",
        title: "首页",
        path: "/",
    },
    {
        key: "Team",
        title: "小组",
        path: "/team",
    },
    {
        key: "Explore",
        title: "发现",
        path: "/explore",
    },
]

const fakeUserData = {
    UserNickName: 'Administrator',
    UserDesc: '芝士雪豹，一言以蔽之',
    // UserAvatar: 'https://pica.zhimg.com/v2-c9f27d4b3a6e090de02f71925f8d8f50_l.jpg?source=32738c0c',
    UserAvatar: 'https://gravatar.com/userimage/132994463/e7e95572d023b832c6e91517084c6968.jpeg?size=256',
    UserHeaderImg: 'https://cdn.vuetifyjs.com/images/parallax/material.jpg',
    // UserHeaderImg: 'https://s2.loli.net/2023/04/18/QTFneJBOH68Njlg.jpg',
}

const selectedTab = ref(0);

const tabs = [
  { label: '提问', route: '/user' },
  { label: '回答', route: '/user/answer' },
];
</script>
