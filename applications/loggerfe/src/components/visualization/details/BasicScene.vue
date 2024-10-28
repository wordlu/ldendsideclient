<template>
  <div id="canvas-box" @click="canvasClick">
    <iframe :src="'/pointcloud/thumbnailsvisualization?dataset='+datasetprefix+'&deviceshub='+JSON.stringify(devicesHub)+'&cloudpointparams='+JSON.stringify(cloudpointparams)+'&isCollapsedConfig='+isCollapsedConfig" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
  </div>
</template>
 <script setup lang="ts">
import { ref, defineEmits, defineProps, watch, toRef } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'

const props = defineProps({
  currentSelectedSensor: Array,
  allports: Array,
  datasetprefix: String,
  devicesHub: Array,
  cloudpointparams: Object,
  isCollapsedConfig: Boolean
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
