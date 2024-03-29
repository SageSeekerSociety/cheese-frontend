import { toast } from 'vuetify-sonner'

export function messageSucceed(message: string) {
  toast(message)
}
export function messageFailed(message: string) {
  toast.error(message)
}

export function messageWaring(message: string) {
  toast.warning(message)
}
