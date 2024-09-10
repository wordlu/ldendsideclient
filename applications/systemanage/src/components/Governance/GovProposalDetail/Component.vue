<template>
    <div class="container">
        <el-breadcrumb :separator-icon="ArrowRight">
            <el-breadcrumb-item :to="{ path: '/governance/overview' }">{{$t(`Menu['治理集成']`)}}</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/governance/proposals' }">{{$t(`Menu['治理方案']`)}}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ proposalDetails ? proposalDetails.name : '' }}</el-breadcrumb-item>
       </el-breadcrumb>
        <div class="panel">
            <div class="title-panel">
                <div class="info">
                    <div class="info-detail">
                        <b>{{ proposalDetails ? proposalDetails.name : '' }}</b>
                    </div>
                    <div class="info-btn-group">
                        <!-- <el-button type="primary" class="info-btn" @click="remove">删除</el-button> -->
                    </div>
                </div>
            </div>
        </div>
        <div class="summary">
            <el-tabs v-model="activeName" class="user-tabs" @tab-click="handleClick">
                <el-tab-pane :label="$t(`overview['输入']`)" name="input">
                  <DsInput :details="proposalDetails"></DsInput>
                </el-tab-pane>
                <el-tab-pane :label="$t(`overview['治理详情']`)" name="governance">
                  <ProposalDetail :details="proposalDetails"></ProposalDetail>
                </el-tab-pane>
                <el-tab-pane :label="$t(`overview['输出']`)" name="output">
                  <DsOutput :details="proposalDetails"></DsOutput>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" setup>
import  { ArrowRight } from "@element-plus/icons-vue"
import  { ref } from "vue"
import type { TabsPaneContext } from 'element-plus'
import gostore from '@/services/governance-store'
import { findItem } from '@/api/jsonApi'
import DsInput from "./Input.vue"
import DsOutput from "./Output.vue"
import { useRoute } from 'vue-router'
import ProposalDetail from "./ProposalDetail.vue"

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

const proposalDetails = ref<any>(null)
const activeName = ref<string>("input")
const route = useRoute();
const handleClick = (tab: TabsPaneContext, event: Event) => {
    console.log(tab, event)
    activeName.value = tab.paneName 
}

const getProposalDetail = async () => {
  const details = await findItem('proposals', route.params.id, {})
  const data = gostore.sync(details.data)
  proposalDetails.value = data
}
getProposalDetail()

</script>

<style lang="scss" scoped>
.user-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
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