<script setup lang="ts">
import { setCameraPosition } from '../../../components/visualization/lib/initThree'
const viewChange = (view: string) => {
  setCameraPosition(view)
}
</script>

<template>
  <div id="toolBar">
    <div class="view-btns">
      <el-button circle @click="viewChange('xy')"
        >XY</el-button
      >
      <el-button circle @click="viewChange('xz')"
        >XZ</el-button
      >
      <el-button circle @click="viewChange('yz')"
        >YZ</el-button
      >
    </div>
  </div>
</template>

<style scoped lang="scss">

#toolBar {
  position: absolute;
  right: 10px;
  top: 10px;
}

.view-btns {
  .el-button.is-circle {
      border-radius: 50%;
      padding: 8px;
      width: 32px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid #fff;
      color: #fff;
  }
}

</style>