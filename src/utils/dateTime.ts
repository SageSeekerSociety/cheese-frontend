import { useI18n } from 'vue-i18n'
import dayjs from 'dayjs'

/**
 * 格式化时间，根据距离当前时间的远近展示不同格式
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化后的时间字符串
 */
export function useFormattedTime() {
  const { t } = useI18n()

  const formatTime = (timestamp: number): string => {
    const date = dayjs(timestamp)
    const now = dayjs()

    // 如果是今天的消息，显示相对时间
    if (date.isSame(now, 'day')) {
      const diff = now.diff(date, 'minute')
      if (diff < 1) return t('notifications.common.justNow')
      return date.fromNow()
    }

    // 如果是昨天的消息，显示"昨天 XX:XX"
    if (date.isSame(now.subtract(1, 'day'), 'day')) {
      return `昨天 ${date.format('HH:mm')}`
    }

    // 如果是今年的消息，显示"MM-DD HH:MM"
    if (date.isSame(now, 'year')) {
      return date.format('MM-DD HH:mm')
    }

    // 否则显示完整日期
    return date.format('YYYY-MM-DD HH:mm')
  }

  return {
    formatTime,
  }
}
