import { ref, watch } from 'vue'

import { useEvents } from '../events'

export function useVerification() {
  // 使用事件总线
  const events = useEvents()

  // 这些状态将由组件自己维护，不再需要在这里保留
  const verifyInfoDialogOpen = ref(false)
  const privacyDialogOpen = ref(false)
  const privacyAgreed = ref(false)
  const fromSubmit = ref(false)
  const shouldSubmitAfterAgree = ref(false)

  // 打开验证信息对话框
  const openVerifyDialog = () => {
    verifyInfoDialogOpen.value = true
    events.emit('verify-dialog-open', true)
  }

  // 关闭验证信息对话框
  const closeVerifyDialog = () => {
    verifyInfoDialogOpen.value = false
    events.emit('verify-dialog-open', false)
  }

  // 打开隐私对话框
  const showPrivacyDialog = () => {
    privacyDialogOpen.value = true
    events.emit('privacy-dialog-open', true)
    events.emit('show-privacy', undefined)
  }

  // 确认隐私协议
  const handlePrivacyConfirm = () => {
    privacyAgreed.value = true
    privacyDialogOpen.value = false
    events.emit('privacy-agreed-change', true)
    events.emit('confirm-privacy', { fromSubmit: fromSubmit.value })
  }

  // 取消隐私对话框
  const handlePrivacyCancel = () => {
    privacyDialogOpen.value = false
    fromSubmit.value = false
    events.emit('privacy-dialog-open', false)
    events.emit('cancel-privacy', undefined)
  }

  // 设置隐私协议状态
  const setPrivacyAgreed = (value: boolean) => {
    privacyAgreed.value = value
    events.emit('privacy-agreed-change', value)
  }

  // 设置是否来自提交
  const setFromSubmit = (value: boolean) => {
    fromSubmit.value = value
    events.emit('set-from-submit', value)
  }

  return {
    // 内部状态 - 这些其实可以完全不暴露，只暴露方法
    verifyInfoDialogOpen,
    privacyDialogOpen,
    privacyAgreed,
    fromSubmit,
    shouldSubmitAfterAgree,

    // 方法
    openVerifyDialog,
    closeVerifyDialog,
    showPrivacyDialog,
    handlePrivacyConfirm,
    handlePrivacyCancel,
    setPrivacyAgreed,
    setFromSubmit,
  }
}
