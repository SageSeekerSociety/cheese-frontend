<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card v-if="questionData" rounded="lg" flat>
          <v-card-item>
            <v-card-title class="text-h5">{{ questionData.title }}</v-card-title>
            <v-card-subtitle class="d-flex align-center question-info">
              <span>{{ t('questions.detail.createdAt', { time: createdAt }) }}</span>
              <span v-if="showUpdatedAt">{{ t('questions.detail.updatedAt', { time: updatedAt }) }}</span>
              <span>{{ t('questions.detail.viewCount', { count: questionData.view_count }) }}</span>
            </v-card-subtitle>
            <template #append>
              <v-btn color="primary" :variant="questionData.is_follow ? 'tonal' : 'flat'" @click="toggleFollowQuestion">
                <v-icon size="24" class="me-2">mdi-plus</v-icon>
                <template v-if="questionData.is_follow">
                  {{ t('questions.detail.buttons.unfollow') }}
                </template>
                <template v-else>
                  {{
                    t(
                      'questions.detail.buttons.follow',
                      {
                        count: questionData.follow_count,
                      },
                      questionData.follow_count
                    )
                  }}
                </template>
              </v-btn>
            </template>
          </v-card-item>
          <v-card-text>
            <div class="d-flex flex-wrap align-center mb-4" style="gap: 8px">
              <template v-for="topic in questionData.topics" :key="topic.id">
                <v-chip color="primary" label>{{ topic.name }}</v-chip>
              </template>
            </div>
            <div class="d-flex align-center mb-2">
              <user-avatar :avatar="getAvatarUrl(questionData.author.avatarId)" :size="24" />
              <span class="ms-2">{{ questionData.author.nickname }}</span>
            </div>
            <div class="d-flex align-center flex-wrap" style="gap: 8px">
              <v-tooltip v-if="questionData.bounty && questionData.bounty > 0" bottom>
                <template #activator="{ props }">
                  <v-chip v-bind="props" color="primary" class="mb-2" prepend-icon="mdi-currency-usd">
                    {{ t('questions.detail.bounty', { bounty: questionData.bounty }) }}
                    <template #append>
                      <v-icon>mdi-cheese</v-icon>
                      <v-icon size="12" class="ms-1">mdi-help-circle-outline</v-icon>
                    </template>
                  </v-chip>
                </template>
                <span>
                  {{
                    t('questions.detail.bountyTip', {
                      bounty: questionData.bounty,
                      before: dayjs(questionData.bounty_start_at).add(3, 'days').format('YYYY-MM-DD HH:mm'),
                    })
                  }}
                </span>
              </v-tooltip>
            </div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div class="rich-content" v-html="contentHtml"></div>
          </v-card-text>
          <v-card-actions>
            <content-voter
              :score="questionData.attitudes.difference"
              :current-vote="questionData.attitudes.user_attitude"
              class="me-2"
              @upvote="attitudeQuestion(NewAttitudeType.Positive)"
              @downvote="attitudeQuestion(NewAttitudeType.Negative)"
              @cancel-vote="attitudeQuestion(NewAttitudeType.None)"
            />

            <v-dialog
              v-if="!questionData.accepted_answer && questionData.bounty && questionData.bounty > 0"
              width="auto"
              scrollable
            >
              <template #activator="{ props: activatorProps }">
                <v-btn variant="outlined" v-bind="activatorProps">
                  <v-icon size="18" class="me-2">mdi-account-multiple-plus</v-icon>
                  {{ t('questions.detail.buttons.invite') }}
                </v-btn>
              </template>

              <template #default="{ isActive }">
                <v-card>
                  <v-card-item>
                    <v-card-title class="text-h6">{{ t('questions.detail.inviteTitle') }}</v-card-title>
                  </v-card-item>
                  <v-card-text style="padding: 8px">
                    <div class="px-3 mb-2">
                      <v-text-field
                        clearable
                        label="搜索用户"
                        variant="outlined"
                        density="compact"
                        single-line
                        hide-details
                      ></v-text-field>
                    </div>
                    <invitation-list :question-id="questionId" />
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn text="关闭" @click="isActive.value = false"></v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
            <v-dialog v-else-if="!questionData.accepted_answer" v-model="bountyDialog" width="540px">
              <template #activator="{ props: activatorProps }">
                <v-btn prepend-icon="mdi-currency-usd" variant="outlined" v-bind="activatorProps">
                  {{ t('questions.detail.buttons.bounty') }}
                </v-btn>
              </template>

              <template #default="{ isActive }">
                <v-card>
                  <v-card-item>
                    <v-card-title class="text-h6">{{ t('questions.detail.addBountyTitle') }}</v-card-title>
                  </v-card-item>
                  <v-card-text class="pa-1">
                    <div class="px-3 mb-2">
                      <v-slider
                        v-model="addBountyInput"
                        thumb-label="always"
                        min="1"
                        max="20"
                        step="1"
                        show-ticks
                        hide-details
                      >
                        <template #append>
                          <span style="vertical-align: baseline; min-width: 5rem; text-align: end">
                            <span>悬赏 {{ addBountyInput }} </span><v-icon>mdi-cheese</v-icon>
                          </span>
                        </template>
                      </v-slider>
                    </div>
                  </v-card-text>

                  <v-card-actions>
                    <v-spacer></v-spacer>

                    <v-btn text="取消" @click="isActive.value = false"></v-btn>
                    <v-btn variant="flat" color="primary" :loading="bountyLoading" @click="addBounty">{{
                      t('questions.detail.buttons.addBounty')
                    }}</v-btn>
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>

            <v-btn variant="plain">
              <v-icon size="18" class="me-2">mdi-comment-outline</v-icon>
              {{ t('questions.detail.buttons.comment') }}
              <span v-if="questionData.comment_count">{{ questionData.comment_count }}</span>
            </v-btn>
            <v-btn variant="plain">
              <v-icon size="18" class="me-2">mdi-star-outline</v-icon>
              {{ t('questions.detail.buttons.favorite') }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <v-skeleton-loader v-else type="list-item-avatar, paragraph, button@2" />
      </v-col>
    </v-row>
    <v-row v-if="questionData?.accepted_answer">
      <v-col>
        <v-alert
          class="accept-alert"
          type="success"
          :title="t('questions.detail.acceptedAnswerTitle', { user: questionData.accepted_answer.author.nickname })"
        >
          <template #append>
            <v-btn
              color="text"
              variant="tonal"
              :to="{
                name: 'QuestionAnswer',
                params: {
                  questionId: questionData.id.toString(),
                  answerId: questionData.accepted_answer.id.toString(),
                },
              }"
            >
              {{ t('questions.detail.buttons.viewAcceptedAnswer') }}
            </v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>
    <v-row v-if="questionId">
      <v-col>
        <router-view />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card flat rounded="lg" style="overflow: initial; z-index: initial">
          <v-card-item>
            <v-card-title class="text-h6">{{ t('questions.detail.postAnswerTitle') }}</v-card-title>
          </v-card-item>
          <template v-if="questionData?.my_answer_id">
            <v-card-text>
              <v-alert type="info" @click="openMyAnswer">
                {{ t('questions.detail.postAnswerExist') }}
              </v-alert>
            </v-card-text>
          </template>
          <template v-else>
            <v-card-text>
              <rich-editor
                holder="editor"
                :config="{ ...DEFAULT_CONFIG, placeholder: t('questions.detail.postAnswerPlaceholder') }"
                @create="onCreate"
              />
            </v-card-text>
            <v-card-actions>
              <v-btn color="primary" variant="flat" @click="submit">{{
                t('questions.detail.buttons.postAnswer')
              }}</v-btn>
            </v-card-actions>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import EditorJS from '@editorjs/editorjs'
