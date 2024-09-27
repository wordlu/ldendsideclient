<!-- 雷达首页,展示雷达设备列表 -->
<template>
  <DevicesIndex :list="lidars" @refresh="getList">
    <template #btn>
      <el-button :disabled="collectStore.disableEdit" type="primary" @click="openConfig">
        {{ t('device.addLidar') }}
      </el-button>
    </template>
  </DevicesIndex>
</template>

<script setup lang="ts">
import DevicesIndex from '@/components/device/DeviceIndex.vue'
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Device } from '@/api/s1/model/device'
import { getDevice } from '@/api/s1/device'
import { useCollectStore } from '@/store/modules/collect'

const { t } = useI18n()
const collectStore = useCollectStore()

const router = useRouter()

let lidars = ref<Device[]>([])

onMounted(() => {
  getList()
})

const getList = () => {
  getDevice('lidar').then(res => {
    lidars.value = res.data
  })
}

// 点击添加雷达跳转设备配置页面
const openConfig = () => {
  router.push({ path: '/device_config', query: { c: 'lidar' } })
}
</script>
