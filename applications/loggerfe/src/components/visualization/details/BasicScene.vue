<template>
  <div id="canvas-box" @click="canvasClick">
    <iframe :src="'/pointcloud/replayvisualization?dataset='+datasetprefix+'&isCollapsedConfig='+isCollapsedConfig+'&currentSelectedSensor='+JSON.stringify(currentSelectedSensor)+'&viewportId='+viewportId" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
  </div>
</template>
 <script setup lang="ts">
import {  defineProps } from 'vue'

const props = defineProps({
  currentSelectedSensor: Array,
  datasetprefix: String,
  isCollapsedConfig: Boolean,
  viewportId: String
});
</script>

<style lang="scss" scoped>
#canvas-box {
  height: 100%;
  background: #000;
  position: relative;
  flex: 1;
}
</style>
