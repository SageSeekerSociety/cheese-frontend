import type { AssistantMessage, MessagePart } from '@/types/assistant'

type Phase = 'preface' | 'body'

/**
 * ResponseBuilder incrementally aggregates streaming assistant events into a single AssistantMessage.
 */
export class ResponseBuilder {
  private message: AssistantMessage
  private parts: MessagePart[] = []
  private phase: Phase = 'preface'
  private currentTextIndex: number | null = null

  constructor(private readonly update: (message: AssistantMessage) => void, seed: AssistantMessage) {
    this.message = { ...seed, parts: [] }
  }

  start(messageId?: string) {
    if (messageId) {
      this.message = { ...this.message, id: messageId }
    }
    this.message = { ...this.message, isTyping: true }
    this.emit()
  }

  delta(text: string) {
    if (!text) return

    if (this.phase === 'preface') this.phase = 'body'

    if (this.currentTextIndex == null || this.parts[this.currentTextIndex]?.kind !== 'text') {
      this.parts.push({ kind: 'text', text: '', ts: this.now() })
      this.currentTextIndex = this.parts.length - 1
    }

    const current = this.parts[this.currentTextIndex]
    if (current.kind !== 'text') return

    current.text += text
    this.syncFlatContent()
    this.emit()
  }

  thinking(text: string, collapsed = true) {
    if (!text) return
    this.parts.push({ kind: 'thinking', text, collapsed, ts: this.now() })
    this.emit()
  }

  toolCall(name: string, input?: Record<string, any>, id?: string, callId?: string) {
    this.endTextIfAny()
    const toolId = id ?? `${name}-${this.now()}`
    this.parts.push({
      kind: 'tool',
      id: toolId,
      name,
      input,
      status: 'calling',
      phase: this.phase === 'preface' ? 'preface' : 'inline',
      callId,
      ts: this.now(),
    })
    this.emit()
  }

  toolResult(name: string, result?: unknown, callId?: string) {
    for (let i = this.parts.length - 1; i >= 0; i -= 1) {
      const part = this.parts[i]
      if (
        part.kind === 'tool' &&
        part.status === 'calling' &&
        ((callId && part.callId === callId) || (!callId && part.name === name))
      ) {
        part.status = 'success'
        part.result = result
        if (callId && !part.callId) part.callId = callId
        part.ts = this.now()
        this.emit()
        return
      }
    }

    this.parts.push({
      kind: 'tool',
      id: `${name}-${this.now()}`,
      name,
      result,
      status: 'success',
      phase: this.phase === 'preface' ? 'preface' : 'inline',
      callId,
      ts: this.now(),
    })
    this.emit()
  }

  error(text: string) {
    this.endTextIfAny()
    this.parts.push({ kind: 'error', text, ts: this.now() })
    this.message = { ...this.message, isTyping: false }
    this.emit()
  }

  complete(finalText?: string) {
    if (finalText) {
      const existing = this.getFlatText()
      if (finalText.startsWith(existing)) {
        const remainder = finalText.slice(existing.length)
        if (remainder) this.delta(remainder)
      } else if (!existing) {
        this.delta(finalText)
      } else {
        this.replaceText(finalText)
      }
    }

    this.message = { ...this.message, isTyping: false }
    this.emit()
  }

  private replaceText(fullText: string) {
    const ts = this.now()
    this.parts = this.parts.filter((part) => part.kind !== 'text')
    let insertIndex = this.parts.length
    for (let i = this.parts.length - 1; i >= 0; i -= 1) {
      if (this.parts[i].kind === 'tool') {
        insertIndex = i + 1
        break
      }
    }
    this.parts.splice(insertIndex, 0, { kind: 'text', text: fullText, ts })
    this.currentTextIndex = this.parts.findIndex((part) => part.kind === 'text')
    this.syncFlatContent()
  }

  private syncFlatContent() {
    const flat = this.getFlatText()
    this.message = { ...this.message, content: flat }
  }

  private endTextIfAny() {
    this.currentTextIndex = null
  }

  private emit() {
    const meta = {
      toolCount: this.parts.filter((part) => part.kind === 'tool').length,
      hasThinking: this.parts.some((part) => part.kind === 'thinking'),
    }

    const next: AssistantMessage = {
      ...this.message,
      parts: [...this.parts],
      meta,
    }

    this.message = next
    this.update(next)
  }

  private getFlatText() {
    return this.parts
      .filter((part): part is Extract<MessagePart, { kind: 'text' }> => part.kind === 'text')
      .map((part) => part.text)
      .join('')
  }

  private now() {
    return Date.now()
  }
}
