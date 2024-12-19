<template>
  <div class="container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>报告详情</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b class="title">报告详情</b>
          </div>
        </div>
      </div>
    </div>
    <div class="images">
      <div v-for="(image,index) in assets" :key="image.title+index" class="image">
        <div class="title">{{ index+1 }}. {{ image.output_path }}</div>
        <img style="height: auto;margin-top: 10px;" :src="`http://loggertrash/api/kpi/report_assets/${route.params.id}?file=${image.output_path}`" alt="">
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight, Search, ArrowRightBold, ArrowLeftBold, MoreFilled } from "@element-plus/icons-vue"
import gostore from '@/services/governance-store'
import { findAll, deleteItem, findItem, patchItem } from '@/api/jsonApi'
import { ref, onMounted } from "vue"
import { ElTable, ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router';
import { funcReportAssetsGet } from '@/api/api'

const route = useRoute();
const assets = ref([])

const getReportAssets = async () => {
  funcReportAssetsGet({id: route.params.id}).then((res: any) => {
    assets.value = res.data
  })
}
onMounted(() => {
  getReportAssets()
})
</script>

<style lang="scss" scoped>

.container {
  display: flex;
  flex-direction: column;
  margin: 0 30px;

  .panel {
    margin-top: 15px;
    flex-grow: 1;
    border: 1px solid transparent;
  }

  .title-panel {
    background-color: white;
    display: flex;
    flex-direction: row;

    .info {
      padding: 10px;
      width: 100%;
      display: flex;
      flex-direction: row;

      .info-detail {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .title {
          padding: 4px 0;
        }

      }
      
    }
  }

  .images {
    overflow: auto;
    height: calc(100vh - 210px);

    .image {
      margin-top: 20px;

      .title {
        text-align: left;
        font-size: 16px;
      }
    }
  }
}
</style>