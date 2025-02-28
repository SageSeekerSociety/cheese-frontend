// scrollManager.ts
import { nextTick, ref } from 'vue'

export function useScrollManager() {
  const chatHistoryRef = ref<HTMLElement>()
  const isAtBottom = ref(true)

  /**
   * Handle scroll events
   */
  const handleScroll = () => {
    checkIfAtBottom()
  }

  /**
   * Check if scroll position is at the bottom
   */
  const checkIfAtBottom = () => {
    if (!chatHistoryRef.value) return

    const { scrollTop, scrollHeight, clientHeight } = chatHistoryRef.value
    // If scroll position is within 20px of the bottom, consider it "at bottom"
    isAtBottom.value = scrollHeight - scrollTop - clientHeight < 20
  }

  /**
   * Scroll to the bottom of the chat
   */
  const scrollToBottom = async () => {
    await nextTick()
    if (chatHistoryRef.value) {
      chatHistoryRef.value.scrollTop = chatHistoryRef.value.scrollHeight
      isAtBottom.value = true
    }
  }

  /**
   * Smart scroll that only scrolls to bottom if user was already at bottom
   */
  const smartScrollToBottom = async () => {
    if (isAtBottom.value) {
      await scrollToBottom()
    }
  }

  return {
    chatHistoryRef,
    isAtBottom,
    handleScroll,
    checkIfAtBottom,
    scrollToBottom,
    smartScrollToBottom,
  }
}
