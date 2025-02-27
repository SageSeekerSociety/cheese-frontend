<template>
  <v-card :title="t('comments.boxTitle')" class="rounded-lg" flat>
    <div v-for="comment in comments" :key="comment.id">
      <VSlideXReverseTransition>
        <v-sheet v-if="typeof comment.tag === 'undefined'" class="mb-3 mx-4 pa-3" rounded="lg" border>
          <div class="d-flex flex-row">
            <user-avatar :avatar="getAvatarUrl(comment.user.avatarId)" size="40" class="me-3 mt-3" />
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="d-flex flex-column">
                  <v-text class="font-weight-bold">{{ comment.user.nickname }} </v-text>
                  <v-list-item-subtitle>{{ comment.user.intro }}</v-list-item-subtitle>
                </div>
                <v-spacer />
                <v-list-item-subtitle>{{ dayjs(comment.created_at).fromNow() }}</v-list-item-subtitle>
              </div>
              <div class="d-flex justify-space-between">
                <div class="d-flex align-center">
                  {{ comment.content }}
                </div>
                <v-btn
                  icon="mdi-check-circle-outline"
                  color="on-background"
                  variant="plain"
                  @click="comment.tag = CommentTag.Ignored"
                >
                </v-btn>
              </div>
              <div class="d-flex flex-row align-center">
                <v-btn color="on-background" variant="plain">
                  <v-icon>{{ isPositive ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
                  &nbsp;
                  {{ comment.attitudes.positive_count }}
                </v-btn>
                <v-btn color="on-background" variant="plain" min-width="24px">
                  <v-icon>mdi-thumb-down-outline</v-icon>
                </v-btn>
                <v-btn color="on-background" variant="plain" min-width="24px">
                  <v-icon>mdi-comment-outline</v-icon>
                </v-btn>
                <v-btn color="on-background" variant="plain" min-width="24px">
                  <v-icon>mdi-dots-horizontal</v-icon>
                </v-btn>
              </div>
              <div v-if="typeof comment.sub_comments !== 'undefined'">
                <v-divider class="my-3"></v-divider>
                <div v-for="subComment in comment.sub_comments" :key="subComment.id">
                  <v-sheet class="pa-3" rounded="lg">
                    <div class="d-flex flex-row">
                      <user-avatar :avatar="getAvatarUrl(subComment.user.avatarId)" size="40" class="me-3 mt-3" />
                      <div class="flex-grow-1">
                        <div class="d-flex justify-space-between align-center mb-2">
                          <div class="d-flex flex-column">
                            <v-text class="font-weight-bold">{{ subComment.user.nickname }} </v-text>
                            <v-list-item-subtitle>{{ subComment.user.intro }}</v-list-item-subtitle>
                          </div>
                          <v-spacer />
                          <v-list-item-subtitle>{{ dayjs(subComment.created_at).fromNow() }}</v-list-item-subtitle>
                        </div>
                        <div class="d-flex justify-space-between">
                          <div class="d-flex align-center">
                            {{ subComment.content }}
                          </div>
                        </div>
                        <div class="d-flex flex-row align-center">
                          <v-btn color="on-background" variant="plain">
                            <v-icon>{{ isPositive ? 'mdi-thumb-up' : 'mdi-thumb-up-outline' }}</v-icon>
                            &nbsp;
                            {{ subComment.attitudes.positive_count }}
                          </v-btn>
                          <v-btn color="on-background" variant="plain" min-width="24px">
                            <v-icon>mdi-thumb-down-outline</v-icon>
                          </v-btn>
                          <v-btn color="on-background" variant="plain" min-width="24px">
                            <v-icon>mdi-dots-horizontal</v-icon>
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </v-sheet>
                </div>
              </div>
            </div>
          </div>
        </v-sheet>
      </VSlideXReverseTransition>
    </div>
  </v-card>
</template>

<script lang="ts" setup>
import type { Comment } from '@/types'

import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import UserAvatar from '@/components/common/UserAvatar.vue'
import { CommentableType } from '@/constants'
import { CommentTag } from '@/constants'

const { t } = useI18n()
// import Comment from '@/types/comments'
// import { defineProps, withDefaults, onMounted } from 'vue'

// const { width } = withDefaults(
//   defineProps<{
//     width: number
//   }>(),
//   {
//     width: () => 800,
//   }
// )

const isPositive = ref(false)

const comments = ref<Comment[]>([
  {
    sub_comments: [
      {
        id: 4,
        created_at: 1710319052678,
        user: {
          id: 4,
          avatarId: 1,
          nickname: '赵六',
          username: 'zhaoliu',
          intro: '我是赵六',
          follow_count: 0,
          fans_count: 0,
          question_count: 0,
          answer_count: 0,
        },
        commentable_type: CommentableType.Answer,
        commentable_id: 1,
        attitudes: {
          positive_count: 10,
          negative_count: 2,
          difference: 8,
        },
        content: '无可否认，当读者在浏览一个页面的',
      },
      {
        id: 5,
        created_at: 1710319052678,
        user: {
          id: 5,
          avatarId: 1,
          nickname: '钱七',
          username: 'qianqi',
          intro: '我是钱七',
          follow_count: 0,
          fans_count: 0,
          question_count: 0,
          answer_count: 0,
        },
        commentable_type: CommentableType.Answer,
        commentable_id: 1,
        attitudes: {
          positive_count: 10,
          negative_count: 2,
          difference: 8,
        },
        content: '无可否认，当读者在浏览一个页面的',
      },
    ],
    id: 1,
    created_at: 1710319052678,
    user: {
      id: 1,
      avatarId: 1,
      nickname: '张三',
      username: 'zhangsan',
      intro: '我是张三',
      follow_count: 0,
      fans_count: 0,
      question_count: 0,
      answer_count: 0,
    },
    commentable_type: CommentableType.Answer,
    commentable_id: 1,
    attitudes: {
      positive_count: 10,
      negative_count: 2,
      difference: 8,
    },
    content:
      '无可否认，当读者在浏览一个页面的排版时，难免会被可阅读的内容所分散注意力。Lorem Ipsum的目的就是为了保持字母多多少少标准及平均的分配，而不是“此处有文本，此处有文本”，从而让内容更像可读的英语。如今，很多桌面排版软件以及网页编辑用Lorem Ipsum作为默认的示范文本，搜一搜“Lorem Ipsum”就能找到这些网站的雏形。这些年来Lorem Ipsum演变出了各式各样的版本，有些出于偶然，有些则是故意的（刻意的幽默之类的）。',
  },
  {
    id: 2,
    created_at: 1710319052678,
    user: {
      id: 2,
      avatarId: 1,
      nickname: '李四',
      username: 'lisi',
      intro: '我是李四',
      follow_count: 0,
      fans_count: 0,
      question_count: 0,
      answer_count: 0,
    },
    commentable_type: CommentableType.Answer,
    commentable_id: 1,
    attitudes: {
      positive_count: 10,
      negative_count: 2,
      difference: 8,
    },
    content:
      '无可否认，当读者在浏览一个页面的排版时，难免会被可阅读的内容所分散注意力。Lorem Ipsum的目的就是为了保持字母多多少少标准及平均的分配，而不是“此处有文本，此处有文本”，从而让内容更像可读的英语。如今，很多桌面排版软件以及网页编辑用Lorem Ipsum作为默认的示范文本，搜一搜“Lorem Ipsum”就能找到这些网站的雏形。这些年来Lorem Ipsum演变出了各式各样的版本，有些出于偶然，有些则是故意的（刻意的幽默之类的）。',
  },
  {
    id: 3,
    created_at: 1710319052678,
    user: {
      id: 3,
      avatarId: 1,
      nickname: '王五',
      username: 'wangwu',
      intro: '我是王五',
      follow_count: 0,
      fans_count: 0,
      question_count: 0,
      answer_count: 0,
    },
    commentable_type: CommentableType.Answer,
    commentable_id: 1,
    attitudes: {
      positive_count: 10,
      negative_count: 2,
      difference: 8,
    },
    content: '无可否认，当读者在浏览一个页面的',
  },
])
</script>

<style scoped>
.aniSlide-enter-active {
  animation: aniSlidein 18s ease;
}
.aniSlide-leave-active {
  animation: aniSlidein 18s ease reverse;
}
</style>
