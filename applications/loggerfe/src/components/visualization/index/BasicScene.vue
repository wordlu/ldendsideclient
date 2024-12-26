<template>
  <div id="canvas-box">
    <div class="iframe-item">
      <div class="select-item">
        <el-select
          clearable
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
          clearable
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
  const lidardevice = viewports[0] ? viewports[0]['devices'].filter((item: any) => item.type === 'lidar') : []
  options.value = lidardevice.map((item: any) => {
    return {
      value: item.id,
      label: item.slot
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

const updateOptionsAndPortArray = (value: string, type: string) => {
  const data = viewportsdata.value.devices.filter(it => it.id.indexOf(value) > -1)
  const portArrayValue = getString(data.map((item: any) => item['display-port']))
  const optionsValue = options.value.filter((item: any) => item.value !== value)
  if (type === 'value1') {
    portarray1.value = portArrayValue
    options2.value = optionsValue
  } else {
    portarray2.value = portArrayValue
    options1.value = optionsValue
  }
}

watch(() => value1.value, (newVal) => {
  updateOptionsAndPortArray(newVal, 'value1')
},{ deep: true })

watch(() => value2.value, (newVal) => {
  updateOptionsAndPortArray(newVal, 'value2')
},{ deep: true })

watch(() => props.viewports, (newVal) => {
  getlidarDevice(newVal)
},{ deep: true })

watch(() => props.runningDevice, (newVal) => {
  if (newVal.length < 2) return;
  value1.value = newVal[0]['deviceKey']
  value2.value = newVal[1]['deviceKey']
  
},{ deep: true })

defineExpose({
  value1,value2
})
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
