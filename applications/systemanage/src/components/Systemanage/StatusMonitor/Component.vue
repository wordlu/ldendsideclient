<template>
  <div class="container">
    <iframe class="system-monitor" :src="'http://ld.10.86.24.49.nip.io/monitor/d/WqBw1Ef4k/alert-overview?orgId=1&kiosk&refresh=5s&theme=light'" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts" setup>


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