<!-- 雷达首页,展示雷达设备列表 -->
<template>
  <DevicesIndex :list="cans" @refresh="getList">
    <template #btn>
      <el-button :disabled="collectStore.disableEdit" type="primary" @click="openConfig">
        {{ t('device.addCAN') }}
      </el-button>
    </template>
  </DevicesIndex>
</template>

<script setup lang="ts">
import DevicesIndex from '@/components/device/DeviceIndex.vue'
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Device } from '@/api/s1/model/device'
import { getDevice } from '@/api/s1/device'
import { useRouter } from 'vue-router'
import { useCollectStore } from '@/store/modules/collect'

const { t } = useI18n()
const collectStore = useCollectStore()
const router = useRouter()

const cans = ref<Device[]>([])

onMounted(() => {
  getList()
})

const getList = () => {
  getDevice('can').then(res => {
    cans.value = res.data
  })
}

// 点击添加雷达跳转设备配置页面
const openConfig = () => {
  router.push({ path: '/device_config', query: { c: 'can' } })
}
</script>
