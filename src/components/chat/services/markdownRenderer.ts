import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'

import markedKatex from './katexExt'

/**
 * Markdown渲染服务 - 提供安全的Markdown渲染，支持代码高亮和LaTeX
 */
export class MarkdownRenderer {
  private marked: Marked

  constructor() {
    this.marked = new Marked(
      markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
          const language = hljs.getLanguage(lang) ? lang : 'plaintext'
          return hljs.highlight(code, { language }).value
        },
      }),
      markedKatex({ strict: 'ignore' })
    )
    this.marked.setOptions({
      breaks: true,
      gfm: true,
    })
  }

  /**
   * 渲染Markdown文本为安全的HTML
   */
  render(text: string): string {
    if (!text) return ''

    try {
      // 使用 marked 将 Markdown 转换为 HTML
      const rawHtml = this.marked.parse(text, { async: false })

      const sanitizedHtml = DOMPurify.sanitize(rawHtml)

      // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
      return sanitizedHtml
    } catch (error) {
      console.error('Markdown渲染错误:', error)
      return `<p class="text-error">渲染错误: ${text}</p>`
    }
  }
}
