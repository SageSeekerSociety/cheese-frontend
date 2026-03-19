<template>
  <v-card flat rounded="lg" class="overview-card">
    <div class="overview-card__label">
      <v-icon size="18" :color="tone">{{ icon }}</v-icon>
      <span>{{ label }}</span>
    </div>
    <div class="overview-card__value">{{ value }}</div>
    <div class="overview-card__helper">{{ helper }}</div>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    value: string | number
    helper: string
    icon?: string
    tone?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  }>(),
  {
    icon: 'mdi-chart-box-outline',
    tone: 'primary',
  }
)
</script>

<style scoped lang="scss">
.overview-card {
  height: 100%;
  padding: 18px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), 1), rgba(var(--v-theme-surface), 0.98));
}

.overview-card__label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 0.92rem;
  font-weight: 500;
}

.overview-card__value {
  margin-top: 12px;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: rgba(var(--v-theme-on-surface), 0.94);
}

.overview-card__helper {
  margin-top: 8px;
  font-size: 0.84rem;
  line-height: 1.55;
  color: rgba(var(--v-theme-on-surface), 0.56);
}
</style>
