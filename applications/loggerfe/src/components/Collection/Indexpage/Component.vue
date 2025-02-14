<template>
  <div class="index-page" >
    <indexBase v-if="viewportId && viewportId !== 'changcheng'" :viewportId="viewportId"  />
    <indexCompare v-if="viewportId === 'changcheng'" :viewportId="viewportId" :viewports="viewports" />
  </div>
</template>

<script setup lang="ts">
import { ElContainer, ElAside, ElCollapse, ElCollapseItem, ElButton, ElMessageBox, ElMessage, ElNotification } from 'element-plus';
import { ref, computed, reactive, onMounted, onBeforeUnmount, onUnmounted  } from 'vue';
import { addItem, findAll, findItem, deleteItem } from '@/api/jsonApi'
import indexBase from './indexBase.vue'
import indexCompare from './indexCompare.vue'
import gostore from '@/services/governance-store'

const viewportId = ref('')
const viewports = ref([])
//获取设备树
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {include: 'devices', 'filter[using]': true}).then(async (res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      viewports.value = datavalue
      viewportId.value = datavalue[0].id
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}
onMounted(() => {
  queryCurrentDrivers()
})

</script>

<style lang="scss" scoped>
.index-page {
  height: 100%;
}
</style>