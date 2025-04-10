<template>
  <v-sheet class="user-profile-card rounded-lg overflow-hidden" elevation="0">
    <!-- 顶部封面区域 -->
    <div class="cover-container">
      <v-img
        class="cover-image"
        height="180"
        src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
        cover
        :gradient="'to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3)'"
      >
      </v-img>
    </div>

    <!-- 用户信息区域 -->
    <div class="user-info-container">
      <!-- 头像区域 -->
      <div class="avatar-wrapper">
        <user-avatar :avatar="getAvatarUrl(profile.avatarId)" :size="110" class="user-avatar" :rounded="8" />
      </div>

      <div class="info-action-container">
        <!-- 用户基本信息 -->
        <div class="user-details">
          <div class="d-flex align-center user-name-container">
            <h2 class="text-h4 font-weight-bold user-name">{{ profile.nickname }}</h2>

            <v-chip
              v-if="profile.username"
              size="small"
              color="grey-lighten-4"
              variant="flat"
              class="ml-4 user-id-chip"
            >
              <v-icon size="small" start>mdi-account</v-icon>
              {{ profile.username }}
            </v-chip>
          </div>

          <div class="user-intro mt-2 text-subtitle-1 text-grey-darken-1">
            <span v-if="profile.intro">{{ profile.intro }}</span>
            <span v-else class="text-grey-lighten-1 font-italic">这个人很神秘，没有留下介绍</span>
          </div>

          <!-- 社交统计 -->
          <div class="user-stats d-flex align-center mt-4">
            <div class="stat-item" @click="router.push({ name: 'UserFollowing', params: { id: profile.id } })">
              <div class="stat-value">{{ profile.fans_count || 0 }}</div>
              <div class="stat-label">关注</div>
            </div>

            <v-divider vertical class="mx-5"></v-divider>

            <div class="stat-item" @click="router.push({ name: 'UserFollower', params: { id: profile.id } })">
              <div class="stat-value">{{ profile.follow_count || 0 }}</div>
              <div class="stat-label">粉丝</div>
            </div>
          </div>
        </div>

        <!-- 右侧操作按钮 -->
        <div class="action-buttons">
          <div v-if="!isActivatedUser">
            <v-btn
              variant="tonal"
              :loading="isFollowLoading"
              :color="isFollowing ? 'grey' : 'primary'"
              :class="isFollowing ? 'following-btn' : 'follow-btn'"
              :prepend-icon="isFollowing ? 'mdi-check' : 'mdi-plus'"
              min-width="110"
              @click="updateFollowing"
            >
              {{ isFollowing ? '已关注' : '关注' }}
            </v-btn>
          </div>
          <div v-else>
            <v-btn
              color="primary"
              variant="tonal"
              :to="{ name: 'UserSettingsProfile' }"
              prepend-icon="mdi-pencil"
              class="edit-profile-btn"
            >
              编辑资料
            </v-btn>
          </div>
        </div>
      </div>
    </div>
  </v-sheet>
</template>

<script lang="ts" setup>
import type { Ref } from 'vue'
import type { User } from '@/types/users'

import { computed, inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getAvatarUrl } from '@/utils/materials'

import UserAvatar from '../common/UserAvatar.vue'

import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'

const router = useRouter()

const profile = inject<Ref<User>>('userData', ref({} as User))

const myId = computed(() => AccountService._user.value?.id as number)
const isActivatedUser = computed(() => {
  return myId.value === profile?.value.id
})

const isFollowLoading = ref(false)
const isFollowing = ref(false)

const followUser = async () => {
  const result = await UserApi.followUser(profile?.value.id as number)
  isFollowing.value = true
  isFollowLoading.value = false
  return result
}

const unfollowUser = async () => {
  const result = await UserApi.unfollowUser(profile?.value.id as number)
  isFollowing.value = false
  isFollowLoading.value = false
  return result
}

const updateFollowing = async () => {
  isFollowLoading.value = true
  if (!profile) return
  if (isFollowing.value) {
    await unfollowUser()
  } else {
    await followUser()
  }
}

onMounted(async () => {
  // if (!isActivatedUser.value && profile.value?.id) {
  //   try {
  //     const { data } = await UserApi.checkFollowing(profile.value.id)
  //     isFollowing.value = data.isFollowing
  //   } catch (error) {
  //     isFollowing.value = false
  //   }
  // }
})
</script>

<style scoped lang="scss">
.user-profile-card {
  position: relative;
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  transition: all 0.3s ease;
  background-color: white;

  &:hover {
    border: 1px solid rgba(var(--v-theme-primary), 0.1);
  }
}

.cover-container {
  position: relative;
  height: 180px;
  overflow: hidden;

  .cover-image {
    transition: transform 0.6s ease;

    &:hover {
      transform: scale(1.03);
    }
  }
}

.user-info-container {
  position: relative;
  display: flex;
  padding: 0 2rem 2rem;
  background-color: white;
}

.info-action-container {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding-top: 1.5rem;
  margin-left: 1.5rem;
}

.avatar-wrapper {
  margin-top: -4rem;
  position: relative;
  z-index: 2;
  flex-shrink: 0;

  .user-avatar {
    border: 4px solid white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.03);
    }
  }
}

.user-details {
  flex: 1;

  .user-name-container {
    flex-wrap: wrap;
  }

  .user-name {
    font-weight: 700;
    color: #333;
    letter-spacing: 0.3px;
  }

  .user-id-chip {
    opacity: 0.85;
    transition: opacity 0.3s ease;
    margin-top: 4px;

    &:hover {
      opacity: 1;
    }
  }

  .user-intro {
    max-width: 600px;
    line-height: 1.5;
  }
}

.user-stats {
  .stat-item {
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .stat-value {
    font-weight: 700;
    font-size: 1.2rem;
    margin-bottom: 0.2rem;
  }

  .stat-label {
    font-size: 0.8rem;
    color: rgba(0, 0, 0, 0.5);
  }
}

.action-buttons {
  align-self: flex-start;
  min-width: 110px;
  margin-left: 1rem;

  .follow-btn {
    transition: all 0.3s ease;
    font-weight: 500;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      opacity: 0.95;
    }
  }

  .following-btn {
    transition: all 0.3s ease;
    font-weight: 500;
    border-radius: 8px;

    &:hover {
      background-color: rgba(211, 47, 47, 0.1);
      color: #d32f2f;

      .v-icon {
        color: #d32f2f;
      }

      &:before {
        content: '取消关注';
      }

      .v-btn__content {
        opacity: 0;
      }
    }
  }

  .edit-profile-btn {
    transition: all 0.3s ease;
    font-weight: 500;
    border-radius: 8px;

    &:hover {
      transform: translateY(-2px);
      opacity: 0.95;
    }
  }
}

@media (max-width: 768px) {
  .user-info-container {
    flex-direction: column;
    align-items: center;
    padding: 0 1.5rem 1.5rem;
  }

  .info-action-container {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
    align-items: center;
  }

  .avatar-wrapper {
    margin: -4rem auto 1.5rem;
  }

  .user-details {
    width: 100%;
    text-align: center;

    .user-name-container {
      justify-content: center;
    }
  }

  .user-stats {
    justify-content: center;
    margin-top: 1rem;
  }

  .action-buttons {
    margin-left: 0;
    margin-top: 1.5rem;
    align-self: center;
  }
}

@media (max-width: 600px) {
  .user-info-container {
    padding: 0 1rem 1rem;
  }

  .user-name {
    font-size: 1.5rem !important;
  }

  .user-id-chip {
    margin-top: 0.5rem !important;
    margin-left: 0 !important;
  }
}
</style>
