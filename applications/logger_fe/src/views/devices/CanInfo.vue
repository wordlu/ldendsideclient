<template>
  <DeviceInfo category="can" :devices-info="devicesInfo" />
</template>

<script setup lang="ts">
import DeviceInfo from '@/components/device/DeviceInfo.vue'
import { ref, onMounted } from 'vue'
import { Device } from '@/api/s1/model/device'
import { getDevice } from '@/api/s1/device'

let devicesInfo = ref<Device[]>([])

onMounted(() => {
  getList()
})

const getList = () => {
  getDevice('can').then(res => {
    devicesInfo.value = res.data
  })
}
</script>
