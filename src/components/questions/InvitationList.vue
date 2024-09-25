<template>
  <v-list>
    <v-list-item v-for="(user, index) in data" :key="user.id" :title="user.nickname" :subtitle="user.intro">
      <template #prepend>
        <user-avatar :avatar="getAvatarUrl(user.avatarId)" />
      </template>
      <template #append>
        <v-btn :variant="isInvited[index] ? 'text' : 'outlined'" :disabled="isInvited[index]" @click="invite(index)">
          <v-icon class="me-2">mdi-account-multiple-plus</v-icon>
          {{
            isInvited[index]
              ? t('questions.invitationList.buttons.invited')
              : t('questions.invitationList.buttons.invite')
          }}
        </v-btn>
      </template>
    </v-list-item>
  </v-list>
</template>

<script setup lang="ts">
import { User } from '@/types'
import { toRefs, ref, computed, onMounted } from 'vue'
import { QuestionApi } from '@/network/api/questions'
import UserAvatar from '../common/UserAvatar.vue'
import { toast } from 'vuetify-sonner'
import { getErrorMessage } from '@/utils/errors'
import { getAvatarUrl } from '@/utils/materials'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  questionId: number
}>()

const { questionId } = toRefs(props)

const data = ref<User[]>([])
const invitedUsers = ref<User[]>([])

const isInvited = computed(() => {
  return data.value.map((user) => invitedUsers.value.some((invitedUser) => invitedUser.id === user.id))
})

const invite = async (index: number) => {
  const user = data.value[index]
  if (user && !isInvited.value[index]) {
    try {
      const { data } = await QuestionApi.inviteUser(questionId.value, user.id)
      if (data) {
        invitedUsers.value.push(user)
      }
    } catch (e) {
      toast.error(t('questions.invitationList.errors.inviteFailed', { reason: getErrorMessage(e) }))
    }
  }
}

onMounted(async () => {
  if (questionId.value) {
    const [
      {
        data: { users },
      },
      {
        data: { invitations },
      },
    ] = await Promise.all([
      QuestionApi.invitationRecommend(questionId.value),
      QuestionApi.getInvitaions(questionId.value),
    ])
    data.value = users
  }
})
</script>
