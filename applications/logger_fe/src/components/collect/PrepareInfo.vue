<!-- 采集准备中状态:准备详情页面 -->
<template>
  <div class="wrap prepare">
    <div>{{ t('collect.prepareInfo') }}</div>
    <div class="list-wrap">
      <!-- 雷达检测: 连接成功||连接失败||正在连接 -->
      <div v-if="collectStore.lidars.length > 0">
        <div class="el-descriptions__title title">
          {{ t('device.lidarDetection') }} - {{ collectStore.lidars.length }}{{ t('device.num') }}
        </div>
        <div v-for="(item, index) in collectStore.lidars" :key="index" class="item">
          <span>{{ item.name }}: </span>
          <span v-if="item.device_status === 'connect'">{{ t('device.connect') }}</span>
          <span v-else-if="item.device_status === 'disconnect'">
            {{ t('device.disconnect') }}
          </span>
          <span v-else>
            {{ t('device.connecting') }} <Icon class="icon-load" icon="ri:loader-2-fill" />
          </span>
        </div>
      </div>
      <!-- 相机检测 -->
      <div v-if="collectStore.cameras.length > 0">
        <div class="el-descriptions__title title">
          {{ t('device.cameraDetection') }}
          - {{ collectStore.cameras.length }}{{ t('device.num') }}
        </div>
        <div v-for="(item, index) in collectStore.cameras" :key="index" class="item">
          <span>{{ item.name }}: </span>
          <span v-if="item.device_status === 'connect'">
            {{ t('device.connect') }}
          </span>
          <span v-else-if="item.device_status === 'disconnect'">
            {{ t('device.disconnect') }}
          </span>
          <span v-else>
            {{ t('device.connecting') }} <Icon class="icon-load" icon="ri:loader-2-fill" />
          </span>
        </div>
      </div>
      <!-- can设备检测 -->
      <div v-if="collectStore.cans.length > 0">
        <div class="el-descriptions__title title">
          {{ t('device.canDetection') }} - {{ collectStore.cans.length }}{{ t('device.num') }}
        </div>
        <div v-for="(item, index) in collectStore.cans" :key="index" class="item">
          <span>{{ item.name }}: </span>
          <span v-if="item.device_status === 'connect'">{{ t('device.connect') }}</span>
          <span v-else-if="item.device_status === 'disconnect' || item.device_status === 'idle'">
            {{ t('device.disconnect') }}
          </span>
          <span v-else>
            {{ t('device.connecting') }} <Icon class="icon-load" icon="ri:loader-2-fill" />
          </span>
        </div>
      </div>
      <!-- com设备检测 -->
      <div v-if="collectStore.coms.length > 0">
        <div class="el-descriptions__title title">
          {{ t('device.comDetection') }} - {{ collectStore.coms.length }}{{ t('device.num') }}
        </div>
        <div v-for="(item, index) in collectStore.coms" :key="index" class="item">
          <span>{{ item.name }}: </span>
          <span v-if="item.device_status === 'connect'">{{ t('device.connect') }}</span>
          <span v-else-if="item.device_status === 'disconnect' || item.device_status === 'idle'">
            {{ t('device.disconnect') }}
          </span>
          <span v-else>
            {{ t('device.connecting') }} <Icon class="icon-load" icon="ri:loader-2-fill" />
          </span>
        </div>
      </div>
    </div>
    <!-- 授时状态: 授时成功||授时失败||正在授时 -->
    <div>
      {{ t('collect.timeService') }}:
      <span v-if="collectStore.timingDetail.status === 'successed'">
        {{ t('monitor.timingSuccess') }}
      </span>
      <span v-else-if="collectStore.timingDetail.status === 'failed'">
        {{ t('monitor.timingError') }}
      </span>
      <span v-else>
        {{ t('monitor.timing') }} <Icon class="icon-load" icon="ri:loader-2-fill" />
      </span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useCollectStore } from '@/store/modules/collect'
import { Icon } from '@iconify/vue'

const { t } = useI18n()

const collectStore = useCollectStore()
</script>
<style lang="scss" scoped>
.prepare {
  height: calc(100% - 52px);
  overflow: auto;
  .list-wrap {
    padding: 0 24px;
  }
  .title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .item {
    padding-left: 24px;
    padding-bottom: 12px;
  }
  .success {
    color: $color-success;
  }
  .error {
    color: $color-err;
  }
}
</style>
