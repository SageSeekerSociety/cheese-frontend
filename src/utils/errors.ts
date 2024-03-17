export const getErrorMessage = (error: any) => {
  if (typeof error === 'string') {
    return error
  }
  if (error.message) {
    return error.message
  }
  if (error.response) {
    if (error.response.data && error.response.data.message) {
      return error.response.data.message
    }
    if (error.response.statusText) {
      return error.response.statusText
    }
  }
  return '未知错误'
}
