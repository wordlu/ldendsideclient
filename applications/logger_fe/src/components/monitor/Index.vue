<template>
  <!-- 监控中按钮显示: 告警 - 严重警告 - 故障 - 监控中 -->
  <el-button
    v-if="monitorStore.inMonitoring"
    class="monitor run shadow-lg"
    type="primary"
    :color="
      monitorStore.monitorStatus === 'error'
        ? '#b31f1f'
        : monitorStore.monitorStatus === 'critical'
        ? '#f56c6c'
        : ''
    "
    circle
    @click="handleMonitor">
    <span v-if="monitorStore.monitorStatus === 'warning'" class="btn">
      {{ t('monitor.warning') }}
    </span>
    <span v-else-if="monitorStore.monitorStatus === 'critical'" class="btn">
      <!-- {{ t('monitor.critical') }} -->
      {{ t('monitor.error') }}
    </span>
    <span v-else-if="monitorStore.monitorStatus === 'error'" class="btn">
      <!-- {{ t('monitor.error') }} -->
      {{ t('monitor.critical') }}
    </span>
    <span v-else class="btn">
      {{ t('monitor.monitoring') }}
    </span>
    <span class="detail-btn">{{ t('monitor.checkDetail') }}</span>
  </el-button>

  <!--  未监控按钮显示,禁用 -->
  <el-button v-else class="monitor" type="primary" circle disabled>
    {{ t('monitor.notmonitor') }}
  </el-button>

  <!-- 监控失败弹窗提示 -->
  <el-dialog v-model="monitorStore.monitorFailed" :title="t('common.warning')" width="450px">
    <p>{{ t('monitor.failTip') }}</p>
    <p>{{ t('monitor.oprtTip') }}</p>
    <div class="text-right mt-4">
      <el-button size="small" type="primary" @click="monitorErrorOprt('stop collecting')">
        {{ t('monitor.stopCollect') }}
      </el-button>
      <el-button size="small" @click="monitorErrorOprt('keep collecting')">
        {{ t('monitor.keepCollect') }}
      </el-button>
    </div>
  </el-dialog>

  <!-- 监控弹窗 -->
  <el-dialog v-model="monitorStore.showMonitor" width="90%" :title="t('monitor.monitorDetail')">
    <!-- 监控严重警告的提示: 是否继续采集,目前后端逻辑error是最严重的情况,给出弹窗 -->
    <!-- <div v-if="monitorStore.monitorStatus === 'critical'" class="error"> -->
    <div
      v-if="monitorStore.monitorStatus === 'error' && !monitorStore.recordUserClicked"
      class="error">
      <span class="error-title">{{ t('monitor.errotTitle') }}:</span>
      <span class="mr-4">{{ t('monitor.errotTip') }}</span>
      <el-button type="primary" size="small" text @click="recordOprt('stop collecting')">
        {{ t('monitor.stopCollect') }}
      </el-button>
      <el-button size="small" text @click="recordOprt('keep collecting')">
        {{ t('monitor.keepCollect') }}
      </el-button>
    </div>
    <!-- 监控详情 -->
    <MonitorDetail />
  </el-dialog>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useCollectStore } from '@/store/modules/collect'
import { useMonitorStore } from '@/store/modules/monitor'
import MonitorDetail from '@/components/monitor/MonitorDetail.vue'
import { recordManualOpera } from '@/api/s1/collect'

const { t } = useI18n()

const monitorStore = useMonitorStore()
const collectStore = useCollectStore()

// 显示监控详情
const handleMonitor = () => {
  monitorStore.showMonitor = true
}

// 监控错误状态下记录用户操作
const recordOprt = (oprt: string) => {
  if (oprt === 'stop collecting') {
    // 停止采集,调用stop接口,重置为初始化状态
    monitorStore.showMonitor = false
    collectStore.stopCollect()
  } else {
    // 继续采集,记录用户操作,当前会话不再给出告警提示
    monitorStore.recordUserClicked = true
  }
  recordManualOpera(oprt)
}

/**
 * 监控未启动时弹窗: 记录用户操作
 * @param oprt 继续采集||停止采集
 */
const monitorErrorOprt = (oprt: string) => {
  recordOprt(oprt)
  // 继续采集.则把监控状态从错误状态置为初始化状态
  if (oprt === 'keep collecting') {
    monitorStore.monitorStatus = 'idle'
  }
}
</script>

<style lang="scss" scoped>
.monitor {
  // display: none;
  position: fixed;
  width: 4rem;
  height: 4rem;
  bottom: 2rem;
  right: 2rem;
  z-index: 10;
  color: #ffffff;
  .detail-btn {
    position: absolute;
    width: 4rem;
    height: 4rem;
    line-height: 4rem;
    border-radius: 50%;
    top: 0;
    left: 0;
    visibility: hidden;
  }
  &.run:hover {
    .btn {
      visibility: hidden;
    }
    .detail-btn {
      visibility: visible;
    }
  }
}
.error {
  margin-bottom: 0.8rem;
  text-align: center;
  &-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 0.75rem;
    margin-right: 0.5rem;
    // color: $color-error;
  }
}
</style>
