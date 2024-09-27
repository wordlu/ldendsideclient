<!-- 系统管理首页:配置存储路径 -->
<template>
  <!-- 存储配置提示 -->
  <p class="main-tip">{{ t('storage.storageTip') }}</p>
  <div class="mb-10">
    <!-- 未选择硬盘时的空提示 -->
    <span v-if="!storePath" class="empty-tip">
      {{ t('storage.emptyTip') }}
    </span>
    <!-- 已选择硬盘时展示硬盘信息 -->
    <template v-else>
      <span>{{ t('storage.storagePath') }}: {{ storePath }}</span>
      <span class="mlr">{{ t('storage.diskName') }}: {{ diskName }}</span>
    </template>
    <el-button :disabled="collectStore.disableEdit" type="primary" @click="btnClick">
      {{ !storePath ? t('storage.selectDisk') : t('storage.changeDisk') }}
    </el-button>
    <span class="select-tip">{{ t('storage.selectTip') }}</span>
  </div>

  <StrategyConfig />

  <!-- 选择存储位置弹窗 -->
  <el-dialog
    v-model="showStorage"
    :title="t('storage.storageTitle')"
    width="520px"
    align-center
    destroy-on-close>
    <StorageCfg :path="storePath" :disk="diskName" @handle="handleDialog" />
  </el-dialog>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import StorageCfg from '@/components/collect/StorageCfg.vue'
import { setDataRootDir } from '@/api/s1/collect'
import { ElMessage } from 'element-plus'
import { getDataRootDir } from '@/api/s1/collect'
import { useCollectStore } from '@/store/modules/collect'
import StrategyConfig from '@/components/collect/StrategyConfig.vue'

const { t } = useI18n()
const collectStore = useCollectStore()

// 控制配置弹窗的展示
const showStorage = ref<boolean>(false)

const storePath = ref<string>('')
const diskName = ref<string>('')

onMounted(() => {
  getDataRootDir().then(res => {
    console.log(res)
    if (res.status === 200 && res.data) {
      storePath.value = res.data.data_root_dir
      diskName.value = res.data.disk_name
    } else {
      ElMessage.error(res.message)
    }
  })
})

/**
 * 选择路径的弹窗: 点击取消或者保存
 * @param isSave false-点击取消-关闭 true-点击保存保存路径
 * @param data 存储的参数: data_root_dir-路径 disk_name-硬盘名称
 */
const handleDialog = (isSave: boolean, data?: { data_root_dir: string; disk_name: string }) => {
  // 点击取消,关闭窗口
  if (!isSave) {
    showStorage.value = false
    return
  }
  if (data) {
    setDataRootDir(data).then(res => {
      if (res.status === 200) {
        showStorage.value = false
        storePath.value = data.data_root_dir
        diskName.value = data.disk_name
      } else {
        ElMessage.error(res.message)
      }
    })
  }
  // 点击保存,保存路径至服务器
}

// 选择硬盘按钮点击
const btnClick = () => {
  showStorage.value = true
}
</script>
<style lang="scss" scoped>
.main-tip {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}
.empty-tip {
  // color: $color-err;
  margin-right: 16px;
}
.select-tip {
  // color: $color-tip;
  margin-left: 12px;
  font-size: 0.75rem;
  vertical-align: bottom;
}
.mlr {
  margin: 0 12px;
}
</style>
