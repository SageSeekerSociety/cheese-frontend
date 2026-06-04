<template>
  <div class="d-flex h-100">
    <router-view name="sidebar" />

    <div class="flex-1 w-100 h-100">
      <router-view />
    </div>
  </div>
</template>
