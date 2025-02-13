<template>
  <div class="details-content">
    <detailsBase :viewportId="viewportId" v-if="viewportId !== 'changcheng'" />
    <detailsCompare :viewportId="viewportId" v-else />
  </div>
</template>

<script setup lang="ts">
import detailsBase from "@/components/Collection/Detailspage/detailsBase.vue"
import detailsCompare from "@/components/Collection/Detailspage/detailsCompare.vue"
import { ref, computed, reactive, onMounted, onBeforeUnmount, onUnmounted  } from 'vue';
import gostore from '@/services/governance-store'
import { addItem, findAll, findItem, deleteItem } from '@/api/jsonApi'

const viewports = ref([])
const viewportId = ref('')
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

<style scoped>
.details-content {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>