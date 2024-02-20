import edjsParser from 'editorjs-parser'
import katex from 'katex'

type NestedListItem = {
  content: string
  items: NestedListItem[]
}

type NestedListData = {
  style: 'unordered' | 'ordered'
  items: NestedListItem[]
}

const makeDom = (tag: string, classes: string | string[], attributes: Record<string, any> = {}) => {
  const dom = document.createElement(tag)
  if (Array.isArray(classes)) {
    dom.classList.add(...classes)
  } else {
    dom.classList.add(classes)
  }
  Object.keys(attributes).forEach((key) => {
    Reflect.set(dom, key, attributes[key])
    // dom[key] = attributes[key]
  })
  return dom
}

const addChildrenList = (parent: HTMLElement, items: NestedListItem[], style: 'unordered' | 'ordered') => {
  const itemBody = parent.querySelector('.cdx-nested-list__item-body')!
  const sublistWrapper = makeListWrapper(style, ['cdx-nested-list__item-children'])

  appendItems(sublistWrapper, items, style)

  itemBody.appendChild(sublistWrapper)
}

const createItem = (content: string, items: NestedListItem[], style: 'unordered' | 'ordered') => {
  const itemWrapper = makeDom('li', 'cdx-nested-list__item')
  const itemBody = makeDom('div', 'cdx-nested-list__item-body')
  const itemContent = makeDom('div', 'cdx-nested-list__item-content', { innerHTML: content })

  itemBody.appendChild(itemContent)
  itemWrapper.appendChild(itemBody)

  if (items && items.length > 0) {
    addChildrenList(itemWrapper, items, style)
  }

  return itemWrapper
}

const appendItems = (parent: HTMLElement, items: NestedListItem[], style: 'unordered' | 'ordered') => {
  items.forEach((item) => {
    const itemElement = createItem(item.content, item.items, style)
    parent.appendChild(itemElement)
  })
}

const makeListWrapper = (style: 'unordered' | 'ordered', classes: string[] = []) => {
  const wrapperTag = style === 'unordered' ? 'ul' : 'ol'
  const wrapperStyle = style === 'unordered' ? 'cdx-nested-list--unordered' : 'cdx-nested-list--ordered'
  return makeDom(wrapperTag, ['cdx-nested-list', ...classes, wrapperStyle])
}

const customParsers = {
  math(data: any) {
    return katex.renderToString(data.math, {
      throwOnError: false,
      displayMode: true,
    })
  },
  nestedList(data: NestedListData) {
    const wrapper = makeListWrapper(data.style)

    if (data.items.length > 0) {
      appendItems(wrapper, data.items, data.style)
    } else {
      appendItems(wrapper, [{ content: '', items: [] }], data.style)
    }

    return wrapper.outerHTML
  },
}

const parser = new edjsParser(null, customParsers)

export const parse = (data: any) => {
  return parser.parse(data, customParsers)
}
