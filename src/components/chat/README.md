# Universal Chat Dialog Component

This is a universal chat dialog component system that can adapt to different chat API services, used for displaying chat conversation interfaces.

## Features

- Responsive interface, adapts to desktop and mobile devices
- Support for streaming responses
- Support for displaying reasoning processes
- Support for multiple conversation management
- Support for Markdown and LaTeX rendering
- Support for code highlighting
- Support for follow-up question recommendations

## Component Architecture

- `ChatDialog.vue`: Main dialog component
- `ChatMessage.vue`: Message display component
- `ChatInput.vue`: Input component
- `ChatConversationsList.vue`: Conversation list component
- `types.ts`: Type definition file
- `services/`: Services directory
  - `markdownRenderer.ts`: Markdown rendering service
  - `taskAIAdviceChatService.ts`: Task AI advice chat service (example adapter)

## Usage

### 1. Basic Usage

```vue
<template>
  <div>
    <v-btn @click="showChat = true">Open Chat</v-btn>

    <ChatDialog
      v-model="showChat"
      :context-id="taskId"
      :context="taskContext"
      :chat-service="chatService"
      title="AI Assistant"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ChatDialog, TaskAIAdviceChatService } from '@/components/chat'

// Dialog state
const showChat = ref(false)
const taskId = ref(123) // Task ID
const taskContext = ref({
  title: 'Task Title',
  description: 'Task Description',
  // ... other task data
})

// Create chat service
const chatService = new TaskAIAdviceChatService()
</script>
```

### 2. Adapting to Other APIs

To adapt to other chat APIs, create a class that implements the `ChatService` interface:

```typescript
import type { ChatService, ChatStreamOptions } from '@/components/chat'

export class CustomChatService implements ChatService {
  // Get conversation list
  async getConversations(contextId: number | string) {
    // Implement logic to get conversation list
    return []
  }

  // Get specific conversation
  async getConversationById(contextId: number | string, conversationId: string) {
    // Implement logic to get specific conversation
    return []
  }

  // Stream conversation request
  streamConversation(options: ChatStreamOptions) {
    // Implement streaming conversation logic
    return {
      close: () => {
        // Implement logic to close the stream
      },
    }
  }
}
```

## Markdown Rendering

The component has built-in Markdown rendering support, which can directly process Markdown text:

```typescript
import { MarkdownRenderer } from '@/components/chat'

const markdownRenderer = new MarkdownRenderer()
const html = markdownRenderer.render('# Title\nThis is **bold** text')
```
