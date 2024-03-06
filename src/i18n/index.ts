import { createI18n } from 'vue-i18n'
import zhCN from './messages/zh-CN'

const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN,
  },
})

export default i18n
