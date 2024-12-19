<template>
  <div class="container"
    :element-loading-text="loadingtext"
    v-loading="pageLoading">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>存储管理</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b class="title">数据集<span class="count">({{ count }})</span></b>
          </div>
          <div class="info-btn-group">
            <el-button @click="createReport"  type="primary" class="info-btn">生成报告</el-button>
          </div>
        </div>
      </div>
      <div class="mid-panel">
        <el-input v-model="search" class="search-bar" placeholder="搜索数据集名称" @change="change" @input="change" :prefix-icon="Search" />
        <el-input v-model="searchAlias" class="search-bar" placeholder="搜索数据集别名" @change="changeAlias" @input="changeAlias" :prefix-icon="Search" />
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
        <el-table 
          @selection-change="handleSelectionChange"
          ref="multipleTableRef" empty-text="- 暂无数据 -"
          :data="data" style="width: 100%">
          <el-table-column type="selection" width="55" />
          <el-table-column property="name" label="数据集名称" width="200" show-overflow-tooltip />
          <!-- <el-table-column property="alias" label="数据集别名" width="200" show-overflow-tooltip /> -->
          <el-table-column label="数据集别名" width="200">
            <template #default="scope">
              <span v-show="scope.$index !== editIndex" @click="handleEdit(scope.row)">{{ scope.row.alias }}</span>
              <el-input
                v-show="scope.$index === editIndex"
                v-model="scope.row.alias"
                @blur="handleSave(scope.row)"
                @keyup.enter="handleSave(scope.row)"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column property="size" label="数据集规模" align="center" >
            <template #default="scope">{{ getSize(scope.row.size) }}</template>
          </el-table-column>
          <el-table-column property="prefix" label="存储位置"/>
          <el-table-column label="创建时间">
            <template #default="scope">{{ formatter(scope.row.created, "yyyy-MM-dd hh:mm:ss") }}</template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="scope">{{ formatStatus(scope.row.kpistatus) }}</template>
          </el-table-column>
          <el-table-column
            property="name"
            label="操作"
            width="50">
            <template #default="scope">
              <el-dropdown @command="(val) => handleCommand(val, scope.row)">
                <span class="el-dropdown-link">
                  <el-button @click="handleClick(scope.row)" type="text" size="small" :icon="MoreFilled"></el-button>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="数据详情" :icon="MoreFilled">数据详情</el-dropdown-item>
                    <el-dropdown-item command="计算泊车kpi" :icon="MoreFilled">计算泊车kpi</el-dropdown-item>
                    <el-dropdown-item command="删除" :icon="MoreFilled">删除</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ArrowRight, Search, ArrowRightBold, ArrowLeftBold, MoreFilled } from "@element-plus/icons-vue"
import gostore from '@/services/governance-store'
import { findAll, deleteItem, findItem, patchItem } from '@/api/jsonApi'
import { funcKpiTasksPost, funcKpiReportTasks } from '@/api/api'
import { ref, onMounted } from "vue"
import { useRouter } from 'vue-router';
import { ElTable, ElMessage, ElMessageBox } from 'element-plus'
interface Row {}
const router = useRouter()

const count = ref(0)
const step = ref(10)
const search = ref('')
const searchAlias = ref('')
const current = ref(0)
const currentmax = ref(0)
const data = ref<Row[]>([])
const activeRow = ref<Row>({})
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<Row[]>([])
const isDeleteBtnDisabled = ref<boolean>(true)
const loadingtext = ref('生成报告中...')
const pageLoading = ref(false)
const editIndex = ref(-1)
const handleEdit = (row) => {
  editIndex.value = data.value.indexOf(row)
}
const handleSave = (row) => {
  editIndex.value = -1
  const params = {
      data: {
        type: 'datasets',
        id: row.id,
        attributes: {
          "alias": row.alias,
        }
      }
    }
    patchItem('/logger/models/datasets', params).then((res) => {
      console.log(res)
      queryDatasets(current.value)
    }).catch(err => {
      console.error(err)
    })
}

