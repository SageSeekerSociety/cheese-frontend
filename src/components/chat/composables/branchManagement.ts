// branchManagement.ts
import type { ChatMessage, ChatMessageNode } from '../types'

import { ref } from 'vue'

export function useBranchManagement(treeManager: ReturnType<typeof import('./conversationTree').useConversationTree>) {
  // Local reference to streaming state
  const isProcessingMessage = ref(false)
  const streaming = ref(false)

  /**
   * Create a branch from a specific message
   */
  async function handleBranchFromMessage(
    messageId: number,
    question: string,
    sendMessageFn: (
      question: string,
      parentMessageId?: number,
      tempMessageId?: number,
      resetMessages?: boolean
    ) => Promise<void>
  ) {
    // Prevent processing while streaming
    if (isProcessingMessage.value || streaming.value) return

    const targetMessage = treeManager.currentConversationMessages.value.find((msg) => msg.id === messageId)
    if (!targetMessage) return

    // Unified approach to branching
    if (!targetMessage.parentId) {
      await createRootBranch(question, sendMessageFn)
    } else {
      await createChildBranch(targetMessage.parentId, question, sendMessageFn)
    }
  }

  /**
   * Create a new root-level branch
   */
  async function createRootBranch(
    question: string,
    sendMessageFn: (
      question: string,
      parentMessageId?: number,
      tempMessageId?: number,
      resetMessages?: boolean
    ) => Promise<void>
  ) {
    // Reset current message ID
    treeManager.currentMessageId.value = null

    // Generate temporary ID
    const tempId = -Date.now()

    // Create temporary message
    const newTempMessage: ChatMessage = {
      id: tempId,
      question,
      response: '',
      modelType: 'standard', // This should be passed in as a parameter
      followupQuestions: [],
      createdAt: new Date().toISOString(),
      conversationId: '', // This should be passed in from state
    }

    // Create new root node
    const newRootNode: ChatMessageNode = {
      ...newTempMessage,
      children: [],
    }

    // Ensure current root exists in rootNodes
    if (
      treeManager.messageTree.value &&
      !treeManager.rootNodes.value.some((node) => node.id === treeManager.messageTree.value!.id)
    ) {
      treeManager.rootNodes.value.push(treeManager.messageTree.value)
    }

    // Update tree root
    treeManager.messageTree.value = newRootNode
    treeManager.rootNodes.value.push(newRootNode)

    // Sort roots by creation time
    treeManager.rootNodes.value.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    // Update current branch
    treeManager.currentBranch.value = {
      pathIds: [tempId],
      messages: [newTempMessage],
      branchPoints: [...treeManager.currentBranch.value.branchPoints],
    }

    // Update current messages
    treeManager.currentConversationMessages.value = [newTempMessage]

    // Send message
    await sendMessageFn(question, undefined, tempId, true)
  }

  /**
   * Create a branch from a non-root message
   */
  async function createChildBranch(
    parentId: number,
    question: string,
    sendMessageFn: (
      question: string,
      parentMessageId?: number,
      tempMessageId?: number,
      resetMessages?: boolean
    ) => Promise<void>
  ) {
    // Find parent message index
    const parentIndex = treeManager.currentConversationMessages.value.findIndex((msg) => msg.id === parentId)

    if (parentIndex !== -1) {
      // Only keep messages up to parent
      treeManager.currentConversationMessages.value = treeManager.currentConversationMessages.value.slice(
        0,
        parentIndex + 1
      )
    }

    // Update current message ID
    treeManager.currentMessageId.value = parentId

    // Update current branch path
    const parentPathIndex = treeManager.currentBranch.value.pathIds.indexOf(parentId)
    if (parentPathIndex !== -1) {
      treeManager.currentBranch.value = {
        ...treeManager.currentBranch.value,
        pathIds: treeManager.currentBranch.value.pathIds.slice(0, parentPathIndex + 1),
        messages: treeManager.currentConversationMessages.value,
      }
    }

    // Generate temporary ID
    const tempId = -Date.now()

    // Create temporary message
    const newTempMessage: ChatMessage = {
      id: tempId,
      parentId,
      question,
      response: '',
      modelType: 'standard', // This should be passed in as a parameter
      followupQuestions: [],
      createdAt: new Date().toISOString(),
      conversationId: '', // This should be passed in from state
    }

    // Record branch relationship
    treeManager.recordBranch(parentId, tempId)

    // Add to message tree if it exists
    if (treeManager.messageTree.value) {
      const parentNode = treeManager.findNodeById(parentId)
      if (parentNode) {
        parentNode.children.push({
          ...newTempMessage,
          children: [],
        })
      }
    }

    // Send message
    await sendMessageFn(question, parentId, tempId, false)
  }

  /**
   * Switch to a different branch
   */
  async function switchBranchFor(parentId: number, direction: 'prev' | 'next'): Promise<void> {
    if (parentId === 0) {
      await switchRootBranch(direction)
    } else {
      await switchChildBranch(parentId, direction)
    }
  }

  /**
   * Switch between root branches
   */
  async function switchRootBranch(direction: 'prev' | 'next'): Promise<void> {
    const rootCount = treeManager.rootNodes.value.length
    if (rootCount <= 1) return

    // Find current root index
    const currentRootId = treeManager.messageTree.value?.id
    const currentIndex = treeManager.rootNodes.value.findIndex((node) => node.id === currentRootId)
    if (currentIndex === -1) return

    // Calculate new index with wraparound
    let newIndex = currentIndex
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + rootCount) % rootCount
    } else {
      newIndex = (currentIndex + 1) % rootCount
    }

    // Get new root node
    const newRootNode = treeManager.rootNodes.value[newIndex]
    treeManager.messageTree.value = newRootNode

    // Find path from new root
    const path = treeManager.findDeepestPath(newRootNode)

    // Update current branch
    treeManager.currentBranch.value = {
      pathIds: path.map((msg) => msg.id),
      messages: path,
      branchPoints: treeManager.currentBranch.value.branchPoints,
    }

    // Update current messages
    treeManager.currentConversationMessages.value = path

    // Update current message ID
    if (path.length > 0) {
      treeManager.currentMessageId.value = path[path.length - 1].id
    }
  }

  /**
   * Switch between child branches
   */
  async function switchChildBranch(parentId: number, direction: 'prev' | 'next'): Promise<void> {
    const children = treeManager.getBranchChildren(parentId)
    if (children.length <= 1) return

    // Find current child
    const currentChild = treeManager.currentConversationMessages.value.find(
      (m) => m.parentId === parentId && treeManager.currentBranch.value.pathIds.includes(m.id)
    )
    if (!currentChild) return

    // Find current index
    const currentIndex = children.findIndex((child) => child.id === currentChild.id)
    if (currentIndex === -1) return

    // Calculate new index with wraparound
    let newIndex = currentIndex
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + children.length) % children.length
    } else {
      newIndex = (currentIndex + 1) % children.length
    }

    // Switch to new branch
    await switchToBranchByChild(parentId, children[newIndex].id)
  }

  /**
   * Switch to a specific child branch
   */
  async function switchToBranchByChild(parentId: number, childId: number): Promise<void> {
    // Find parent index
    const parentIndex = treeManager.currentConversationMessages.value.findIndex((msg) => msg.id === parentId)
    if (parentIndex === -1) return

    // Keep messages up to parent
    treeManager.currentConversationMessages.value = treeManager.currentConversationMessages.value.slice(
      0,
      parentIndex + 1
    )

    // Find child node and build path
    const childNode = treeManager.findNodeById(childId)
    if (!childNode) return

    // Build path from child node
    const buildPath = (node: ChatMessageNode, path: ChatMessage[] = []): ChatMessage[] => {
      path.push({ ...node })
      if (node.children.length === 0) return path

      // Choose first child to continue path
      const sortedChildren = [...node.children].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      return buildPath(sortedChildren[sortedChildren.length - 1], path)
    }

    const newPath = buildPath(childNode)
    treeManager.currentConversationMessages.value = [...treeManager.currentConversationMessages.value, ...newPath]

    // Update current branch path
    const parentPathIndex = treeManager.currentBranch.value.pathIds.indexOf(parentId)
    if (parentPathIndex !== -1) {
      const updatedPathIds = [
        ...treeManager.currentBranch.value.pathIds.slice(0, parentPathIndex + 1),
        ...newPath.map((msg) => msg.id),
      ]

      treeManager.currentBranch.value = {
        ...treeManager.currentBranch.value,
        pathIds: updatedPathIds,
        messages: treeManager.currentConversationMessages.value,
      }
    }

    // Update current message ID
    if (newPath.length > 0) {
      treeManager.currentMessageId.value = newPath[newPath.length - 1].id
    }
  }

  /**
   * Set processing states
   */
  function setProcessingState(processing: boolean, isStreaming: boolean) {
    isProcessingMessage.value = processing
    streaming.value = isStreaming
  }

  return {
    // State
    isProcessingMessage,
    streaming,

    // Methods
    handleBranchFromMessage,
    switchBranchFor,
    setProcessingState,
  }
}
