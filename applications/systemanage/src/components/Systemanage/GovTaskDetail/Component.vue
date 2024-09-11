<template>
    <div class="container">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/governance/overview' }">{{$t(`Menu['治理集成']`)}}</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/governance/tasks' }">{{$t(`Menu['治理任务']`)}}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ taskDetails ? taskDetails.name : '' }}</el-breadcrumb-item>
       </el-breadcrumb>
        <div class="panel">
            <div class="title-panel">
                <div class="info">
                    <div class="info-detail">
                        <b>{{ taskDetails ? taskDetails.name : '' }}</b>
                    </div>
                    <div class="info-btn-group">
                        <!-- <el-button type="primary" class="info-btn" @click="remove">删除</el-button> -->
                    </div>
                </div>
            </div>
        </div>
        <div class="summary">
            <el-tabs v-model="activeName" class="user-tabs" @tab-click="handleClick">
                <el-tab-pane :label="$t(`overview['详情']`)" name="detail">
                  <TaskDetail :details="taskDetails"></TaskDetail>
                </el-tab-pane>
                <el-tab-pane :label="$t(`overview['日志详情']`)" name="log">
                  <TaskLogs ref="taskLogs" :details="taskDetails ? taskDetails.steps : []"></TaskLogs>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" setup>
import  { ArrowRight } from "@element-plus/icons-vue"
import  { ref } from "vue"
import gostore from '@/services/governance-store'
import { findItem } from '@/api/jsonApi'
import type { TabsPaneContext } from 'element-plus'
import TaskDetail from "./TaskDetail.vue"
import { useRoute } from 'vue-router'
import TaskLogs from "./TaskLogs.vue"

interface Row {
    id: string,
    name: string,
    desc: string,               // 由触发器打印的描述
    tags: Array<string>,        // 处理数据关联的采集标签
    trigger: string,            // 触发器ID
    reason: string,             // 触发日志, 显示触发原因
    proposal: string,           // 方案ID
    status: string,             // 当前任务状态
    runId: string,              // 对应airflow的runid
    start: Date,                // 开始执行时间
    end: Date                   // 结束执行时间
}

const activeName = ref<any>("detail")
const route = useRoute();
const taskDetails = ref<any>(null)
const taskLogs = ref(null)

const handleClick = (tab: TabsPaneContext, event: Event) => {
    activeName.value = tab.paneName
    if (activeName.value === 'log') {
      taskLogs.value && taskLogs.value.getLogs('')
    }
}
const getTaskDetail = async () => {
  const details = await findItem('tasks', route.params.id, {})
  const data = gostore.sync(details.data)
  taskDetails.value = data
}
getTaskDetail()
</script>

<style lang="scss" scoped>
.user-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.el-button--primary {
  background: #FF7900;
  border: none;
}


.container {
    display:flex;
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
        padding: 15px;
        border: 1px solid transparent;
        display: flex;
        flex-direction: column;
    }
}

</style>