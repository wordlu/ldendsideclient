<template>
  <div class="container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>系统环境</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b>系统环境</b>
          </div>
        </div>
      </div>
      <div class="cards">
        <el-row :gutter="8" class="rows">
          <el-col :span="25">
            <el-card shadow="always">
              <div class="title">总CPU</div>
              <div class="content">{{ data.cpus }}</div>
            </el-card>
          </el-col>
          <el-col :span="25">
            <el-card shadow="always">
              <div class="title">总内存</div>
              <div class="content">{{ data.mems }}</div>
            </el-card>
          </el-col>
          <el-col :span="25">
            <el-card shadow="always">
              <div class="title">总存储</div>
              <div class="content">{{ data.storages }}</div>
            </el-card>
          </el-col>
          <el-col :span="25">
            <el-card shadow="always">
              <div class="title">系统版本</div>
              <div class="content">{{ data.sysversion }}</div>
            </el-card>
          </el-col>
          <el-col :span="25">
            <el-card shadow="always">
              <div class="title">产品版本</div>
              <div class="content">{{ data.version }}</div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="8" class="rows">
          <el-col :span="50">
            <el-card shadow="always" v-for="(item, index) in networkInterfaces" :key="index" >
              <el-descriptions :title="'网口设备'+(index+1)" border column="2">
                  <el-descriptions-item label="网卡名称">{{ item.devicename }}</el-descriptions-item>
                  <el-descriptions-item label="网卡类型">{{ item.type }}</el-descriptions-item>
                  <el-descriptions-item label="是否开机启动">{{ item.onboot }}</el-descriptions-item>
                  <el-descriptions-item label="开机方法">{{ item.bootproto }}</el-descriptions-item>
                  <el-descriptions-item label="地址">{{ item.ipaddr }}</el-descriptions-item>
                  <el-descriptions-item label="子网掩码">{{ item.netmask }}</el-descriptions-item>
                  <el-descriptions-item label="网关">{{ item.gateway }}</el-descriptions-item>
                  <el-descriptions-item label="dns">{{ item.dns1 }}</el-descriptions-item>
              </el-descriptions>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight } from "@element-plus/icons-vue"
import { ref, reactive } from "vue"
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'

const data = reactive({})
const networkInterfaces = ref([])

const queryEnvs = () => {
  try {
    findAll('envs', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('envs')
      Object.assign(data, datavalue[0]);
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}

const queryNetworkInterfaces = () => {
  try {
    findAll('network-interfaces', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('network-interfaces')
      networkInterfaces.value = datavalue
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}

queryEnvs()
queryNetworkInterfaces()
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  margin: 0 30px;

  .bread-font {
    font-weight: 700;
  }

  ::v-deep .el-col-25 {
    width: 20%;
  }
  
  ::v-deep .el-col-50 {
    width: 40%;
  }

  .cards {
    .rows {
      margin-bottom: 10px;

      .content {
        color: #2d2f39;
        font-size: 20px;
        font-style: normal;
        font-weight: 600;
      }

      .title {
        font-weight: 600;
        font-size: 18px;
        color: #5a5e72;
        line-height: 20px;
        margin-bottom: 16px;
      }
    }
  }

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