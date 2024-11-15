import { useRouter } from 'vue-router'

import { messageFailed } from '../../utils/showMessage'
import { Local } from '../../utils/storage'

const router = useRouter()

export default function forbidden() {
  messageFailed('用户无权限')
}
