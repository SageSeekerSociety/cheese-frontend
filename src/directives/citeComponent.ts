// directives/citeComponent.ts
import type { Directive } from 'vue'

import { h, render, VNode } from 'vue'

import CiteChip from '@/components/assistant/CiteChip.vue'

type Props = { source_type?: string; source_id: string; snippet?: string }
const vnodeMap = new WeakMap<Element, VNode>()

function mountOne(el: Element, appContext: any) {
  if (vnodeMap.has(el)) return
  let props: Props | null = null
  try {
    const raw = el.getAttribute('data-cite') || '{}'
    const data = JSON.parse(raw)
    props = { source_type: data?.source_type, source_id: data?.source_id, snippet: data?.snippet }
  } catch {
    /* 忽略 */
  }
  if (!props?.source_id) return

  const vnode = h(CiteChip, {
    sourceType: props.source_type,
    sourceId: props.source_id,
    snippet: props.snippet,
  })
  // 关键：继承主应用的 appContext（包含 Vuetify 插件/主题/图标等）
  vnode.appContext = appContext
  render(vnode, el as HTMLElement)
  vnodeMap.set(el, vnode)
}

function unmountOne(el: Element) {
  if (!vnodeMap.has(el)) return
  render(null, el as HTMLElement)
  vnodeMap.delete(el)
}

export const CiteComponent: Directive = {
  mounted(root, _binding) {
    const appContext = (_binding.instance as any)?.$root?.$?.appContext || (_binding.instance as any)?.$?.appContext
    const enhance = () => {
      root.querySelectorAll('cite-chip').forEach((node: any) => mountOne(node, appContext))
    }
    enhance()

    const mo = new MutationObserver((ms) => {
      for (const m of ms) {
        m.addedNodes.forEach((n) => {
          if (!(n instanceof Element)) return
          if (n.tagName.toLowerCase() === 'cite-chip') mountOne(n, appContext)
          n.querySelectorAll?.('cite-chip')?.forEach((c) => mountOne(c, appContext))
        })
        m.removedNodes.forEach((n) => {
          if (!(n instanceof Element)) return
          if (n.tagName.toLowerCase() === 'cite-chip') unmountOne(n)
          n.querySelectorAll?.('cite-chip')?.forEach((c) => unmountOne(c))
        })
      }
    })
    mo.observe(root, { childList: true, subtree: true })
    ;(root as any).__cite_mo__ = mo
  },
  updated(root, binding) {
    const appContext = (binding.instance as any)?.$root?.$?.appContext || (binding.instance as any)?.$?.appContext
    root.querySelectorAll('cite-chip').forEach((n: any) => mountOne(n, appContext))
  },
  unmounted(root) {
    const mo: MutationObserver | undefined = (root as any).__cite_mo__
    mo?.disconnect()
    root.querySelectorAll('cite-chip').forEach((n: any) => unmountOne(n))
  },
}
