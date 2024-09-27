<template>
  <div class="container">
    <iframe class="system-monitor" :src="`/monitor/d/WqBw1Ef4k/alert-overview?orgId=1&kiosk&refresh=5s&theme=light`" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
const monitorPrefix = ref(window.server.monitorPrefix)
console.log(monitorPrefix.value,'window.server.monitorPrefix')
</script>

<style lang="scss" scoped>

.form-area {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  margin-left: 20px;
}

.system-monitor {
  width: 100%;
  height: calc(100vh - 140px);
}

</style>