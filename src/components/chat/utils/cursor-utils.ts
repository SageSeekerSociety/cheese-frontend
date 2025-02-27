// cursor-utils.ts

/**
 * 用于定位光标插入位置的信息
 */
export interface InsertionPoint {
  node: Node
  position: 'append' | 'after' | 'inside'
}

/**
 * 移除元素中的所有闪烁光标
 * @param contentElement 包含内容的元素
 */
export function removeBlinkingCursor(contentElement: HTMLElement): void {
  // 移除任何现有的光标
  const existingCursors = contentElement.querySelectorAll('.input-cursor')
  existingCursors.forEach((cursor) => cursor.remove())
}

/**
 * 在内容的末尾插入一个闪烁光标
 * @param contentElement 包含内容的元素
 * @param isReasoning 是否处于推理模式
 */
export function insertBlinkingCursor(contentElement: HTMLElement, isReasoning: boolean = false): void {
  // 移除任何现有的光标
  removeBlinkingCursor(contentElement)

  // 创建光标元素
  const cursorElement = document.createElement('span')
  cursorElement.className = 'input-cursor' + (isReasoning ? ' reasoning-cursor' : '')

  // 查找插入位置
  const targetInfo = findLastInsertionPoint(contentElement)

  if (targetInfo) {
    const { node, position } = targetInfo

    try {
      if (position === 'append') {
        node.appendChild(cursorElement)
      } else if (position === 'after') {
        node.parentNode?.insertBefore(cursorElement, node.nextSibling)
      } else {
        node.appendChild(cursorElement)
      }
    } catch (error) {
      console.error('插入光标时出错:', error)
      // 如果插入失败，回退到最简单的方式
      contentElement.appendChild(cursorElement)
    }
  } else {
    // 如果没有找到合适的插入点，直接追加到内容元素
    contentElement.appendChild(cursorElement)
  }
}

/**
 * 查找DOM树中最后一个可见元素的最内层位置
 * @param element 要搜索的根元素
 * @returns 光标插入位置信息
 */