const createReport = () => {
  console.log(multipleSelection.value)
  if (multipleSelection.value.length === 0) {
    ElMessage({
      message: '请选择数据集',
      type: 'warning',
    })
    return
  }
  const ids = multipleSelection.value.map((item) => item.id)
  const params = {
    "datasets": ids
  }
  pageLoading.value = true
  funcKpiReportTasks(params).then((res) => {
    pageLoading.value = false
    console.log(res)
    ElMessage({
      message: '生成报告成功，即将跳转查看...',
      type: 'success',
    })
    setTimeout(() => {
      router.push({ path: '/systemanage/reports' })
    }, 1000)
  }).catch(err => {
    pageLoading.value = false
    ElMessage({
      message: '生成报告失败',
      type: 'error',
    })
    console.error(err)
  })
}

const handleSelectionChange = (val) => {
  multipleSelection.value = val;
  console.log(multipleSelection.value)
}
const getSize = (size: number) => {
  if (size >= 0) {
    if (size < 1024) {
      return `${size} B`;                      // 小于1KB，显示为B
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`; // 小于1MB，显示为KB
    } else if (size < 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`; // 小于1GB，显示为MB
    } else {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`; // 大于等于1GB，显示为GB
    }
  } else if (size === -1) {
    return '正在采集'
  }
  return '---'
}

const nextPage = () => {
  queryDatasets(current.value + 1)
}

const prevPage = () => {
  queryDatasets(current.value - 1)
}

onMounted(() => {
  queryDatasets(current.value)
  queryCurrentDrivers()
})

const queryDatasets = (page: number, type) => {
  try {
    const params = {
      offset: step.value * page,
      limit: step.value,
      sort: '-created',
      'filter[name][fuzzy-match]': search.value,
      'filter[alias][fuzzy-match]': searchAlias.value,
    }
    findAll('/logger/models/datasets', params).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('datasets')
      data.value = datavalue.map((item: any) => {
        if (!item.alias || !item.alias.trim()) {
          item.alias = '-'
        }
        return item
      })
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
  queryDatasets(0)
}

const changeAlias = () => {
  queryDatasets(0, 'alias')
}

const viewportId = ref('')
const queryCurrentDrivers = () => {
  try {
    findAll('/logger/models/viewports', {'filter[using]': true}).then((res: any) => {
      viewportId.value = res.data.data[0].id
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const handleCommand = async (command, row) => {
  if(command == '数据详情'){
    if (row.size <= 0) {
      ElMessage({
        message: "当前数据集无法查看数据详情！",
        type: 'warning',
      })
      return;
    }
    const currentStatus = await findItem('viewport_status', viewportId.value)
    if (currentStatus.data.isluanching) {
      ElMessage({
        message: "有正在运行的设备，请关闭设备后再查看数据详情！",
        type: 'warning',
      })
      return;
    }
    window.history.pushState(null, '', `/loggerfe/datasetdetail/${row.id}`)
  }
  else if(command == '计算泊车kpi'){
    createKpi(row)
  }
  else if(command == '删除'){  
    ElMessageBox.alert('确认删除当前数据集吗？', '确认删除', {
      confirmButtonText: '确认',
      customClass:"delete-confirm-box",
      callback: (action: Action) => {
        if (action === 'confirm') {
          onDelete(row.id)
        }
      },
    })
  }
}

const createKpi = (row) => {
  funcKpiTasksPost({"dataset":row.id}).then(res => {
    ElMessage({
      message: "计算中,请稍后查看数据详情",
      type: 'success',
    })
  }).catch(err => {
    console.err(err)
  })
}


const onDelete = (id) => {
  const params = {
      data: {
        id: id,
        type: 'datasets'
      }
    }
  deleteItem('/logger/models/datasets', params).then(res => {
    ElMessage({
      message: "删除成功",
      type: 'success',
    })
    queryDatasets(0)
  }).catch(err => {
    const {response:{data:{errors}}} = err
    let msg =  "删除失败"
    if(errors && errors[0]) {
      msg = errors[0]['detail']
    }
    ElMessage({
      message: msg,
      type: 'error',
    })
  })
}

const handleClick = (e) =>{
  activeRow.value = e
}

const formatStatus = (status) => {
  const arr = {
    'NoStatus': '无',
    'Running': '运行中',
    'Success': '成功',
    'Failed': '失败',
  }
  return arr[status] || '--'
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
</script>

<style>
.delete-confirm-box {
  height: 160px !important;
}
</style>
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