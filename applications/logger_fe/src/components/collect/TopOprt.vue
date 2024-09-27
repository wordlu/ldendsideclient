<!-- 采集软件logger采集首页 -->
<template>
  <!-- 操作按钮区域 -->
  <div class="oprt">
    <div class="flex-1 flex items-center">
      <!-- 采集中的状态-展示区域: 停止采集&暂停 -->
      <template v-if="collectStore.isCollect">
        <!-- 盲采模式下,展示暂停按钮&采集中进度条 -->
        <template v-if="collectStore.collecting_mode === '0'">
          <!-- 暂停状态下-展示区域: 继续采集按钮 -->
          <el-button
            v-if="collectStore.collectStatus === 'pause'"
            class="big-btn"
            type="danger"
            @click="continueCollect">
            {{ t('collect.continue') }}
          </el-button>
          <template v-else>
            <!-- 停止采集 -->
            <el-button class="big-btn" type="danger" @click="showStopTip = true">
              {{ t('collect.stopCollect') }}
            </el-button>

            <!-- 暂停采集 -->
            <span class="pause" @click="pauseCollect">
              {{ t('collect.pause') }}
            </span>
            <!-- 采集中loading进度条 -->
            <el-progress
              :stroke-width="16"
              class="collecting"
              :percentage="100"
              :indeterminate="true"
              :duration="3"
              status="success"
              :show-text="false" />
          </template>
        </template>

        <!-- 触发采集模式 -->
        <template v-else-if="collectStore.collecting_mode === '1'">
          <el-button class="big-btn" type="danger" @click="showStopTip = true">
            {{ t('collect.stopCollect') }}
          </el-button>
          <el-progress
            v-if="collectStore.triggerInCollecting"
            :stroke-width="16"
            class="collecting"
            :percentage="100"
            :indeterminate="true"
            :duration="3"
            status="success"
            :show-text="false" />
          <div v-else class="tag-trigger">
            <p>{{ t('collect.triggerTip') }}</p>
            <p class="tag-tip">{{ t('collect.waitTrigger') }}</p>
          </div>
        </template>
      </template>

      <!-- 准备中状态时的操作: 准备中按钮 & 取消按钮 -->
      <div
        v-else-if="['check', 'connect'].indexOf(collectStore.collectStatus) > -1"
        class="flex justify-between flex-1">
        <el-button type="primary" disabled>
          {{ t('collect.preparing') }}
          <Icon class="icon-load" icon="ri:loader-2-fill" />
        </el-button>
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <el-button type="danger" @click="stopCollect">{{ t('common.cancel') }}</el-button>
      </div>

      <!-- 准备失败状态的操作 -->
      <template v-else-if="collectStore.collectStatus === 'error'">
        <div class="flex-1">
          <el-button type="danger" @click="handleCollect">{{ t('collect.retryTip') }}</el-button>
          <span class="tip error">{{ t('collect.prepareTip') }}</span>
        </div>
        <el-button type="primary" @click="stopCollect">{{ t('collect.back') }}</el-button>
      </template>

      <!-- 未开始采集时默认状态的操作: 开始采集 -->
      <div v-else>
        <el-button class="big-btn" type="primary" @click="handleCollect">
          {{ t('collect.startCollect') }}
        </el-button>
        <span class="tip">
          <Icon class="icon" icon="mdi:warning-circle" />
          {{ t('collect.collectTip') }}
        </span>
      </div>
    </div>

    <!-- 显示采集准备弹窗时不展示一键mark功能 -->
    <div class="flex items-center">
      <!-- 一键mark: 采集中&暂停采集状态下可点 -->
      <template v-if="collectStore.isIncheck"></template>
      <div v-else class="quick-mark">
        <el-button type="primary" :disabled="!collectStore.isCollect" @click="quickMark">
          {{ t('collect.quickMark') }}
        </el-button>
        <p class="tip mark-tip">{{ t('collect.markTip') }}</p>
      </div>

      <!-- 全屏&退出全屏图标 -->
      <Icon
        v-if="collectStore.isFullScreen"
        class="full-screen"
        icon="radix-icons:exit-full-screen"
        @click="switchFullScreen" />
      <Icon
        v-else
        class="full-screen"
        icon="radix-icons:enter-full-screen"
        @click="switchFullScreen" />
    </div>
  </div>

  <!-- 未通过采集配置准备的错误弹窗 -->
  <el-dialog v-model="showDiskTip" align-center :title="t('common.tips')" width="400px">
    <!-- 未配置数据存储目录,弹窗提示,不进入采集 -->
    <span v-if="diskWarn === 1">
      {{ t('storage.noSetStartTip') }}
      <span class="link" @click="toManagePage">{{ t('storage.setPage') }}</span>
      {{ t('storage.noSetEndTip') }}
    </span>
    <!-- 磁盘存储空间不足,弹窗提示,不进入采集 -->
    <span v-if="diskWarn === 2">
      {{ t('storage.notEnoughStart') }}
      <span class="link" @click="toManagePage">{{ t('storage.setPage') }}</span>
      {{ t('storage.notEnoughEnd') }}.
    </span>
    <div class="text-right mt-4">
      <el-button type="primary" size="small" @click="showDiskTip = false">
        {{ t('common.knowTip') }}
      </el-button>
    </div>
  </el-dialog>

  <el-dialog v-model="showStopTip" :title="t('common.tips')">
    <div class="flex items-center">
      <div><Icon class="stop-icon" icon="mdi:warning-circle" /></div>
      <div>
        <p class="mb-1">{{ t('collect.stopTip') }}</p>
        <p>{{ t('collect.tagTip') }}</p>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showStopTip = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="stopCollect">
          {{ t('common.save') }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCollectStore } from '@/store/modules/collect'
