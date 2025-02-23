import { SudoRequiredError } from '../../types/error'
import { messageFailed } from '../../utils/showMessage'

export default function forbidden(error: any) {
  // 如果是 SudoRequiredError，不显示无权限消息
  if (error instanceof SudoRequiredError) {
    return
  }
  messageFailed('用户无权限')
}
