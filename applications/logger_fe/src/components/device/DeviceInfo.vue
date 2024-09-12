<!-- 设备详细信息页 -->
<template>
  <!-- 没有设备的空白页 -->
  <el-empty v-if="devices.length < 1" :description="t('device.emptyDeviceTip')"></el-empty>
  <!-- 设备tab页 -->
  <el-tabs v-else class="device-tab">
    <el-tab-pane v-for="item in devices" :key="item.name" :label="item.name">
      <div class="details">
        <img v-if="item.imgUrl" :src="item.imgUrl" alt="device img" />
      </div>
      <el-descriptions :title="t('collect.collectionInfo')" :column="1">
        <el-descriptions-item :label="t('common.status')">
          <span
            :class="
              item.device_status === 'disconnected'
                ? 'status-disconnected'
                : item.device_status === 'connect'
                ? 'status-connected'
                : 'status-collecting'
            ">
            <!-- ? t('collect.connected') -->
            {{
              item.device_status === 'connect' ? t('collect.connected') : t('collect.disconnect')
            }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.name')">
          {{ item.name }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.category')">
          {{ item.category }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.type')">
          {{ item.device_type_name }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.relDataDir')">
          {{ item.rel_data_dir }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.speed')">
          {{ item.cur_capture_speed || '--' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.dataSize')">
          {{ item.cur_store_file_size || '--' }}
        </el-descriptions-item>
        <el-descriptions-item :label="t('common.enable')">
          <el-switch v-model="item.enable" disabled></el-switch>
        </el-descriptions-item>
      </el-descriptions>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMonitorStore } from '@/store/modules/monitor'
import { Device } from '@/api/s1/model/device'

const { t } = useI18n()
const monitorStore = useMonitorStore()
let update = ref<number>(0)

const props = defineProps<{
  devicesInfo: Array<Device>
  category: string
}>()

// 监听store变化,更新设备采集相关的参数
monitorStore.$subscribe(() => {
  update.value++
})

const devices = computed(() => {
  let lis: Device[] = []
  if (update.value > -1) {
    const monitor_device = monitorStore.monitorDetail.dir_speed_log || []
    const enable_ids: string[] = monitor_device.map(i => i.device_name)

    lis = props.devicesInfo
    lis.forEach(i => {
      const lis_index = enable_ids.indexOf(i.name)
      if (lis_index > -1) {
        i.enable = true
        i.device_status = 'connect'
        i.cur_capture_speed = monitor_device[lis_index].cur_capture_speed
        i.cur_store_file_size = monitor_device[lis_index].cur_store_file_size
      }
    })
  }
  return lis
})
</script>

<style scoped lang="scss"></style>

<style lang="scss">
.device-tab {
  .el-tabs__item {
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
