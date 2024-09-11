<template>
  <div class="container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item :to="{ path: '/governance/overview' }">{{$t(`Menu['治理集成']`)}}</el-breadcrumb-item>
      <el-breadcrumb-item>{{$t(`Menu['治理任务']`)}}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b class="title">{{$t(`Menu['治理任务']`)}}<span class="count">({{ count }})</span></b>
          </div>
          <div class="info-btn-group">
            <el-button type="info" plain class="info-btn" @click="queryGovTasksData(0)">{{$t(`common['刷新']`)}}</el-button>
            <el-button type="primary" class="info-btn" @click="trigger">{{$t(`overview['手动触发']`)}}</el-button>
          </div>
        </div>
      </div>
      <div class="mid-panel">
        <el-input v-model="search" class="search-bar" :placeholder="$t(`overview['搜索任务名称']`)" @change="change" @input="change" :prefix-icon="Search" />
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
          :data="data" style="width: 100%" 
          @selection-change="handleSelectionChange" 
          :show-overflow-tooltip="true">
          <el-table-column type="selection" width="55" />
          
          <el-table-column property="name" :label="$t(`overview['任务名']`)" width="300">
            <template #default="scope">
              <el-button style="text-decoration: underline; color: #606266;" link @click="rowClicked(scope.row)">{{
                scope.row.name }}</el-button>
            </template>
          </el-table-column>
          <el-table-column property="desc" :label="$t(`overview['任务描述']`)" width="300" />
          <!-- <el-table-column label="任务标签" width="300">
            <template #default="scope">
              <el-button v-for="tag in scope.row.tags" link :key="tag">{{ tag }}</el-button>
            </template>
          </el-table-column> -->
          <el-table-column property="trigger-name" :label="$t(`overview['触发器']`)" width="150" />
          <el-table-column property="proposal-name" :label="$t(`overview['方案']`)" width="150" />
          <el-table-column property="status" :label="$t(`common['状态']`)" width="120" />
          <el-table-column :label="$t(`common['开始时间']`)">
            <template #default="scope">{{ formatter(scope.row.start, "yyyy-MM-dd hh:mm:ss") }}</template>
          </el-table-column>
          <el-table-column :label="$t(`common['结束时间']`)">
            <template #default="scope">{{ formatter(scope.row.end, "yyyy-MM-dd hh:mm:ss") }}</template>
          </el-table-column>
          <el-table-column property="id" label="ID" width="150" />
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

interface Row {
  id: string,
  name: string,
  desc: string,           // 由触发器打印的描述
  tags: Array<string>,    // 处理数据关联的采集标签
  trigger: string,        // 触发器ID
  reason: string,         // 触发日志, 显示触发原因
  proposal: string,       // 方案ID
  status: string,         // 当前任务状态
  runId: string,          // 对应airflow的runid
  start: Date,            // 开始执行时间
  end: Date               // 结束执行时间
}

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
  queryGovTasksData(current.value + 1)
}

const prevPage = () => {
  queryGovTasksData(current.value - 1)
}

const handleSelectionChange = (val: Row[]) => {
  multipleSelection.value = val
  if (multipleSelection.value.length === 0) isDeleteBtnDisabled.value = true
  else isDeleteBtnDisabled.value = false
}

const rowClicked = (row: Row) => {
  window.history.pushState(null, '', `/governance/task/${row.id}`)
}

onMounted(() => {
  queryGovTasksData(current.value)
})

const trigger = () => {
  window.history.pushState(null, '', `/governance/taskcreation`)
}

const queryGovTasksData = (page: number) => {
  try {
    const params = {
      offset: step.value * page,
      limit: step.value,
      sort: '-created',
      'filter[name][fuzzy-match]': search.value
    }
    findAll('tasks', params).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      data.value = gostore.findAll('tasks')
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

const formatter = (thistime: any, fmt: string) => {
  if (!thistime) return '--'
  const isUTC = thistime.indexOf('Z') > -1 ? 'UTC' : ''
  // const isUTC = ""
  let $this = new Date(thistime)
  let o = {
    'M+': $this[`get${isUTC}Month`]() + 1,
    'd+': $this[`get${isUTC}Date`](),
    'h+': $this[`get${isUTC}Hours`](),
    'm+': $this[`get${isUTC}Minutes`](),
    's+': $this[`get${isUTC}Seconds`](),
    'q+': Math.floor(($this[`get${isUTC}Month`]() + 3) / 3),
    'S': $this[`get${isUTC}Milliseconds`]()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ($this[`get${isUTC}FullYear`]() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

const change = () => {
  queryGovTasksData(0)
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