<!-- 标定流程 -->
<template>
  <div class="cali-container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/systemanage/storages' }">存储管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/loggerfe/datasetdetail/' + $route.params.datasetid }">{{ $route.params.datasetid }}</el-breadcrumb-item>
      <el-breadcrumb-item>{{ calibrationTemplateName }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="cali-iframe-container">
      <iframe :src="`/pointcloud/calivisualization?datasetid=${$route.params.datasetid}&devicename=${$route.query.devicename}&dataset=${datasetData.prefix}&deviceshub=${JSON.stringify(devicehub)}&cloudpointparams=${JSON.stringify(cloudpointparams)}`" frameborder="0" width="100%" height="100%"></iframe>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { addItem, findAll, deleteItem, findItem } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import { useRoute } from 'vue-router';

// 获取当前路由对象
const route = useRoute();

const cloudpointparams = ref({
  color: "00ffff",
  size: 0.01,
})

const calibrationTemplateName = ref('')
const queryCalibrationTemplateId = (page: number) => {
  try {
    findItem(`/sys/calibration-templates`, route.params.calitemplateid).then((res: any) => {
      gostore.reset()
      const data = gostore.sync(res.data)
      calibrationTemplateName.value = data.name
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}

//iframe参数：所有端口
const allports = ref([])
const devicehub = ref([])
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {include: 'devices', 'filter[using]': true}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      devicehub.value = datavalue[0]['device-hub']
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const datasetData = ref({})
const deviceids = ref([])
const datasetprefix = ref('')
const getDatasetDetails = () => {
  try {
    findItem('/models/datasets', route.params.datasetid).then((res: any) => {
      gostore.reset()
      datasetData.value = gostore.sync(res.data)
      getDevices()
    }).catch((err: any) => {
      console.error(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const getDevices = () => {
  deviceids.value = datasetData.value.devices
  queryCurrentDrivers()
}

onMounted(() => {
  getDatasetDetails()
  queryCalibrationTemplateId()
})

</script>

<style lang="scss" scoped>

.cali-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;

  .cali-iframe-container {
    margin-top: 20px;
    width: 100%;
    height: calc(100vh - 160px);
  }
}

</style>