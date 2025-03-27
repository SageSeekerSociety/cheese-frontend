import { createEventBus } from '@/events/core'

/**
 * 任务模块事件映射类型
 */
export interface TaskEvents {
  // 对话框状态事件
  'edit-dialog-open': boolean // 编辑对话框开关状态
  'verify-dialog-open': boolean // 验证信息对话框开关状态
  'privacy-dialog-open': boolean // 隐私声明对话框开关状态
  'team-selection-dialog-open': boolean // 队伍选择对话框开关状态
  'leave-team-dialog-open': boolean // 退出队伍对话框开关状态
  'chat-dialog-open': { status: boolean; question?: string } // AI聊天对话框开关状态

  // 用户操作事件
  'join-clicked': undefined // 点击加入按钮
  'leave-clicked': undefined // 点击离开按钮
  'show-privacy-dialog': undefined // 显示隐私对话框
  'show-privacy': undefined // 直接显示隐私对话框（快捷方式）
  'confirm-privacy': { fromSubmit: boolean } // 确认隐私声明
  'cancel-privacy': undefined // 取消隐私声明
  'privacy-agreed-change': boolean // 隐私同意状态变化
  'set-from-submit': boolean // 设置来自提交状态
  'clear-context': undefined // 清除AI对话上下文

  // 业务流程事件
  'verify-form-submit': undefined // 提交验证表单
  'submit-verify': Record<string, any> // 提交验证信息
  'submit-edit': Record<string, any> // 提交编辑信息
  'select-team': number // 选择队伍
  'select-leave-team': number // 选择要离开的队伍
  'leave-team': number // 离开队伍
  'confirm-leave-team': undefined // 确认离开队伍
  'reload-joined-teams': undefined // 重新加载已加入的队伍
}

// 创建任务模块的事件总线
export const { bus: taskBus, useEventBus: useTaskEventBus } = createEventBus<TaskEvents>()

// 导出事件总线使用Hook
export { useTaskEventBus as useEvents }

// 导出默认事件总线实例
export default taskBus
