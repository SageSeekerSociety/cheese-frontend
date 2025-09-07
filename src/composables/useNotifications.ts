import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { NotificationsApi } from '@/network/api/notifications'
import AccountService from '@/services/account'

/**
 * 通知相关的公共逻辑
 */
export function useNotifications() {
  const router = useRouter()

  const notificationMenuOpen = ref(false)
  const unreadNotificationsCount = ref(0)

  const loggedIn = computed(() => AccountService._loggedIn.value)

  // 获取未读通知数量
  const fetchUnreadNotificationsCount = async () => {
    if (!loggedIn.value) return

    try {
      const response = await NotificationsApi.getUnreadCount()
      unreadNotificationsCount.value = response.data.count
    } catch (error) {
      console.error('获取未读通知数量失败:', error)
    }
  }

  // 更新未读通知数量
  const updateUnreadCount = (count: number) => {
    unreadNotificationsCount.value = count
  }

  // 监听登录状态变化
  watch(loggedIn, (newValue) => {
    if (newValue) {
      fetchUnreadNotificationsCount()
    } else {
      unreadNotificationsCount.value = 0
    }
  })

  // 路由变化时关闭通知菜单
  watch(
    () => router.currentRoute.value.fullPath,
    () => {
      notificationMenuOpen.value = false
    }
  )

  // 组件挂载时获取未读数量
  onMounted(() => {
    if (loggedIn.value) {
      fetchUnreadNotificationsCount()
    }
  })

  return {
    // 状态
    notificationMenuOpen,
    unreadNotificationsCount,
    loggedIn,

    // 方法
    fetchUnreadNotificationsCount,
    updateUnreadCount,
  }
}
