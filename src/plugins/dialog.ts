import type { VNode } from 'vue'

import { h, reactive } from 'vue'
import { VTextField } from 'vuetify/lib/components/index.mjs'

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
  let rejectPromise!: (reason?: any) => void
  const waitPromise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const dialog: DialogInstance<T> = {
    id: nextId++,
    isOpen: true,
    wait: () => waitPromise,
    ...options,
  }

  ;(dialog as any).resolvePromise = resolvePromise
  ;(dialog as any).rejectPromise = rejectPromise
  dialogs.push(dialog)

  return dialog
}

export class CancelError extends Error {
  constructor() {
    super('cancel')
  }
}

export const closeDialog = <T>(id: number, result: T, isCancel = false) => {
  const index = dialogs.findIndex((d) => d.id === id)
  if (index > -1) {
    const dialog = dialogs[index] as DialogInstance<T>
    if (isCancel) {
      ;(dialog as any).rejectPromise(new CancelError())
    } else {
      ;(dialog as any).resolvePromise(result)
    }
    dialogs.splice(index, 1)
  }
}

export function useDialog() {
  const alert = (message: string, options?: { title?: string }): DialogInstance<void> =>
    showDialog({
      title: options?.title || '提示',
      content: message,
      showCancel: false,
      onConfirm: () => {},
    })

  const confirm = (message: string, options?: { title?: string }): DialogInstance<boolean> =>
    showDialog({
      title: options?.title || '确认',
      content: message,
      showCancel: true,
      onConfirm: () => true,
      onCancel: () => false,
    })

  const prompt = (
    message: string,
    options?: { title?: string; defaultValue?: string; placeholder?: string; required?: boolean }
  ): DialogInstance<string> => {
    let inputValue = options?.defaultValue || ''
    return showDialog({
      title: options?.title || '输入',
      content: () =>
        h(VTextField, {
          modelValue: inputValue,
          placeholder: options?.placeholder,
          label: message,
          required: options?.required,
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
