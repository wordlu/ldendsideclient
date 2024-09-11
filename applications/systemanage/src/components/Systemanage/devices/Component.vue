<template>
  <div class="container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>设备管理</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b class="title">设备管理<span class="count">({{ count }})</span></b>
          </div>
          <div class="info-btn-group">
            <el-button type="primary" class="info-btn" @click="trigger">添加设备</el-button>
          </div>
        </div>
      </div>
      <div class="mid-panel">
        <el-input v-model="search" class="search-bar" placeholder="搜索设备名称" @change="change" @input="change" :prefix-icon="Search" />
        <div class="mid-group">
          <div class="ver-mid">
            <el-button type="text" :disabled="current + 1 >= currentmax" :icon="ArrowRightBold" @click="nextPage" />
          </div>
          <el-text size="large">{{ current + 1 }}</el-text>
          <div class="ver-mid">
            <el-button type="text" :disabled="current === 0" :icon="ArrowLeftBold" @click="prevPage" />
          </div>
        </div>
      </div>
    </div>
    <div class="list">
      <div class="list-panel">
        <el-table ref="multipleTableRef" 
          :data="data" style="width: 100%">
          <el-table-column property="name" label="设备名称" />
          <el-table-column property="brand" label="品牌"/>
          <el-table-column property="model" label="型号"/>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight, Search, ArrowRightBold, ArrowLeftBold } from "@element-plus/icons-vue"
import gostore from '@/services/governance-store'
import { findAll } from '@/api/jsonApi'
import { ref, onMounted } from "vue"
import { ElTable } from 'element-plus'

interface Row {}

const count = ref(0)
const step = ref(10)
const search = ref('')
const current = ref(0)
const currentmax = ref(0)
const data = ref<Row[]>([])

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<Row[]>([])
const isDeleteBtnDisabled = ref<boolean>(true)

const nextPage = () => {
  queryDevice(current.value + 1)
}

const prevPage = () => {
  queryDevice(current.value - 1)
}

onMounted(() => {
  queryDevice(current.value)
})

const trigger = () => {
  window.history.pushState(null, '', `/loggerfe/configs`)
}

const queryDevice = (page: number) => {
  try {
    const params = {
      offset: step.value * page,
      limit: step.value,
      sort: '-created',
      'filter[name][fuzzy-match]': search.value
    }
    findAll('/models/devices', params).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      data.value = gostore.findAll('devices')
      count.value = res.data.meta.count
      current.value = page
      currentmax.value = Math.ceil(count.value / step.value)
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}


const change = () => {
  queryDevice(0)
}

const remove = () => {
  const ids = multipleSelection.value.map(x => x.id)
  console.log(ids)
  try {

  } catch (error) {
    console.log(error)
  }
}
</script>

<style lang="scss" scoped>
.ver-mid {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}

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

    .search-bar {
      max-width: 300px;
      padding: 10px
    }

    .mid-group {
      flex-grow: 1;
      width: 100px;
      display: flex;
      flex-direction: row-reverse;
      margin: 0 15px;

      .el-button--text {
        color: #FF7900;
      }

      .el-button--text.is-disabled {
        color: rgba(255, 121, 0, 0.4);
      }


      button {
        margin: 0 15px
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
        justify-content: center;

        .title {
          padding: 4px 0;
        }

        .count {
          color: #687078;
          margin-left: 4px;
        }

        .desc {
          color: #545b64;
          font-size: 12px;
        }

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

        .el-button--primary {
          background: #FF7900;
          border: none;
        }

        .info-btn {
          margin: 5px;
        }
      }

    }
  }

  .list {
    // height: 100px;
    flex-grow: 1;
    border: 1px solid transparent;

    .list-panel {
      margin: 10px;
    }
  }
}
</style>