<template>
  <div class="viz-wrap">
    <div class="image">
      <img class="pic" :src="visualizeStore.imageUrl" alt="相机可视化图像" />
    </div>
    <div class="display-panel">
      <!-- 可折叠配置 -->
      <el-collapse v-model="activeName">
        <el-collapse-item name="dataSources" :title="t('visualize.dataSource')">
          <el-table :data="visualizeStore.deviceImage" row-key="name" style="width: 100%">
            <el-table-column prop="name" :label="t('common.name')" />
            <el-table-column
              prop="config.topic_name"
              :label="t('visualize.imgTopic')"></el-table-column>
            <!-- <el-table-column prop="config.lidar_ip" label="ip"></el-table-column> -->
            <el-table-column :label="t('common.operate')" width="100">
              <template #default="scope">
                <div class="operation">
                  <!-- 下载按钮 -->
                  <el-tooltip placement="top" :show-after="500" content="download image">
                    <el-button
                      class="ml-2"
                      round
                      :icon="Download"
                      size="small"
                      @click="downloadImg(scope.row.name)" />
                  </el-tooltip>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useVisualizeStore } from '@/store/modules/visualize'
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'
import { Download } from '@element-plus/icons-vue'

const { t } = useI18n()
const visualizeStore = useVisualizeStore()

const activeName = ref<string>('dataSources')

const downloadImg = (name: string) => {
  const a = document.createElement('a')
  a.href = visualizeStore.imageUrl
  a.download = name
  a.click()
}
</script>

<style scoped lang="scss">
.viz-wrap {
  display: flex;
  width: 100%;
  height: 100%;

  .image {
    flex: 1;
    height: 100%;
    margin-right: 0.4rem;
    overflow-y: auto;
    // background: $bg-color1;
    .pic {
      width: 100%;
    }
  }
  .display-panel {
    width: 40%;
    min-width: 20rem;
    max-width: 30rem;
    height: 100%;
    overflow: auto;
  }
}
</style>
