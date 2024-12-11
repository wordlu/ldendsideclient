<template>
  <div id="canvas-box">
    <div class="iframe-item">
      <div class="select-item">
        <el-select
          @change="handleSelect1Change"
          v-model="value1"
          :disabled="testDevice"
          placeholder="请选择"
          size="small"
          style="width: 240px;height: 24px;"
        >
          <el-option
            v-for="item in options1"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <!-- <iframe :src="'http://localhost:5173/pointcloud/realvisualization?allports='+JSON.stringify(allports)+'&portarray='+getString(currentSelectedSensor)+'&cloudpointparams='+JSON.stringify(cloudpointparams)" width="100%" height="100%" allowfullscreen ameborder="0"></iframe> -->
      <iframe :src="'/pointcloud/realvisualization?allports='+JSON.stringify(allports)+'&portarray='+(testDevice ? portarray1 : '')+'&cloudpointparams='+JSON.stringify(cloudpointparams)" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
    </div>
    <div class="iframe-item">
      <div class="select-item">
        <el-select
          v-model="value2"
          :disabled="testDevice"
          @change="handleSelect2Change"
          placeholder="请选择"
          size="small"
          style="width: 240px;height: 24px;"
        >
          <el-option
            v-for="item in options2"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <!-- <iframe :src="'http://localhost:5173/pointcloud/realvisualization?allports='+JSON.stringify(allports)+'&portarray='+getString(currentSelectedSensor)+'&cloudpointparams='+JSON.stringify(cloudpointparams)" width="100%" height="100%" allowfullscreen ameborder="0"></iframe> -->
      <iframe :src="'/pointcloud/realvisualization?allports='+JSON.stringify(allports)+'&portarray='+(testDevice ? portarray2 : '')+'&cloudpointparams='+JSON.stringify(cloudpointparams)" width="100%" height="100%" allowfullscreen ameborder="0"></iframe>
    </div>
  </div>
</template>
 <script setup lang="ts">
import { ref, defineEmits, defineProps, watch, toRef, emit } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'

const props = defineProps({
  currentSelectedSensor: Array,
  allports: Array,
  cloudpointparams: Object,
  viewports: Array,
  runningDevice: Array,
  testDevice: Boolean
});

const options1 = ref([])
const options2 = ref([])
const options = ref([])
const value1 = ref('')
const value2 = ref('')
const portarray1 = ref('')
const portarray2 = ref('')
const viewportsdata = ref({})
const emit = defineEmits(['select']);
const getString = (arr: any) => {
  if(!arr) return ''
  return arr.toString()
}

const getlidarDevice = (viewports: any) => {
  viewportsdata.value = viewports[0] ? viewports[0] : {}
  const lidardevice = viewports[0] ? viewports[0]['device-hub'].filter((item: any) => item.type === 'lidar') : []
  options.value = lidardevice.map((item: any) => {
    return {
      value: item.id,
      label: item.name
    }
  })
  options1.value = options.value
  options2.value = options.value
}

const handleSelect1Change = (value: string) => {
  emit('selectDevice', 'select1', value)
}
const handleSelect2Change = (value: string) => {
  emit('selectDevice', 'select2', value)
}

watch(() => value1.value, (newVal) => {
  options2.value = options.value.filter((item: any) => item.value !== value1.value)
  const data1 = viewportsdata.value.devices.filter(it => it.id.indexOf(value1.value) > -1)
  portarray1.value = getString(data1.map((item: any) => item['display-port']))
},{ deep: true })

watch(() => value2.value, (newVal) => {
  options1.value = options.value.filter((item: any) => item.value !== value2.value)
  const data2 = viewportsdata.value.devices.filter(it => it.id.indexOf(value2.value) > -1)
  portarray2.value = getString(data2.map((item: any) => item['display-port']))
},{ deep: true })

watch(() => props.viewports, (newVal) => {
  getlidarDevice(newVal)
},{ deep: true })

watch(() => props.runningDevice, (newVal) => {
  if (newVal.length < 2) return;
  value1.value = newVal[0]['deviceKey']
  value2.value = newVal[1]['deviceKey']
  
},{ deep: true })

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

<style lang="scss">
.el-input--small .el-input__inner {
  height: 24px;
  line-height: 24px
}
  
</style>
