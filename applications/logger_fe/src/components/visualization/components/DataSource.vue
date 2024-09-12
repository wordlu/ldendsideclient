<template>
  <!-- 数据源展示 -->
  <el-table :data="pointStore.devicePoints" row-key="name" style="width: 100%">
    <!-- 展开行 -->
    <el-table-column type="expand">
      <template #default="props">
        <el-form label-position="left" small inline class="expand-form" label-width="3rem">
          <el-form-item label="x">
            <el-input-number
              v-model="props.row.config.tf.x"
              controls-position="right"
              size="small"
              :step="0.1"
              precision="5"
              :max="numberLimit"
              :min="-numberLimit"
              @change="updatePcTf(props.row.name, 'x', $event)" />
          </el-form-item>
          <el-form-item label="y">
            <el-input-number
              v-model="props.row.config.tf.y"
              controls-position="right"
              size="small"
              :step="0.1"
              precision="5"
              :max="numberLimit"
              :min="-numberLimit"
              @change="updatePcTf(props.row.name, 'y', $event)" />
          </el-form-item>
          <el-form-item label="z">
            <el-input-number
              v-model="props.row.config.tf.z"
              controls-position="right"
              size="small"
              :step="0.1"
              precision="5"
              :max="numberLimit"
              :min="-numberLimit"
              @change="updatePcTf(props.row.name, 'z', $event)" />
          </el-form-item>
          <el-form-item label="roll">
            <el-input-number
              v-model="props.row.config.tf.roll"
              controls-position="right"
              size="small"
              :step="1"
              precision="5"
              :max="numberLimit"
              :min="-numberLimit"
              @change="updatePcTf(props.row.name, 'roll', $event)" />
          </el-form-item>
          <el-form-item label="pitch">
            <el-input-number
              v-model="props.row.config.tf.pitch"
              controls-position="right"
              size="small"
              :step="1"
              precision="5"
              :max="numberLimit"
              :min="-numberLimit"
              @change="updatePcTf(props.row.name, 'pitch', $event)" />
          </el-form-item>
          <el-form-item label="yaw">
            <el-input-number
              v-model="props.row.config.tf.yaw"
              controls-position="right"
              size="small"
              :step="1"
              precision="5"
              :max="numberLimit"
              :min="-numberLimit"
              @change="updatePcTf(props.row.name, 'yaw', $event)" />
          </el-form-item>
        </el-form>
      </template>
    </el-table-column>
    <el-table-column prop="name" :label="t('common.name')" />
    <el-table-column prop="config.topic_name" :label="t('visualize.pcTopic')" />
    <el-table-column prop="config.lidar_ip" label="ip" />
    <el-table-column :label="t('common.operate')" width="100">
      <template #default="scope">
        <div class="operation">
          <!-- 颜色选择 -->
          <el-color-picker
            v-model="scope.row.color"
            show-alpha
            size="small"
            @change="updateColor(scope.row.name, $event)" />
          <!-- 展示开关 -->
          <!-- <el-switch v-model="scope.row.isDisplay" size="small" /> -->
          <!-- 上传 tf 按钮 -->
          <!-- <el-tooltip placement="top" :show-after="500" content="upload tf">
            <el-button round :icon="Upload" size="small"> </el-button>
          </el-tooltip> -->
          <!-- 下载 csv 按钮 -->
          <el-tooltip placement="top" :show-after="500" content="download csv">
            <el-button
              class="ml-2"
              round
              :icon="Download"
              size="small"
              @click="downloadCSV(scope.row.name)">
            </el-button>
          </el-tooltip>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { useVisualizeStore } from '@/store/modules/visualize'
import { scenePcs, updatePcTf, updateColor } from '@/basic_data/visualization'
import { downloadFile } from '@/utils'
import { numberLimit } from '@/utils/common'

const { t } = useI18n()
const pointStore = useVisualizeStore()

// 下载 csv 按钮
const downloadCSV = (name: string) => {
  console.log('download csv click')
  const curPc = scenePcs.find(item => item.name === name)
  if (curPc !== undefined) {
    const data = curPc.getPointData()
    if (data !== null) {
      const lineArray: any[] = []
      data.forEach(item => {
        lineArray.push(item.join(','))
      })
      const csvStr = lineArray.join('\n')
      downloadFile(csvStr, `${name}.csv`)
    } else {
      ElMessage.error(t('message.downloadCsvError'))
    }
  } else {
    ElMessage.error(t('message.downloadCsvError'))
  }
}
</script>

<style scoped lang="scss"></style>
