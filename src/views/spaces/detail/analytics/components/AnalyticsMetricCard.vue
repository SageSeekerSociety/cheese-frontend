<template>
  <v-card flat rounded="lg" class="metric-card">
    <div class="metric-card__label">{{ label }}</div>
    <div class="metric-card__value">{{ value }}</div>
    <div class="metric-card__foot">
      <span>{{ description }}</span>
      <v-icon size="18" :color="tone">{{ icon }}</v-icon>
    </div>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    description: string
    icon?: string
    tone?: 'primary' | 'success' | 'warning' | 'info'
  }>(),
  {
    icon: 'mdi-arrow-top-right',
    tone: 'primary',
  }
)
</script>

<style scoped lang="scss">
.metric-card {
  height: 100%;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background-color: rgba(var(--v-theme-surface), 1);
}

.metric-card__label {
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.metric-card__value {
  margin-top: 8px;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.metric-card__foot {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  color: rgba(var(--v-theme-on-surface), 0.58);
  font-size: 0.84rem;
}
</style>
