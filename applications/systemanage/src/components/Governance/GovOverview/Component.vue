<template>
  <div class="container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/governance/overview' }">{{$t(`Menu['治理集成']`)}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{$t(`common['简介']`)}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b>{{$t(`common['简介']`)}}</b>
            <br>
            <p style="text-align: left;text-indent: 32px;">{{$t(`overview['数据治理与集成是稳定高效的智能驾驶数据前处理方案，致力于提供异构采集数据源之间高速实现数据标准化过程，并构建数据资产地图功能的能力。支持离线、实时、以及两者混合的前处理方案。']`)}}
              </p>
          </div>
          <!-- <div class="info-btn-group">
                        <el-button type="danger" class="info-btn" >治理任务列表</el-button>
                    </div> -->
        </div>
      </div>
      <div class="mid-panel">
        <div class="demo-image__lazy">
          <el-image :src="url" lazy />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight } from "@element-plus/icons-vue"
import { ref } from "vue"

const url = ref(`http://dms${window.server.domain}/icon/default/overview.jpg`)

</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  margin: 0 30px;

  .bread-font {
    font-weight: 700;
  }

  .panel {
    margin-top: 15px;
    flex-grow: 1;
    border: 1px solid transparent;
  }

  .mid-panel {
    display: flex;
    flex-direction: row;

    .demo-image__lazy {
      width: 100%;
      margin-top: 20px;

      .el-image {
        width: 100%;
        padding: 40px;

        img {
          width: 100%;
        }
      }
    }
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

        b {
          display: flex;
        }

        p {
          font-weight: 400;
          margin-top: 2px;
        }
      }

      .info-btn-group {
        flex-grow: 1;
        width: 100px;
        display: flex;
        flex-direction: row-reverse;

        .info-btn {
          margin: 5px;
        }
      }

    }
  }
}
</style>