export function findLastInsertionPoint(element: Node): InsertionPoint | null {
  // 检查元素是否可见
  const isVisible = (el: HTMLElement): boolean => {
    const style = window.getComputedStyle(el)
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
  }

  // 处理 KaTeX 数学公式
  if (
    element instanceof HTMLElement &&
    (element.classList.contains('katex') || element.classList.contains('katex-display'))
  ) {
    const mathOutput = element.querySelector('.katex-html')
    if (mathOutput) {
      return findLastInsertionPoint(mathOutput)
    }
  }

  // 改进的代码块处理
  if (element instanceof HTMLElement && element.tagName === 'PRE' && element.querySelector('code')) {
    const codeBlock = element.querySelector('code')
    if (codeBlock) {
      // 获取代码块的HTML内容
      const codeHtml = codeBlock.innerHTML

      // 检查是否是完整的代码块
      const isCompletedBlock = codeHtml.endsWith('\n') || codeHtml.trim().endsWith('</span>')

      // 分析代码块的行结构
      const codeLines = Array.from(codeBlock.childNodes).reduce((lines: Node[][], node) => {
        // 新行标记
        if (node.nodeType === Node.TEXT_NODE && node.textContent?.includes('\n')) {
          const textParts = node.textContent.split('\n')

          // 处理每一部分
          textParts.forEach((part, index) => {
            if (index === 0) {
              // 第一部分添加到当前行
              if (lines.length === 0) lines.push([])
              if (part) lines[lines.length - 1].push(document.createTextNode(part))
            } else {
              // 之后的部分开始新行
              lines.push([])
              if (part) lines[lines.length - 1].push(document.createTextNode(part))
            }
          })
        }
        // 处理高亮的token
        else if (node.nodeType === Node.ELEMENT_NODE) {
          // 如果当前没有行，创建一个
          if (lines.length === 0) lines.push([])
          lines[lines.length - 1].push(node)

          // 检查节点内是否有换行
          if (node.textContent?.includes('\n')) {
            // 这里简化处理，只在节点后添加新行
            lines.push([])
          }
        }
        // 普通文本节点
        else {
          if (lines.length === 0) lines.push([])
          lines[lines.length - 1].push(node)
        }

        return lines
      }, [])

      // 过滤掉空行
      const nonEmptyLines = codeLines.filter((line) =>
        line.some((node) => node.textContent && node.textContent.trim() !== '')
      )

      // 如果有非空行
      if (nonEmptyLines.length > 0) {
        const lastLine = nonEmptyLines[nonEmptyLines.length - 1]

        // 获取最后一行的最后一个非空节点
        const lastNodes = lastLine.filter((node) => node.textContent && node.textContent.trim() !== '')

        if (lastNodes.length > 0) {
          const lastNode = lastNodes[lastNodes.length - 1]
          return { node: lastNode, position: 'after' }
        }
      }

      // 如果上面的分析没有找到合适的位置，回退到简单方法

      // 检查是否有 Prism 高亮的 token
      const tokens = codeBlock.querySelectorAll('.token')
      if (tokens.length > 0) {
        // 查找最后一个非空token
        for (let i = tokens.length - 1; i >= 0; i--) {
          if ((tokens[i].textContent ?? '').trim() !== '') {
            return { node: tokens[i], position: 'after' }
          }
        }
      }

      // 回退到最后一个文本节点
      const lastTextNode = findLastTextNode(codeBlock)
      if (lastTextNode) {
        return { node: lastTextNode, position: 'after' }
      }

      // 最终回退：直接追加到代码块
      return { node: codeBlock, position: 'append' }
    }
  }

  // 处理表格 - 完全重写的表格处理逻辑
  if (element instanceof HTMLElement && element.tagName === 'TABLE') {
    return findTableInsertionPoint(element)
  }

  // 处理列表
  if (element instanceof HTMLElement && (element.tagName === 'UL' || element.tagName === 'OL')) {
    // 找到最后一个列表项
    const items = element.querySelectorAll('li')
    if (items.length > 0) {
      const lastItem = items[items.length - 1]
      return findLastInsertionPoint(lastItem)
    }
  }

  // 对于普通元素，遍历子节点
  if (element.hasChildNodes()) {
    // 先收集可见的子节点
    const visibleChildren = []
    for (let i = 0; i < element.childNodes.length; i++) {
      const child = element.childNodes[i]

      // 跳过注释节点
      if (child.nodeType === Node.COMMENT_NODE) {
        continue
      }

      // 跳过不可见元素
      if (child instanceof HTMLElement && !isVisible(child)) {
        continue
      }

      // 跳过空文本节点
      if (child.nodeType === Node.TEXT_NODE && (!child.textContent || child.textContent.trim() === '')) {
        continue
      }

      visibleChildren.push(child)
    }

    // 倒序遍历可见子节点
    for (let i = visibleChildren.length - 1; i >= 0; i--) {
      // 递归查找子元素中的插入点
      const childInsertionPoint = findLastInsertionPoint(visibleChildren[i])
      if (childInsertionPoint) {
        return childInsertionPoint
      }
    }
  }

  // 处理文本节点
  if (element.nodeType === Node.TEXT_NODE && element.textContent && element.textContent.trim() !== '') {
    return { node: element, position: 'after' }
  }

  // 处理不同类型的元素
  if (element instanceof HTMLElement) {
    // 空元素列表（无法包含子元素的元素）
    const voidElements = [
      'AREA',
      'BASE',
      'BR',
      'COL',
      'EMBED',
      'HR',
      'IMG',
      'INPUT',
      'LINK',
      'META',
      'PARAM',
      'SOURCE',
      'TRACK',
      'WBR',
    ]

    if (voidElements.includes(element.tagName)) {
      return { node: element, position: 'after' }
    }

    // 对于空的元素，直接在内部追加
    if (!element.hasChildNodes()) {
      return { node: element, position: 'append' }
    }

    // 默认情况下在元素内部追加
    return { node: element, position: 'append' }
  }

  return null
}

/**
 * 专门处理表格光标位置的函数
 * 这个函数会尝试找到表格中"最可能正在生成内容"的单元格
 * @param tableElement 表格元素
 * @returns 光标插入位置信息或null
 */
