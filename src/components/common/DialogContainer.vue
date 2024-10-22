<template>
  <div>
    <v-dialog
      v-for="dialog in dialogs"
      :key="dialog.id"
      v-model="dialog.isOpen"
      width="500"
      @update:model-value="onDialogClose(dialog.id, $event)"
    >
      <v-card>
        <v-card-title>{{ dialog.title }}</v-card-title>
        <v-card-text>
          <component :is="dialog.content" v-if="typeof dialog.content === 'function'" />
          <span v-else>{{ dialog.content }}</span>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="dialog.showCancel" @click="onCancel(dialog)">取消</v-btn>
          <v-btn @click="onConfirm(dialog)">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts" setup>
import { dialogs, closeDialog } from '@/plugins/dialog'
import type { DialogInstance } from '@/plugins/dialog'

const onDialogClose = (id: number, isOpen: boolean) => {
  if (!isOpen) {
    closeDialog(id, false)
  }
}

const onConfirm = (dialog: DialogInstance) => {
  const result = dialog.onConfirm ? dialog.onConfirm() : true
  closeDialog(dialog.id, result)
}

const onCancel = (dialog: DialogInstance) => {
  if (dialog.onCancel) {
    dialog.onCancel()
  }
  closeDialog(dialog.id, false)
}
</script>