import { useVisualizeStore } from '@/store/modules/visualize'
import { Icon } from '@iconify/vue'
import { setCollectionStatus } from '@/api/s1/collect'
import { getEnableDevices } from '@/api/s1/device'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { addTags } from '@/api/s1/tag/tagging'

const { t } = useI18n()
const router = useRouter()

const collectStore = useCollectStore()
const visualizeStore = useVisualizeStore()

let mainConEl: any = null // 记录需要全屏的dom元素

// 硬盘检查提示弹窗
const showDiskTip = ref<boolean>(false)
// 硬盘提示类型:1-未配置;2-磁盘不足
const diskWarn = ref<number>(0)
const showStopTip = ref<boolean>(false) // 控制停止采集弹窗显示

// 全屏模式改变时的监听事件
const fullscreenHandler = () => {
  let isInFull = document.fullscreenElement !== null
  collectStore.isFullScreen = isInFull
}

onMounted(() => {
  mainConEl = document.querySelector('#main-cont') // 设置全屏元素
  // 监听全屏改变事件
  document.addEventListener('fullscreenchange', fullscreenHandler)
})

// 组件卸载时,解绑全屏事件
onUnmounted(() => {
  document.removeEventListener('fullscreenchange', fullscreenHandler)
})

const setCollection = (status: string) => {
  setCollectionStatus({
    status: status,
  }).then(res => {
    if (status === 'check') {
      // 进入检查设备状态时,会返回指定的提示
      if (res.status === 201) {
        // 未配置磁盘,弹窗提示
        diskWarn.value = 1
        showDiskTip.value = true
      } else if (res.status === 202) {
        // 磁盘空间不足,弹窗提示
        diskWarn.value = 2
        showDiskTip.value = true
      } else if (res.status === 203) {
        // 未使能设备,toast提示错误信息
        return ElMessage.error(t('device.noDeviceTip'))
      } else if (res.status === 200) {
        getEnableDevices().then(res => {
          if (res.status !== 200) {
            return ElMessage.error(res.message)
          }
          collectStore.deviceConfig = res.data
        })
        collectStore.collectStatus = status
        collectStore.timingDetail = {}
      } else {
        return ElMessage.error(res.message)
      }
    } else {
      // 非检查设备状态,设置采集状态
      if (res.status !== 200) {
        return ElMessage.error(res.message)
      }
      collectStore.collectStatus = status
    }
  })
}

