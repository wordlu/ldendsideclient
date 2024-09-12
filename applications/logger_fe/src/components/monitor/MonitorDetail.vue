<!-- 监控详情页面 -->
<template>
  <!-- 设备监控 -->
  <div>
    <h1>{{ t('monitor.deviceMonitor') }}</h1>
    <el-table
      :data="monitorStore.monitorDetail.dir_speed_log || []"
      scrollbar-always-on
      border
      class="mb-4"
      style="width: 100%">
      <!-- 设备名称 -->
      <el-table-column prop="device_name" fixed :label="t('common.name')" />
      <!-- 设备类型 -->
      <el-table-column prop="category" :label="t('monitor.category')" />
      <!-- 设备种类 -->
      <el-table-column prop="device_type" :label="t('common.type')" />
      <!-- 设备连接状态 -->
      <el-table-column prop="device_status" :label="t('monitor.deviceStatus')" />
      <!-- 设备当前采集速率 -->
      <el-table-column prop="cur_capture_speed" :label="t('monitor.speed')" />
      <!-- 设备传输波动率 -->
      <el-table-column prop="transmission_wave_rate" :label="t('monitor.volatility')">
        <template #default="scope">
          <span :class="scope.row.transmission_wave_rate?.level">
            {{ scope.row.transmission_wave_rate?.value }}
          </span>
        </template>
      </el-table-column>
      <!-- 设备当前数据大小 -->
      <el-table-column prop="cur_store_file_size" :label="t('monitor.size')" />
      <!-- 设备授时精度 -->
      <el-table-column prop="ts_offset" :label="t('monitor.accuracy')">
        <template #default="scope">
          <span :class="scope.row.ts_offset?.level">
            {{ scope.row.ts_offset?.value }}
          </span>
        </template>
      </el-table-column>
      <!-- 设备授时时间戳 -->
      <el-table-column prop="offset">
        <template #header>
          <el-tooltip
            class="box-item"
            effect="dark"
            :content="t('monitor.timeStampIntro')"
            placement="top-start">
            {{ t('monitor.timeStamp') }}
          </el-tooltip>
        </template>
        <template #default="scope">
          <span :class="scope.row.offset?.level">
            {{ scope.row.offset?.value || '--' }}
          </span>
        </template>
      </el-table-column>
    </el-table>
  </div>
  <!-- 工控机授时精度监控 -->
  <div class="mb-4">
    <h1>{{ t('monitor.ipc') }}</h1>
    <p :class="monitorStore.monitorDetail.timing_log?.ts_offset?.level">
      {{ t('monitor.accuracy') }}:
      {{ monitorStore.monitorDetail.timing_log?.ts_offset?.value || '--' }}
    </p>
  </div>
  <!-- 存储空间监控 -->
  <div>
    <h1>{{ t('monitor.storageMonitor') }}</h1>
    <p>
      <span :class="monitorStore.monitorDetail.disk_log?.free_space?.level">
        {{ t('monitor.space') }}
        {{ monitorStore.monitorDetail.disk_log?.free_space?.value || '--' }},
      </span>
      {{ t('monitor.total') }}
      {{ monitorStore.monitorDetail.disk_log?.total_space || '--' }}
    </p>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useMonitorStore } from '@/store/modules/monitor'

const { t } = useI18n()
const monitorStore = useMonitorStore()
</script>

<style scoped lang="scss">
h1 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.warning {
  color: $color-warn;
}
// 目前后端逻辑error是最严重的情况
.error {
  color: $color-critical;
  // color: $color-err;
}
.critical {
  // color: $color-critical;
  color: $color-err;
}
</style>
