<script setup>
import { ref } from 'vue';
import { dataSetStore } from '../../pinia/dataSet';
const dataSet = dataSetStore();
const activeCamInfo = ref(dataSet.activeCamInfo);

const cutActiveCam = (value)=>{
  dataSet.activeCam.cam = value
  dataSet.activeCam.value = dataSet.activeCamInfo[value]
}
</script>

<template>
  <div id="cameras">
    <div class="cameras-item" v-for="(key,value) in activeCamInfo" :key="value" @click="cutActiveCam(value)">
      <img :src="key" style="width: 100%;">
    </div>
  </div>
</template>

<style lang="scss">
#cameras{
  width: 300px;
  // height: 250px;
  // background: #191919;
  background: #000;
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 999;
  display: flex;
  flex-wrap: wrap;
  .cameras-item{
    width: 100%;
    height: 100%;
    color: aliceblue;
    // box-shadow: 0px 0px 2px 0px rgba(235, 233, 233, 0.2);
    cursor: pointer;
  }
}
</style>