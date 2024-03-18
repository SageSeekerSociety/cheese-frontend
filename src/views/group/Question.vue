<template>
  <v-skeleton-loader type="paragraph" :loading="!loaded">
    <div class="w-100">
      <v-card v-for="item in fakedata" :key="item.id" flat width="100%">
        <v-card-title
          ><span class="text-h6 font-weight-bold">{{ item.title }}</span></v-card-title
        >
        <v-card-text>
          <p class="text-body-1">{{ item.author.nickname }}:{{ item.content }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" variant="tonal">
            <v-icon size="24" class="me-2">mdi-menu-up</v-icon>
            {{ item.attitudes.difference }}
          </v-btn>
          <v-btn color="primary" variant="tonal" min-width="32px">
            <v-icon size="24">mdi-menu-down</v-icon>
          </v-btn>
          <v-btn variant="plain" color="on-background">
            <v-icon size="18" class="me-2">mdi-comment-outline</v-icon>
            评论
          </v-btn>
          <v-btn variant="plain" color="on-background">
            <v-icon size="18" class="me-2">mdi-star-outline</v-icon>
            收藏
          </v-btn>
          <v-btn variant="plain" color="on-background" min-width="32px">
            <v-icon size="18">mdi-dots-horizontal</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-skeleton-loader>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { GroupApi } from '@/network/api/group'
import { useRoute } from 'vue-router'
import { Question } from '@/types'

const groupQuestionList = ref<Question[]>([])
const route = useRoute()
const groupId = computed(() => Number(route.params.groupId))
const loaded = ref(false)

function fetchGroupQuestionList() {
  const result = GroupApi.getGroupQuestionList(groupId.value, {
    pageStart: 0,
    pageSize: 10,
  })
  return result
}

// onMounted(() => {
//   fetchGroupQuestionList().then(({ data: { questions } }) => {
//     groupQuestionList.value = questions
loaded.value = true

//     // console.log('***')
//     // console.log(groupId)
//     // console.log('***')

//     console.log(groupQuestionList.value)
//     console.log('***')
//     // console.log(groupQuestionList.value.data[0].id)
//   })
// })
const fakedata = [
  {
    id: 123456789,
    title: 'Question 1',
    content: 'This is the content of Question 1.',
    author: {
      id: 987654321,
      username: 'author1',
      nickname: 'Author One',
      avatar: 'https://example.com/avatar1.png',
      intro: 'This user has not set an introduction yet.',
      follow_count: 100,
      fans_count: 50,
      question_count: 20,
      answer_count: 30,
      is_follow: true,
    },
    type: 1,
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
    created_at: 1649251200,
    updated_at: 1649251300,
    is_follow: true,
    is_answered: false,
    answer_count: 0,
    comment_count: 0,
    follow_count: 10,
    view_count: 50,
    is_group: false,
    has_bounty: false,
    is_solved: false,
    attitudes: {
      positive_count: 100,
      negative_count: 20,
      difference: 80,
      user_attitude: 'NEGATIVE',
    },
    my_answer_id: null,
    bounty: 0,
    accepted_answer: null,
    group: null,
  },
  {
    id: 987654321,
    title: 'Question 2',
    content: 'This is the content of Question 2.',
    author: {
      id: 123456789,
      username: 'author2',
      nickname: 'Author Two',
      avatar: 'https://example.com/avatar2.png',
      intro: 'This user has not set an introduction yet.',
      follow_count: 80,
      fans_count: 40,
      question_count: 10,
      answer_count: 20,
      is_follow: false,
    },
    type: 2,
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
    created_at: 1649251400,
    updated_at: 1649251500,
    is_follow: false,
    is_answered: true,
    answer_count: 1,
    comment_count: 5,
    follow_count: 5,
    view_count: 30,
    is_group: true,
    has_bounty: true,
    is_solved: true,
    attitudes: {
      positive_count: 50,
      negative_count: 10,
      difference: 40,
      user_attitude: 'POSITIVE',
    },
    my_answer_id: 987654321,
    bounty: 100,
    accepted_answer: {
      id: 987654321,
      question_id: 987654321,
      content: 'This is the accepted answer content.',
      author: {
        id: 123456789,
        username: 'author2',
        nickname: 'Author Two',
        avatar: 'https://example.com/avatar2.png',
        intro: 'This user has not set an introduction yet.',
        follow_count: 80,
        fans_count: 40,
        question_count: 10,
        answer_count: 20,
        is_follow: false,
      },
      created_at: 1649251600,
      updated_at: 1649251700,
      attitudes: {
        positive_count: 20,
        negative_count: 5,
        difference: 15,
        user_attitude: 'NEGATIVE',
      },
      is_favorite: true,
      comment_count: 3,
      favorite_count: 10,
      view_count: 20,
      is_group: true,
      group: {
        id: 987654321,
        name: 'Group A',
        intro: "This is Group A's introduction",
        owner: {
          user: {
            id: 123456789,
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
            created_at: 1649251800,
            from: 'application',
            joined_at: 1649251900,
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
        created_at: 1649252000,
        updated_at: 1649252100,
        member_count: 100,
        question_count: 200,
        answer_count: 300,
        is_member: true,
        is_public: true,
        topics: [
          {
            id: 5,
            name: 'Topic E',
          },
          {
            id: 6,
            name: 'Topic F',
          },
        ],
        role: 'admin',
      },
    },
    group: {
      id: 987654321,
      name: 'Group B',
      intro: "This is Group B's introduction",
      owner: {
        user: {
          id: 987654321,
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
          created_at: 1649252200,
          from: 'application',
          joined_at: 1649252300,
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
      created_at: 1649252400,
      updated_at: 1649252500,
      member_count: 50,
      question_count: 100,
      answer_count: 150,
      is_member: true,
      is_public: false,
      topics: [
        {
          id: 7,
          name: 'Topic G',
        },
        {
          id: 8,
          name: 'Topic H',
        },
      ],
      role: 'owner',
    },
  },
]
</script>
