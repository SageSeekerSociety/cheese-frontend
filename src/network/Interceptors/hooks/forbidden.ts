import { useRouter } from 'vue-router'

import { messageFailed } from '../../utils/showMessage'
import { Local } from '../../utils/storage'

const router = useRouter()

export default function forbidden() {
  // 根据业务逻辑，执行对应处理
  // 需求：账号权限发生改变，触发403 退出到登录页
  messageFailed('账号权限改变，请重新登录')
  Local.clear()
  router.replace('/account/signin')
}
