<template>
  <div id="canvas-box" @click="canvasClick">
    <iframe :src="'http://localhost:5173/pointcloud/thumbnailsvisualization?dataset='+datasetprefix+'&deviceshub='+JSON.stringify(devicesHub)" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
  </div>
</template>
 <script setup lang="ts">
import { ref, defineEmits, defineProps, watch, toRef } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
// import { useRoute } from 'vue-router';

// 获取当前路由对象
// const route = useRoute();

const props = defineProps({
  currentSelectedSensor: Array,
  allports: Array,
  datasetprefix: String,
  devicesHub: Array
});

// const currentSelectedSensorRef = toRef(props, 'currentSelectedSensor');

// watch(currentSelectedSensorRef, (newValue, oldValue) => {
//   getDevices(newValue)
// });

// const getString = (arr: any) => {
//   if(!arr) return ''
//   return arr.toString()
// }
</script>

<style lang="scss" scoped>
#canvas-box {
  height: 100%;
  background: #000;
  position: relative;
  flex: 1;
}
</style>
