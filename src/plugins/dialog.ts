import { reactive, h, VNode } from 'vue'

interface DialogOptions<T = any> {
  title: string
  content: string | (() => VNode)
  showCancel?: boolean
  onConfirm?: (value?: any) => T
  onCancel?: () => void
}

interface DialogInstance<T = any> extends DialogOptions<T> {
  id: number
  isOpen: boolean
  wait: () => Promise<T>
}

let nextId = 0

export const dialogs = reactive<DialogInstance[]>([])

const showDialog = <T>(options: DialogOptions<T>): DialogInstance<T> => {
  let resolvePromise!: (value: T) => void
  const waitPromise = new Promise<T>((resolve) => {
    resolvePromise = resolve
  })

  const dialog: DialogInstance<T> = {
    id: nextId++,
    isOpen: true,
    wait: () => waitPromise,
    ...options,
  }

  ;(dialog as any).resolvePromise = resolvePromise

  dialogs.push(dialog)

  return dialog
}

export const closeDialog = <T>(id: number, result: T) => {
  const index = dialogs.findIndex((d) => d.id === id)
  if (index > -1) {
    const dialog = dialogs[index] as DialogInstance<T>
    ;(dialog as any).resolvePromise(result) // 使用存储的 resolvePromise 函数
    dialogs.splice(index, 1)
  }
}

export function useDialog() {
  const alert = (message: string): DialogInstance<void> =>
    showDialog({
      title: '提示',
      content: message,
      showCancel: false,
      onConfirm: () => {},
    })

  const confirm = (message: string): DialogInstance<boolean> =>
    showDialog({
      title: '确认',
      content: message,
      showCancel: true,
      onConfirm: () => true,
      onCancel: () => false,
    })

  const prompt = (
    message: string,
    options?: { defaultValue?: string; placeholder?: string }
  ): DialogInstance<string> => {
    let inputValue = options?.defaultValue || ''
    return showDialog({
      title: '输入',
      content: () =>
        h('v-text-field', {
          modelValue: inputValue,
          placeholder: options?.placeholder,
          label: message,
          'onUpdate:modelValue': (value: string) => {
            inputValue = value
          },
        }),
      showCancel: true,
      onConfirm: () => inputValue,
    })
  }

  const custom = <T>(title: string, content: () => VNode, options?: Partial<DialogOptions<T>>): DialogInstance<T> =>
    showDialog({
      title,
      content,
      showCancel: true,
      ...options,
    })

  return {
    alert,
    confirm,
    prompt,
    custom,
  }
}

export function createDialogPlugin() {
  return {
    install: (app: any) => {
      app.provide('dialogs', dialogs)
      app.provide('closeDialog', closeDialog)
    },
  }
}

export type { DialogInstance, DialogOptions }
