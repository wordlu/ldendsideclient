<!-- 通用的设备配置页面:雷达|相机|can -->
<template>
  <!-- <div class="wrap"> -->
  <slot name="btn"></slot>
  <el-table :data="props.list" border class="mt-4" style="width: 100%">
    <!-- 序号 -->
    <el-table-column type="index" width="60" :label="t('common.series')" />
    <!-- 设备名称 -->
    <el-table-column prop="name" :label="t('common.name')" />
    <!-- 设备类型 -->
    <el-table-column prop="device_type_name" :label="t('common.type')" />
    <!-- 设备ip地址 -->
    <el-table-column prop="ip" :label="t('common.ip')">
      <template #default="scope">{{ scope.row.config.lidar_ip }}</template>
    </el-table-column>
    <!-- 操作列:使能&编辑&删除 -->
    <el-table-column prop="operate" :label="t('common.operate')">
      <template #default="scope">
        <el-switch
          v-model="scope.row.enable"
          :disabled="collectStore.disableEdit"
          size="small"
          @change="
            (value: boolean) => {
              enableDevice(scope.row, value)
            }
          " />
        <el-tooltip placement="top" :content="t('common.editCfg')" :show-after="1000">
          <el-button
            type="primary"
            :icon="Edit"
            :disabled="collectStore.disableEdit"
            size="small"
            circle
            class="mx-2"
            @click="editClick(scope.row)"></el-button>
        </el-tooltip>
        <span v-if="collectStore.disableEdit">
          <el-button disabled="" type="danger" :icon="Delete" size="small" circle />
        </span>
        <el-popconfirm
          v-else
          :title="t('device.deleteTip')"
          width="200px"
          @confirm="delClick(scope.row.id)">
          <template #reference>
            <span>
              <el-button
                :disabled="collectStore.disableEdit"
                type="danger"
                :icon="Delete"
                size="small"
                circle></el-button>
            </span>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <!-- </div> -->
</template>
<script setup lang="ts">
import { Delete, Edit } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { deleteDevice } from '@/api/s1/device'
import { Device } from '@/api/s1/model/device'
// import 'element-plus/es/components/message/style/index'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { updateDevice } from '@/api/s1/device'
import { defaultConfig } from '@/basic_data/device'
import { useCollectStore } from '@/store/modules/collect'

const { t } = useI18n()
const collectStore = useCollectStore()

const router = useRouter()

const emits = defineEmits<{ (e: 'refresh'): void }>()

const props = defineProps<{
  list: any[]
}>()

// 编辑按钮点击
const editClick = (row: Device) => {
  router.push({ path: '/device_config', query: { t_id: row.device_type_id, id: row.id } })
}

// 使能设备
const enableDevice = (device: Device, enable: boolean) => {
  const update: Device = {}
  defaultConfig.forEach((p: string) => {
    update[p] = device[p]
  })
  update.enable = enable
  update.config = device.config
  updateDevice(update)
}

// 删除按钮点击
const delClick = (id: number) => {
  deleteDevice(id).then(res => {
    if (res.status === 200) {
      emits('refresh')
      ElMessage({
        message: t('common.deleteTip'),
        type: 'success',
      })
    }
  })
}
</script>
