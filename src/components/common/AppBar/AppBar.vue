<template>
    <v-app-bar app scroll-behavior="hide" flat>
        <v-container class="mx-auto d-flex align-center justify-center">
            <span class="text-h5 font-weight-bold me-4">🧀知是</span>
            <v-btn v-for="link in props.links" :key="link.key" :text="link.title" :to="link.path" variant="text"></v-btn>
            <v-spacer></v-spacer>
            <v-responsive max-width="240" class="me-4">
                <v-text-field density="compact" flat hide-details label="搜索" prepend-inner-icon="mdi-magnify" rounded="lg"
                    single-line variant="solo-filled"></v-text-field>
            </v-responsive>
            <v-btn icon class="me-4">
                <v-icon>mdi-bell</v-icon>
            </v-btn>
            <v-avatar color="grey-darken-1" size="32" />
        </v-container>
    </v-app-bar>
</template>

<script setup lang="ts">
import { AppBarProps } from './types';

const props = withDefaults(defineProps<AppBarProps>(), {
    links: () => []
})
</script>