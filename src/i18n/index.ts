import { createI18n } from 'vue-i18n'
import zhCN from './messages/zh-CN'

type MessageSchema = typeof zhCN

const i18n = createI18n<MessageSchema, 'zh-CN'>({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
  },
})

export const { t } = i18n.global

export default i18n