export function findTableInsertionPoint(tableElement: HTMLElement): InsertionPoint | null {
  // 1. 获取表格的所有行
  const rows = Array.from(tableElement.querySelectorAll('tr'))
  if (rows.length === 0) return null

  // 2. 逐行检查，找到最后一个有内容的行
  let targetCell = null
  let targetRow = null

  // 从最后一行开始向上查找
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    const cells = Array.from(row.querySelectorAll('td, th'))

    // 检查这一行是否有内容
    const hasContent = cells.some((cell) => cell.textContent && cell.textContent.trim() !== '')

    if (hasContent) {
      targetRow = row

      // 现在找出这一行中最后一个有内容的单元格
      // 先从左到右检查哪些单元格有内容
      const cellsWithContent = cells.filter((cell) => cell.textContent && cell.textContent.trim() !== '')

      if (cellsWithContent.length > 0) {
        // 获取内容单元格数组中的最后一个
        targetCell = cellsWithContent[cellsWithContent.length - 1]
        break
      }
    }
  }

  // 如果找不到有内容的行，使用第一行的第一个单元格
  if (!targetRow && rows.length > 0) {
    const firstRowCells = rows[0].querySelectorAll('td, th')
    if (firstRowCells.length > 0) {
      targetCell = firstRowCells[0]
    }
  }

  // 如果找到了目标单元格
  if (targetCell) {
    // 检查单元格是否有子元素
    if (targetCell.hasChildNodes()) {
      // 递归查找单元格内部最合适的插入点
      const deeperPoint = findLastInsertionPointWithin(targetCell)
      if (deeperPoint) {
        return deeperPoint
      }
    }

    // 如果没有更深的插入点，直接在单元格中插入
    return { node: targetCell, position: 'append' }
  }

  // 最终回退：如果什么都没找到，返回表格元素本身
  return { node: tableElement, position: 'append' }
}

/**
 * 查找元素内部的最后一个可用插入点，不递归到外部元素
 * @param element 要搜索的元素
 * @returns 光标插入位置信息或null
 */
export function findLastInsertionPointWithin(element: Node): InsertionPoint | null {
  if (!element.hasChildNodes()) {
    if (element.nodeType === Node.TEXT_NODE && element.textContent && element.textContent.trim() !== '') {
      return { node: element, position: 'after' }
    } else if (element instanceof HTMLElement) {
      return { node: element, position: 'append' }
    }
    return null
  }

  // 收集所有可见的非空子节点
  const visibleChildren = []
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i]

    // 跳过注释和空文本节点
    if (child.nodeType === Node.COMMENT_NODE) continue
    if (child.nodeType === Node.TEXT_NODE && (!child.textContent || child.textContent.trim() === '')) continue
    if (child instanceof HTMLElement && !isElementVisible(child)) continue

    visibleChildren.push(child)
  }

  // 从最后一个子节点开始查找
  for (let i = visibleChildren.length - 1; i >= 0; i--) {
    const child = visibleChildren[i]

    // 处理文本节点
    if (child.nodeType === Node.TEXT_NODE && child.textContent && child.textContent.trim() !== '') {
      return { node: child, position: 'after' }
    }

    // 对于元素节点，递归查找
    if (child instanceof HTMLElement) {
      const childPoint = findLastInsertionPointWithin(child)
      if (childPoint) {
        return childPoint
      }
    }
  }

  // 如果没有找到合适的子节点，就返回元素本身
  return { node: element, position: 'append' }
}

/**
 * 查找元素中的最后一个非空文本节点
 * @param element 要搜索的元素
 * @returns 最后一个文本节点或 null
 */
export function findLastTextNode(element: Node): Node | null {
  if (element.nodeType === Node.TEXT_NODE && element.textContent && element.textContent.trim() !== '') {
    return element
  }

  if (element.hasChildNodes()) {
    for (let i = element.childNodes.length - 1; i >= 0; i--) {
      const child = element.childNodes[i]

      // 跳过注释节点
      if (child.nodeType === Node.COMMENT_NODE) {
        continue
      }

      // 跳过空文本节点
      if (child.nodeType === Node.TEXT_NODE && (!child.textContent || child.textContent.trim() === '')) {
        continue
      }

      const lastText = findLastTextNode(child)
      if (lastText) {
        return lastText
      }
    }
  }

  return null
}

/**
 * 检查元素是否可见
 */
function isElementVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}
