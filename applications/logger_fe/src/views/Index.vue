<!-- 采集软件logger采集首页 -->
<template>
  <!-- 操作按钮区域 -->
  <TopOprt />

  <!-- 采集准备中-准备详情页 -->
  <PrepareInfo v-show="collectStore.isIncheck" />

  <!-- 本次作业标签: 采集准备状态时不展示 -->
  <div v-show="!collectStore.isIncheck" class="main-bot">
    <OperatingTags />
  </div>

  <!-- 全屏模式下展示监控模块 -->
  <Monitor v-if="collectStore.isFullScreen" />

  <!-- 准备通过,待确认弹窗 -->
  <el-dialog
    v-model="showConfirm"
    :title="t('collect.confirmTitle')"
    :close-on-click-modal="false"
    width="420px"
    align-center>
    <p>{{ t('collect.confirmTip') }}</p>
    <div class="tip">
      <p class="tip-m">1. {{ t('collect.cameraTip') }}</p>
      <p>2. {{ t('collect.pointTip') }}</p>
    </div>
    <p class="link" @click="toCheck">{{ t('collect.toConfirm') }}</p>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelCollect">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmCollect">
          {{ t('common.confirm') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useVisualizeStore } from '@/store/modules/visualize'
import { useCollectStore } from '@/store/modules/collect'
import TopOprt from '@/components/collect/TopOprt.vue'
import OperatingTags from '@/components/tags/OperatingTags.vue'
import PrepareInfo from '@/components/collect/PrepareInfo.vue'
import { ref } from 'vue'
import { setCollectionStatus } from '@/api/s1/collect'
import Monitor from '@/components/monitor/Index.vue'

const { t } = useI18n()
const router = useRouter()

const collectStore = useCollectStore()
const visualizeStore = useVisualizeStore()

// 是否展示待确认弹窗
const showConfirm = ref<boolean>(collectStore.collectStatus === 'connect')

// 确认开始采集
const confirmCollect = () => {
  setCollectionStatus({
    status: 'collect',
  })
  showConfirm.value = false
  collectStore.collectStatus = 'collect'
}

// 点击取消按钮,停止采集
const cancelCollect = () => {
  collectStore.stopCollect()
  showConfirm.value = false
}

// 跳转可视化页面去确认以上内容
const toCheck = () => {
  // 此处的处理是为了让侧边栏菜单同步更新
  visualizeStore.activePath = ''
  setTimeout(() => {
    visualizeStore.activePath = '/visualization'
  })
  router.push('/visualization')
}

// 监听采集store变化
collectStore.$subscribe((mutation, state) => {
  // 监听状态当连接时,展示连接弹窗,并设置设备连接正常&授时成功
  if (state.collectStatus === 'connect') {
    if (!showConfirm.value) {
      showConfirm.value = true
      collectStore.deviceConfig.forEach(i => {
        i.device_status = 'connect'
      })
      collectStore.timingDetail.status = 'successed'
    }
  }
})
</script>
<style scoped lang="scss">
.tip {
  font-size: 16px;
  &-m {
    margin: 12px 0;
  }
}
.link {
  color: $color-primary;
  margin-top: 24px;
  cursor: pointer;
}
.main-bot {
  height: calc(100% - 3.8rem);
}
</style>
<style>
.icon-load {
  display: inline;
  animation: rotating 2s linear infinite;
  font-size: 1.2rem;
  margin-left: 0.2rem;
}
</style>
