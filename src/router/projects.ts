import type { RouteRecordRaw } from 'vue-router'

import ProjectHeader from '@/components/projects/header/ProjectHeader.vue'
import SubprojectHeader from '@/components/projects/header/SubprojectHeader.vue'
import ProjectNavigation from '@/components/projects/navigation/ProjectNavigation.vue'
import SubprojectNavigation from '@/components/projects/navigation/SubprojectNavigation.vue'

export default {
  path: '/projects',
  component: () => import('@/layouts/projects/Projects.vue'),
  meta: {
    title: '项目',
  },
  children: [
    {
      path: ':projectId',
      name: 'ProjectDetail',
      component: () => import('@/views/projects/Detail.vue'),
      props: true,
      children: [
        {
          path: '',
          name: 'ProjectOverview',
          components: {
            header: ProjectHeader,
            navigation: ProjectNavigation,
            content: () => import('@/views/projects/views/ProjectOverviewView.vue'),
          },
          meta: {
            title: '项目概览',
          },
        },
        {
          path: 'members',
          name: 'ProjectMembers',
          components: {
            header: ProjectHeader,
            navigation: ProjectNavigation,
            content: () => import('@/views/projects/views/ProjectMembersView.vue'),
          },
          meta: {
            title: '项目成员',
          },
        },
        {
          path: 'discussions',
          name: 'ProjectDiscussions',
          components: {
            header: ProjectHeader,
            navigation: ProjectNavigation,
            content: () => import('@/views/projects/views/ProjectDiscussionsView.vue'),
          },
          meta: {
            title: '项目讨论',
          },
        },
        {
          path: 'knowledge',
          name: 'ProjectKnowledge',
          components: {
            header: ProjectHeader,
            navigation: ProjectNavigation,
            content: () => import('@/views/projects/views/ProjectKnowledgeView.vue'),
          },
          meta: {
            title: '项目知识库',
          },
        },
        {
          path: 'subprojects',
          name: 'ProjectSubprojects',
          components: {
            header: ProjectHeader,
            navigation: ProjectNavigation,
            content: () => import('@/views/projects/views/ProjectSubprojectsView.vue'),
          },
          meta: {
            title: '子项目列表',
          },
        },
        {
          path: 'subprojects/:subprojectId',
          name: 'SubprojectDetail',
          components: {
            header: SubprojectHeader,
            navigation: SubprojectNavigation,
            content: () => import('@/views/projects/views/SubprojectDetailView.vue'),
          },
          props: {
            header: true,
            navigation: true,
            content: true,
          },
          meta: {
            title: '子项目详情',
          },
        },
      ],
    },
  ],
} as RouteRecordRaw
