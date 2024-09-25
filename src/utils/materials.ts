export const getAvatarUrl = (avatar?: string | number) => {
  return avatar
    ? `${import.meta.env.VITE_API_BASE_URL}/avatars/${avatar}`
    : `${import.meta.env.VITE_API_BASE_URL}/avatars/default`
}

export const getFullAttachmentUrl = (attachmentUrl: string) => {
  if (attachmentUrl.startsWith('http')) {
    return attachmentUrl
  }
  return `${import.meta.env.VITE_API_BASE_URL}${attachmentUrl}`
}

export const formatFileSize = (byte: number) => {
  if (byte < 1024) {
    return `${byte} B`
  }
  if (byte < 1024 * 1024) {
    return `${(byte / 1024).toFixed(2)} KB`
  }
  if (byte < 1024 * 1024 * 1024) {
    return `${(byte / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(byte / 1024 / 1024 / 1024).toFixed(2)} GB`
}
