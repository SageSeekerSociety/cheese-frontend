// conversationTree.ts
import type { ChatMessage, ChatMessageNode, ConversationBranch } from '../types'

import { ref } from 'vue'

export function useConversationTree() {
  // Core tree state
  const messageTree = ref<ChatMessageNode | null>(null)
  const rootNodes = ref<ChatMessageNode[]>([])
  const currentBranch = ref<ConversationBranch>({
    pathIds: [],
    messages: [],
    branchPoints: [],
  })

  // Tracking for branches and temporary IDs
  const createdBranches = ref<Map<number, Set<number>>>(new Map())
  const tempIdMapping = ref<Map<number, number>>(new Map())

  // Current state refs
  const currentMessageId = ref<number | null>(null)
  const currentConversationMessages = ref<ChatMessage[]>([])

  /**
   * Build a message tree from flat message list
   */
  function buildMessageTree(messages: ChatMessage[]): ChatMessageNode | null {
    if (!messages.length) return null

    // Create ID to message mapping
    const messageMap = new Map<number, ChatMessageNode>()
    messages.forEach((msg) => {
      messageMap.set(msg.id, { ...msg, children: [] })
    })

    // Reset root nodes
    rootNodes.value = []

    // Build tree structure
    messages.forEach((msg) => {
      const node = messageMap.get(msg.id)!
      if (!msg.parentId) {
        rootNodes.value.push(node)
      } else {
        const parent = messageMap.get(msg.parentId)
        if (parent) {
          parent.children.push(node)
          // Record branch relationship
          recordBranch(msg.parentId, msg.id)
        }
      }
    })

    // Sort root nodes by creation time
    if (rootNodes.value.length > 0) {
      rootNodes.value.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      return rootNodes.value[rootNodes.value.length - 1]
    }

    return null
  }

  /**
   * Record a branch relationship between parent and child
   */
  function recordBranch(parentId: number, childId: number): void {
    if (!createdBranches.value.has(parentId)) {
      createdBranches.value.set(parentId, new Set())
    }

    const childrenSet = createdBranches.value.get(parentId)!
    childrenSet.add(childId)

    // 只有当一个父节点有多个子节点时，才将其添加到分支点
    if (childrenSet.size > 1 && parentId && !currentBranch.value.branchPoints.includes(parentId)) {
      currentBranch.value.branchPoints.push(parentId)
    }
  }

  /**
   * Update temporary ID to permanent ID mapping
   */
  function updateIdMapping(tempId: number, realId: number): void {
    tempIdMapping.value.set(tempId, realId)

    // Update references in createdBranches
    createdBranches.value.forEach((children, parentId) => {
      if (children.has(tempId)) {
        children.delete(tempId)
        children.add(realId)
      }

      // Handle case where parent ID is also temporary
      if (tempIdMapping.value.has(parentId)) {
        const realParentId = tempIdMapping.value.get(parentId)!
        if (parentId !== realParentId) {
          if (!createdBranches.value.has(realParentId)) {
            createdBranches.value.set(realParentId, new Set())
          }
          children.forEach((childId) => {
            createdBranches.value.get(realParentId)?.add(childId)
          })
        }
      }
    })

    // Update references in current branch path
    const pathIndex = currentBranch.value.pathIds.indexOf(tempId)
    if (pathIndex !== -1) {
      currentBranch.value.pathIds[pathIndex] = realId
    }

    // Update branch points array
    const branchPointIndex = currentBranch.value.branchPoints.indexOf(tempId)
    if (branchPointIndex !== -1) {
      currentBranch.value.branchPoints[branchPointIndex] = realId
    }

    // Update tree nodes (using optimized findAndUpdateNode)
    if (messageTree.value) {
      findAndUpdateNode(messageTree.value, tempId, (node) => {
        node.id = realId
      })
    }

    // Update root nodes
    const rootNodeIndex = rootNodes.value.findIndex((node) => node.id === tempId)
    if (rootNodeIndex !== -1) {
      rootNodes.value[rootNodeIndex].id = realId
    }

    // Update current message ID if needed
    if (currentMessageId.value === tempId) {
      currentMessageId.value = realId
    }

    // Update current conversation messages
    const msgIndex = currentConversationMessages.value.findIndex((m) => m.id === tempId)
    if (msgIndex !== -1) {
      currentConversationMessages.value[msgIndex].id = realId
    }
  }

  /**
   * Find branch points (nodes with multiple children)
   */
  function findBranchPoints(messages: ChatMessage[]): number[] {
    const branchPoints = new Set<number>()

    // Use a single pass approach for efficiency
    const childCount = new Map<number, number>()

    // Count children from messages
    messages.forEach((msg) => {
      if (msg.parentId) {
        childCount.set(msg.parentId, (childCount.get(msg.parentId) || 0) + 1)
      }
    })

    // Add nodes with multiple children
    childCount.forEach((count, parentId) => {
      if (count > 1) branchPoints.add(parentId)
    })

    // Add known branch points from createdBranches
    createdBranches.value.forEach((children, parentId) => {
      if (children.size > 1) branchPoints.add(parentId)
    })

    return Array.from(branchPoints)
  }

  /**
   * Find and update a node in the tree using callback
   * More efficient than finding and then updating separately
   */
  function findAndUpdateNode(
    rootNode: ChatMessageNode,
    targetId: number,
    updateFn: (node: ChatMessageNode) => void
  ): boolean {
    if (rootNode.id === targetId) {
      updateFn(rootNode)
      return true
    }

    for (const child of rootNode.children) {
      if (findAndUpdateNode(child, targetId, updateFn)) {
        return true
      }
    }

    return false
  }

  /**
   * Find a node in the tree by ID
   * Uses memoization for efficiency
   */
  const nodeCache = new Map<number, ChatMessageNode>()
  function findNodeById(id: number): ChatMessageNode | null {
    // Check cache first
    if (nodeCache.has(id)) return nodeCache.get(id)!

    // Check for mapped ID
    const targetId = tempIdMapping.value.get(id) || id

    if (!messageTree.value) return null

    // Traverse tree to find node
    const traverseAndFind = (node: ChatMessageNode): ChatMessageNode | null => {
      if (node.id === targetId) return node
      for (const child of node.children) {
        const result = traverseAndFind(child)
        if (result) return result
      }
      return null
    }

    const node = traverseAndFind(messageTree.value)
    if (node) nodeCache.set(id, node)
    return node
  }

  /**
   * Get children of a node by parent ID
   */
  function getBranchChildren(parentId: number): ChatMessageNode[] {
    const targetId = tempIdMapping.value.get(parentId) || parentId
    const parentNode = findNodeById(targetId)

    if (!parentNode?.children?.length) return []

    // Sort children by creation time
    return [...parentNode.children].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  /**
   * Find the deepest path from a node
   */
  function findDeepestPath(node: ChatMessageNode): ChatMessage[] {
    const path: ChatMessage[] = []

    // Non-recursive implementation to avoid call stack issues with very deep trees
    let current: ChatMessageNode | null = node

    while (current) {
      path.push({ ...current })

      if (current.children.length === 0) break

      // Get most recent child
      const sortedChildren = [...current.children].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )

      current = sortedChildren[sortedChildren.length - 1]
    }

    return path
  }

  /**
   * Clear all tree-related state
   */
  function resetTreeState() {
    messageTree.value = null
    rootNodes.value = []
    currentBranch.value = {
      pathIds: [],
      messages: [],
      branchPoints: [],
    }
    createdBranches.value = new Map()
    tempIdMapping.value = new Map()
    currentMessageId.value = null
    currentConversationMessages.value = []
    nodeCache.clear()
  }

  /**
   * Check if a message is a branch point
   */
  function isBranchPoint(message: ChatMessage): boolean {
    if (!message.parentId) {
      // 根消息仅当有多个根节点时才是分支点
      return rootNodes.value.length > 1
    }

    // 检查父消息是否有多个子分支
    const parentId = message.parentId
    const hasMultipleBranches =
      createdBranches.value.has(parentId) && (createdBranches.value.get(parentId)?.size || 0) > 1

    // 仅当父消息是已知的分支点且真正有多个子节点时才返回true
    return currentBranch.value.branchPoints.includes(parentId) && hasMultipleBranches
  }

  /**
   * Get branch count for a message
   */
  function getBranchCount(message: ChatMessage): number {
    if (!message.parentId) {
      return rootNodes.value.length
    }

    const parentId = message.parentId
    // 只有当父节点确实是分支点且有多个子节点时才返回实际数量
    if (currentBranch.value.branchPoints.includes(parentId)) {
      const branchSet = createdBranches.value.get(parentId)
      const knownBranchCount = branchSet ? branchSet.size : 0

      // 如果只有一个分支，返回1
      if (knownBranchCount <= 1) return 1

      const children = getBranchChildren(parentId)
      return Math.max(children.length, knownBranchCount)
    }

    return 1
  }

  /**
   * Get branch index for a message
   */
  function getBranchIndex(message: ChatMessage): number {
    if (!message.parentId) {
      if (rootNodes.value.length <= 1) return 1

      const currentRootId = messageTree.value?.id
      const index = rootNodes.value.findIndex((node) => node.id === currentRootId)
      return index === -1 ? 1 : index + 1
    }

    const parentId = message.parentId

    // 如果父节点没有多个分支，始终返回1
    if (!isBranchPoint(message)) {
      return 1
    }

    const children = getBranchChildren(parentId)
    if (children.length === 0) return 1

    const index = children.findIndex((child) => child.id === message.id)
    return index === -1 ? children.length + 1 : index + 1
  }

  /**
   * Initialize tree with messages from API
   */
  function initializeTreeFromMessages(messages: ChatMessage[]) {
    // Clear cache when loading new data
    nodeCache.clear()

    // Build message tree
    messageTree.value = buildMessageTree(messages)

    // Calculate branch points
    const branchPoints = findBranchPoints(messages)

    // Find deepest path
    if (messageTree.value) {
      const path = findDeepestPath(messageTree.value)
      currentBranch.value = {
        pathIds: path.map((msg) => msg.id),
        messages: path,
        branchPoints,
      }
      currentConversationMessages.value = path

      // Update current message ID
      if (path.length > 0) {
        currentMessageId.value = path[path.length - 1].id
      }
    } else {
      currentBranch.value = {
        pathIds: messages.map((msg) => msg.id),
        messages,
        branchPoints,
      }
      currentConversationMessages.value = messages

      // Update current message ID
      if (messages.length > 0) {
        currentMessageId.value = messages[messages.length - 1].id
      }
    }
  }

  return {
    // State
    messageTree,
    rootNodes,
    currentBranch,
    createdBranches,
    tempIdMapping,
    currentMessageId,
    currentConversationMessages,

    // Methods
    buildMessageTree,
    recordBranch,
    updateIdMapping,
    findBranchPoints,
    findNodeById,
    getBranchChildren,
    findDeepestPath,
    resetTreeState,
    isBranchPoint,
    getBranchCount,
    getBranchIndex,
    initializeTreeFromMessages,
  }
}