import { setTitle } from '@/utils/title'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'
import { onMounted, ref, computed, watch, provide } from 'vue'
import { QuestionApi } from '@/network/api/questions'
import { Question } from '@/types'
import { parse } from '@/utils/parser'
import { DEFAULT_CONFIG } from '@/utils/editor'
import UserAvatar from '@/components/common/UserAvatar.vue'
import RichEditor from '@/components/common/Editor/Editor.vue'
import InvitationList from '@/components/questions/InvitationList.vue'
import { AnswersApi } from '@/network/api/answers'
import ContentVoter from '@/components/common/ContentVoter.vue'
import { useRouter } from 'vue-router'
import { toast } from 'vuetify-sonner'
import { NewAttitudeType } from '@/constants'
import { questionDataInjectionKey } from '@/keys'
import { useI18n } from 'vue-i18n'
import { getAvatarUrl } from '@/utils/materials'

const { t } = useI18n()
let editor: EditorJS
const onCreate = (editorInstance: EditorJS) => {
  editor = editorInstance
}

const route = useRoute()
const router = useRouter()

const addBountyInput = ref<number>(1)
const bountyDialog = ref(false)
const bountyLoading = ref(false)

const questionId = computed(() => parseInt(route.params.questionId as string))

const questionData = ref<Question | null>(null)

