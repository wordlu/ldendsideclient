
<!-- 点云操作区域 -->
<template>
  <div id="toolBar">
    <el-aside
      id="pannel-box"
      ref="asideRef"
      width="560px"
      class="disable-selector">
      <div class="tools pl-0">
        <PcController></PcController>
      </div>
      <!-- <CaliArea></CaliArea> -->
    </el-aside>
  </div>
</template>

<script setup>
import PcController from './pcControllerNoTab.vue' // 预处理和标定tab的上方操作区域 
// import CaliArea from './cali/index.vue' // 标定区域

</script>

<style>

</style>