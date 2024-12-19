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
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight, Search, ArrowRightBold, ArrowLeftBold, MoreFilled } from "@element-plus/icons-vue"
import gostore from '@/services/governance-store'
import { findAll, deleteItem, findItem, patchItem } from '@/api/jsonApi'
import { ref, onMounted } from "vue"
import { ElTable, ElMessage, ElMessageBox } from 'element-plus'

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
}
</style>