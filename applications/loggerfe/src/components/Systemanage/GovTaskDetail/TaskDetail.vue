<template>
  <div class="container">
    <div class="panel">
      <div class="mid-panel">
        <el-descriptions :title="$t(`overview['任务详情']`)">
          <el-descriptions-item label="ID:">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="getDetailValue('id')"
              placement="top-start"
            >
              <span>{{getDetailValue('id')}}</span>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item :label="$t(`overview['任务名']`)">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="getDetailValue('name')"
              placement="top-start"
            >
              <span>{{getDetailValue('name')}}</span>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item :label="$t(`overview['任务描述']`)">
            <el-tooltip
              class="box-item"
              effect="dark"
              :content="getDetailValue('desc')"
              placement="top-start"
            >
              <span>{{getDetailValue('desc')}}</span>
            </el-tooltip>
          </el-descriptions-item>
          <el-descriptions-item :label="$t(`common['类型']`)">{{getDetailValue('cat')}}</el-descriptions-item>
          <el-descriptions-item :label="$t(`common['状态']`)">{{getDetailValue('status')}}</el-descriptions-item>
          <el-descriptions-item :label="$t(`common['创建时间']`)">{{formatter(getDetailValue('created'), "yyyy-MM-dd hh:mm:ss")}}</el-descriptions-item>
          <el-descriptions-item :label="$t(`common['开始时间']`)">{{formatter(getDetailValue('start'), "yyyy-MM-dd hh:mm:ss")}}</el-descriptions-item>
          <el-descriptions-item :label="$t(`common['结束时间']`)">{{formatter(getDetailValue('end'), "yyyy-MM-dd hh:mm:ss")}}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue"
// @ts-ignore 
import { ArrowRight, Search } from "@element-plus/icons-vue" // eslint-disable-line

const props = defineProps({
  data: {},
  details: {}
})

const getDetailValue = (val:any) => {
  return props.details ? props.details[val] : ''
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
// interface Row {
//     id: string,
//     name: string,
//     desc: string,               // 由触发器打印的描述
//     tags: Array<string>,        // 处理数据关联的采集标签
//     trigger: string,            // 触发器ID
//     reason: string,             // 触发日志, 显示触发原因
//     proposal: string,           // 方案ID
//     status: string,             // 当前任务状态
//     runId: string,              // 对应airflow的runid
//     start: Date,                // 开始执行时间
//     end: Date                   // 结束执行时间
// }

</script>

<style lang="scss" scoped>
.user-tabs>.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-button--primary {
  background: #FF7900;
  border: none;
}

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
    // border: 1px solid transparent;
  }

  .mid-panel {
    display: flex;
    flex-direction: row;
  }

  :deep(.el-descriptions__cell) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding-right: 8px;
    cursor: pointer;
  }

  .title-panel {
    // background-color: white;
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

  .summary {
    margin-top: 15px;
    border: 1px soild transparent;
    display: flex;
    flex-direction: column;
  }
}
</style>