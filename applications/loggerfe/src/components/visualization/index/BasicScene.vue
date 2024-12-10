<template>
  <div id="canvas-box">
    <div class="iframe-item">
      <div class="select-item">
        <el-select
          v-model="value1"
          placeholder="请选择"
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <iframe :src="'http://localhost:5173/pointcloud/realvisualization?allports='+JSON.stringify(allports)+'&portarray='+getString(currentSelectedSensor)+'&cloudpointparams='+JSON.stringify(cloudpointparams)" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
    </div>
    <div class="iframe-item">
      <div class="select-item">
        <el-select
          v-model="value2"
          placeholder="请选择"
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <iframe :src="'http://localhost:5173/pointcloud/realvisualization?allports='+JSON.stringify(allports)+'&portarray='+getString(currentSelectedSensor)+'&cloudpointparams='+JSON.stringify(cloudpointparams)" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
    </div>
  </div>
</template>
 <script setup lang="ts">
import { ref, defineEmits, defineProps, watch, toRef } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'

const props = defineProps({
  currentSelectedSensor: Array,
  allports: Array,
  cloudpointparams: Object,
  viewports: Array
});

const getString = (arr: any) => {
  if(!arr) return ''
  return arr.toString()
}

const getlidarDevice = (viewports: any) => {
  const lidardevice = viewports[0] ? viewports[0]['device-hub'].filter((item: any) => item.type === 'lidar') : []
  options.value = lidardevice.map((item: any) => {
    return {
      value: item.id,
      label: item.name
    }
  })
}

const options = ref([])

const value1 = ref('')
const value2 = ref('')


watch(() => props.viewports, (newVal) => {
  getlidarDevice(newVal)
},{immediate: true})


</script>

<style lang="scss" scoped>
#canvas-box {
  height: 100%;
  // background: #000;
  position: relative;
  display: flex;
  flex: 1;

  .iframe-item {
    flex: 1;
    margin: 0 2px;
    border-radius: 4px;
    overflow: hidden;

    .select-item {
      margin-bottom: 18px;
      display: flex;
    }
  }

  iframe {
    flex: 1;
    border: 0;
    width: 100%;
    height: 100%;
    border-radius: 4px;
  }
}
</style>
