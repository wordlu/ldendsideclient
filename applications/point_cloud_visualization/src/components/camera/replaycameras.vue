<script setup lang="ts">
import { ref, watch } from 'vue';
import { dataSetStore } from '../../pinia/dataSet';
const dataSet = dataSetStore();
const activeCamInfo = ref(dataSet.activeCamInfo);
const showPic = ref(true);
// const loading = ref(false);
const imgOnError = (e) => {
  showPic.value = false
}

watch(()=>dataSet.currentCamera,(newVal)=>{
  // loading.value = true
  showPic.value = true
},{deep:true})

watch(()=>dataSet.activeCamInfo,(newVal)=>{
  // loading.value = false
  showPic.value = true
},{deep:true})

</script>

<template>
  <div id="cameras">
    <div class="cameras-item" v-for="(key,value) in activeCamInfo" :key="value">
      <img v-show="showPic && value === dataSet.currentCamera" :src="key" alt="暂无图片" :onerror="imgOnError" style="width: 100%;">
    </div>
    <div  v-show="showPic" class="text">{{ dataSet.currentCamera }}</div>
  </div>
</template>

<style lang="scss">
#cameras{
  width: 300px;
  min-height: 150px;
  // background: #191919;
  background: #000;
  position: absolute;
  left: 8px;
  top: 8px;
  z-index: 999;
  display: flex;
  flex-wrap: wrap;
  color: #fff;

  .cameras-item{
    width: 100%;
    height: 100%;
    color: aliceblue;
    // box-shadow: 0px 0px 2px 0px rgba(235, 233, 233, 0.2);
    cursor: pointer;
  }

  .text {
    width: 100%;
    text-align: center;
  }
}
</style>