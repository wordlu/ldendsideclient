<script setup lang="ts">
import { dataSetStore } from '@/pinia/dataSet.js';
import { setCameraPosition } from '../../../components/visualization/lib/initThree'
import { watch, ref } from 'vue';

const dataSet = dataSetStore();
const cameraDevices = ref(dataSet.cameraDevices)

watch(()=>dataSet.cameraDevices,(newVal)=>{
  cameraDevices.value = newVal
},{deep:true})

const viewChange = (view: string) => {
  setCameraPosition(view)
}

const setCamera = (camera: any) => {
  dataSet.currentCamera = camera
}
</script>

<template>
  <div id="toolBar">
    <div class="view-btns">
      <div>摄像头：</div>
      <div class="camreas" v-for="camera in cameraDevices" :key="camera.slot">
        <el-button style="margin-right: 6px;" size="small" @click="setCamera(camera)">{{ camera.slot }}</el-button>
      </div>
    </div>
    <div class="view-btns">
      <div style="margin-right: 10px;">视角：</div>
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
  color: #fff;
  font-size: 14px;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  justify-content: flex-end;
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