provide(questionDataInjectionKey, questionData)

const createdAt = computed(() => {
  if (questionData.value) {
    return dayjs(questionData.value.created_at).fromNow()
  }
  return ''
})
const showUpdatedAt = computed(() => {
  if (questionData.value) {
    return dayjs(questionData.value.created_at).isBefore(questionData.value.updated_at)
  }
  return false
})
const updatedAt = computed(() => {
  if (questionData.value) {
    return dayjs(questionData.value.updated_at).fromNow()
  }
  return ''
})

const contentHtml = computed(() => {
  if (questionData.value) {
    return parse(JSON.parse(questionData.value.content))
  }
  return ''
})

const addBounty = async () => {
  bountyLoading.value = true
  try {
    await QuestionApi.addBounty(questionData.value!.id, addBountyInput.value)
    toast.success(t('questions.detail.addBountySuccess'))
    bountyDialog.value = false
  } catch (error) {
    toast.error(`${error}`)
  } finally {
    bountyLoading.value = false
  }
}

const load = async (id: number) => {
  const {
    data: { question },
  } = await QuestionApi.detail(id)
  questionData.value = question
}

const submit = async () => {
  try {
    const outputData = await editor.save()
    if (outputData.blocks.length === 0) {
      toast.error(t('questions.detail.postAnswerEmpty'))
      return
    }
    const content = JSON.stringify(outputData)
    const { data } = await AnswersApi.answerQuestion(questionData.value!.id, content)
    toast.success(t('questions.detail.postAnswerSuccess'))
    editor.clear()
    router.push({
      name: 'QuestionAnswer',
      params: { questionId: questionData.value!.id.toString(), answerId: data.id.toString() },
    })
  } catch (error) {
    toast.error(`${error}`)
  }
}

const attitudeQuestion = async (attitudeType: NewAttitudeType) => {
  const {
    data: { attitudes },
  } = await QuestionApi.attitudeQuestion(questionData.value!.id, attitudeType)
  questionData.value!.attitudes = attitudes
}

const toggleFollowQuestion = async () => {
  if (questionData.value!.is_follow) {
    const {
      data: { follow_count: followCount },
    } = await QuestionApi.unfollowQuestion(questionData.value!.id)
    questionData.value!.follow_count = followCount
    questionData.value!.is_follow = false
  } else {
    const {
      data: { follow_count: followCount },
    } = await QuestionApi.followQuestion(questionData.value!.id)
    questionData.value!.follow_count = followCount
    questionData.value!.is_follow = true
  }
}

const openMyAnswer = () => {
  if (questionData.value?.my_answer_id) {
    router.push({
      name: 'QuestionAnswer',
      params: { questionId: questionData.value.id.toString(), answerId: questionData.value.my_answer_id.toString() },
    })
  }
}

onMounted(async () => {
  await load(questionId.value)
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.questionId !== from.params.questionId) {
    await load(parseInt(to.params.questionId as string))
  }
})

watch(questionData, (newVal) => {
  if (newVal) {
    setTitle(newVal.title, route)
  }
})
</script>

<style lang="scss">
.ce-block__content,
.ce-toolbar__content {
  max-width: unset;
}

.ce-block__content {
  padding: 0;
}

.question-info {
  gap: 8px;
}

.accept-alert .v-alert__prepend {
  align-self: stretch;
}
</style>
