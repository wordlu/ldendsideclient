<template>
  <div class="point">
    <!-- 可视化点云场景类 -->
    <BasicScene />

    <!-- 点云控制区域 -->
    <DisplayPanel />
  </div>
</template>
<script setup lang="ts">
import BasicScene from './components/BasicScene.vue'
import DisplayPanel from './components/DisplayPanel.vue'

// 是否全屏展示操作面板
// const showPanel = ref<boolean>(true)
</script>

<style scoped lang="scss">
.point {
  display: flex;
  height: 100%;
}
</style>