// 开始采集按钮点击事件
const handleCollect = () => {
  setCollection('check')
}

// 跳转至系统管理,配置硬盘
const toManagePage = () => {
  diskWarn.value = 2
  showDiskTip.value = false
  // 此处的处理是为了让侧边栏菜单同步更新
  visualizeStore.activePath = ''
  setTimeout(() => {
    visualizeStore.activePath = '/system_manage'
  })
  router.push('/system_manage')
}
// 结束采集停止
const stopCollect = () => {
  if (showStopTip.value) showStopTip.value = false
  collectStore.stopCollect()
}

// 暂停采集
const pauseCollect = () => {
  setCollection('pause')
}

// 一键MARK功能,打一个空标签
const quickMark = () => {
  addTags({ id: 0, type: 1 }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    collectStore.latestTag = res.data.tagging_target || {}
  })
}

// 继续采集
const continueCollect = () => {
  setCollection('collect')
}

// 切换全屏
const switchFullScreen = () => {
  if (!mainConEl) return
  collectStore.isFullScreen = !collectStore.isFullScreen
  if (collectStore.isFullScreen) {
    if (mainConEl.requestFullscreen) mainConEl.requestFullscreen()
    else if (mainConEl.webkitRequestFullscreen) mainConEl.webkitRequestFullscreen()
    else if (mainConEl.mozRequestFullScreen) mainConEl.mozRequestFullScreen()
    else if (mainConEl.msRequestFullScreen) mainConEl.msRequestFullScreen()
  } else {
    if (document.exitFullscreen) document.exitFullscreen()
    else if ((document as any).webkitCancelFullScreen) (document as any).webkitCancelFullScreen()
    else if ((document as any).mozCancelFullScreen) (document as any).mozCancelFullScreen()
    else if ((document as any).msExitFullscreen) (document as any).msExitFullscreen()
  }
}
</script>

<style lang="scss" scoped>
.oprt {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  // background-image: url('@/assets/output-14_51_34.gif');
  // // background-image: url('@/assets/output-15_0_59.gif');
  // background-position: center center;
  // background-repeat: no-repeat;
  // // background-size: contain;
  // background-size: 300px 60px;
  .collecting {
    flex: 1;
    margin: 0 1.8rem;
  }
  .pause {
    // color: $color-primary;
    margin-left: 0.8rem;
    vertical-align: bottom;
    cursor: pointer;
  }
  .quick-mark {
    position: relative;
  }
  .tip {
    font-size: 0.75rem;
    // color: $color-tip;
    vertical-align: bottom;
    margin-left: 0.8rem;
    .icon {
      display: inline;
      // color: $el-color-primary-light-5;
      font-size: 18px;
      margin-left: 0.4rem;
      vertical-align: bottom;
    }
    &.error {
      // color: $color-err;
    }
    &.mark-tip {
      position: absolute;
      right: 0;
      text-align: right;
      margin-top: 0.4rem;
      width: 14rem;
    }
  }
  .btn-r {
    padding-right: 300px;
  }
  .monitor {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    position: fixed;
    top: 62px;
    right: 24px;
    //background: $color-primary;
    color: #fff;
    text-align: center;
    line-height: 80px;
  }
  .big-btn {
    width: 12rem;
  }
  .full-screen {
    font-size: 2rem;
    margin-left: 2rem;
    cursor: pointer;
  }
}
.stop-icon {
  font-size: 1.5rem;
  //color: $color-warn;
  margin-right: 1rem;
}
.tag-trigger {
  flex: 1;
  text-align: center;
  margin-top: -1.1rem;
  .tag-tip {
    font-size: 1.2rem;
    // color: $color-primary;
  }
}
</style>
<style lang="scss">
.link {
  // color: $color-primary;
  cursor: pointer;
}
</style>
