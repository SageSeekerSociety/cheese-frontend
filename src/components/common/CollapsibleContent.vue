<template>
  <div class="collapse-container">
    <div
      ref="contentDiv"
      v-mutate.attr.sub.child.char.immediate="onContentMutation"
      class="collapse-content"
      :style="contentDivStyles"
    >
      <slot></slot>
    </div>

    <div v-if="shouldShowBtn" class="collapse-button-container" @click="show = true">
      <slot name="button">
        <v-btn variant="plain" block :ripple="false" prepend-icon="mdi-chevron-down" class="collapse-button">
          {{ t('questions.detail.buttons.showAll') }}
        </v-btn>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  maxHeight: number
}>()

const { maxHeight } = toRefs(props)

const show = defineModel<boolean>({
  default: false,
})

const contentHeightNotEnough = ref(false)

const contentDiv = ref<HTMLElement | null>(null)
const contentHeight = ref(0)
const onContentMutation = () => {
  if (!contentDiv.value) return
  console.log('onContentMutation', contentDiv.value.scrollHeight)
  contentHeight.value = contentDiv.value.scrollHeight
  contentHeightNotEnough.value = contentHeight.value <= maxHeight.value
}

const shouldShowBtn = computed(() => !show.value && !contentHeightNotEnough.value)

const contentDivStyles = computed(() => ({
  maxHeight: show.value || contentHeightNotEnough.value ? `${contentHeight.value}px` : `${maxHeight.value}px`,
}))
</script>

<style lang="scss" scoped>
.collapse-container {
  position: relative;

  .collapse-content {
    overflow: hidden;
    position: relative;
    transition: max-height 0.3s;
  }

  .collapse-button-container {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding-top: 64px;
    background: linear-gradient(rgba(var(--v-theme-background), 0), rgba(var(--v-theme-background), 1));
    opacity: 0.75;
    transition: all 0.3s;
    cursor: pointer;
    text-align: center;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
