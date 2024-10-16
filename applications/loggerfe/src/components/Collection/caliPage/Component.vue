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
      <iframe src="http://localhost:5174/lidar_cali/lidar" frameborder="0" width="100%" height="100%"></iframe>
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

onMounted(() => {
  queryCalibrationTemplateId()
})

</script>

<style lang="scss" scoped>

.cali-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  .cali-iframe-container {
    margin-top: 20px;
    width: 100%;
    height: calc(100vh - 160px);
  }
}

</style>