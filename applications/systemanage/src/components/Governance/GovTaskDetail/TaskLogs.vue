<template>
    <div class="container">
        <div class="panel">
            <div class="title-panel">
                <div class="info">
                    <div class="info-detail">
                        <b>{{ $t(`overview['任务详情']`) }}</b>
                    </div>
                    <div class="info-btn-group">
                    </div>
                </div>
            </div>
            <div class="mid-panel">
                <div v-if="!props.details || props.details.length === 0" class="nolog">{{ $t(`common['暂无数据']`) }}</div>
                <el-tabs v-model="activeTab" class="log-tabs" @tab-click="handleClick" v-else>
                    <el-tab-pane class="log-tab-pane" :label="item.name" :name="item.name" v-for="item in props.details" :key="item.name">
                      <historyLog :data="logData" />
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import type { TabsPaneContext } from 'element-plus'
import historyLog from './historyLog.vue'
import { useRoute } from 'vue-router'
import { funcGovernanceLog } from '@/api/api'
import  { ref, onMounted } from "vue"

const props = defineProps({
    data: {},
    details: Object
})

const activeTab = ref<any>('')
const logData = ref<any>(null)
const route = useRoute();

const handleClick = (tab: TabsPaneContext, event: Event) => {
    activeTab.value = tab.paneName 
    logData.value = null
    getLogs(tab.paneName)
}

const getLogs = (name:any) => {
  let nameval = name
  if(!nameval && props.details) {
    nameval = props.details[0]['name']
    activeTab.value = nameval
  }
  const parmas = {
    task_id: route.params.id,
    step_name: nameval
  }
  funcGovernanceLog(parmas).then((res:any) => {
    logData.value = res.data.data.log_content
  })
}

defineExpose({
  getLogs
});

</script>

<style lang="scss" scoped>
.log-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

.log-tab-pane {
  width: calc(100vw - 350px);
  height: calc(100vh - 440px);
  overflow: auto;
}

.ver-mid {
    display: flex;
    flex-direction: column;
    justify-content: space-around;    
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

    .mid-panel {
        display:flex;
        flex-direction: row;

        .nolog {
          color: var(--el-text-color-regular);
          font-size: 14px;
          width: 100%;
        }
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