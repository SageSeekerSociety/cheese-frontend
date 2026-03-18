import DOMPurify from 'dompurify'
import { Marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import Prism from 'prismjs'

import markedKatex from './katexExt'

const citeExtension = {
  name: 'cite',
  level: 'inline',
  start(src: string) {
    return src.indexOf('CITE[') // 仅用于加速，返回 >=0 才尝试 tokenizer
  },
  tokenizer(src: string) {
    // 仅匹配单个对象：CITE[{...}]；跨行匹配
    const rule = /^CITE\[(\{[\s\S]*?\})\]/
    const match = rule.exec(src)
    if (!match) return
    try {
      const data = JSON.parse(match[1])
      return {
        type: 'cite',
        raw: match[0],
        data, // 会传给 renderer
      }
    } catch {
      return // JSON 未闭合或不合法时，留给后续增量渲染再匹配
    }
  },
  renderer(token: any) {
    const json = JSON.stringify(token.data).replace(/"/g, '&quot;')
    return `<cite-chip data-cite="${json}"></cite-chip>`
  },
}

/**
 * Markdown渲染服务 - 提供安全的Markdown渲染，支持代码高亮和LaTeX
 */
export class MarkdownRenderer {
  private marked: Marked

  constructor() {
    this.marked = new Marked(
      markedHighlight({
        highlight(code, lang) {
          if (Prism.languages[lang]) {
            return Prism.highlight(code, Prism.languages[lang], lang)
          } else {
            return code
          }
        },
      }),
      markedKatex({ strict: 'ignore' })
    )
    this.marked.use({ extensions: [citeExtension] })
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

      const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
        ADD_TAGS: ['cite-chip'],
        ADD_ATTR: ['data-cite', 'source-type', 'source-id', 'snippet'],
      })

      // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
      return sanitizedHtml
    } catch (error) {
      console.error('Markdown渲染错误:', error)
      return `<p class="text-error">渲染错误: ${text}</p>`
    }
  }
}
