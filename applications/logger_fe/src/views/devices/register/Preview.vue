<template>
  <div class="preview"><DeviceConfig /></div>
</template>

<script setup lang="ts">
import DeviceConfig from '@/views/devices/DeviceConfig.vue'
</script>

<style scoped>
.preview {
  background: #021a33;
  height: 100%;
  overflow: auto;
  padding: 1rem;
}
</style>

<style>
.el-form-item__label {
  word-break: break-all;
}
</style>
