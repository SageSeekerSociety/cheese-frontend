import type { LocalDB } from "@/utils/local-db"

export {}

declare module 'vue' {
  interface ComponentCustomProperties {
    $db: LocalDB
  }
}
