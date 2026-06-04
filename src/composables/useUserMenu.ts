import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

import { getAvatarUrl } from '@/utils/materials'

import { AIApi } from '@/network/api/ai'
import { QuotaInfo } from '@/network/api/ai/types'
import { UserApi } from '@/network/api/users'
import AccountService from '@/services/account'

/**
 * 用户菜单相关的公共逻辑
 */
export function useUserMenu() {
  const router = useRouter()

  // 用户相关状态
  const menuOpen = ref(false)
  const loggedIn = computed(() => AccountService._loggedIn.value)
  const currentUser = computed(() => AccountService._user.value)
  const avatar = computed(() => getAvatarUrl(AccountService._user.value?.avatarId))
  const nickname = computed(() => AccountService._user.value?.nickname ?? '')
  const intro = computed(() => AccountService._user.value?.intro ?? '')

  // AI 配额状态
  const aiQuota = ref<QuotaInfo | null>(null)

  // 获取 AI 配额
  const fetchAIQuota = async () => {
    if (!loggedIn.value) return
    try {
      const { data } = await AIApi.getQuota()
      aiQuota.value = data
    } catch (error) {
      console.error('Failed to fetch AI quota:', error)
    }
  }

  // 退出登录
  const onLogout = async () => {
    await UserApi.logout()
    AccountService.logout()
    router.push('/')
  }

  // 当菜单打开时获取 AI 配额
  watch(menuOpen, (newValue) => {
    if (newValue) {
      fetchAIQuota()
    }
  })

  return {
    // 状态
    menuOpen,
    loggedIn,
    currentUser,
    avatar,
    nickname,
    intro,
    aiQuota,

    // 方法
    fetchAIQuota,
    onLogout,

    // 工具函数
    dayjs,
  }
}
