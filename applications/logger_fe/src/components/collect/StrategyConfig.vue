<template>
  <div>
    <p class="main-tip mb-4">{{ t('collect.setTriggerTip') }}</p>
    <el-form class="ml-4" label-width="12rem" :model="formData" @submit.prevent>
      <el-form-item :label="t('collect.triggerMode')" required prop="stratagy">
        <el-radio-group v-model="formData.stratagy" class="ml-4">
          <el-radio label="1">{{ t('collect.tagging') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="t('collect.pointTagTime')">
        <el-input-number
          v-model="formData.tagging_duration"
          :min="1"
          :max="numberLimit"
          :disabled="collectStore.disableEdit"
          @change="setDuration"></el-input-number>
        <span class="ml-2">s</span>
      </el-form-item>
      <el-form-item :label="t('collect.enableOrNot')">
        <el-switch
          v-model="formData.enable"
          :disabled="collectStore.disableEdit"
          @change="setEnable"></el-switch>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'
import { numberLimit } from '@/utils/common'
import { useI18n } from 'vue-i18n'
import { getSettings, setSettings } from '@/api/s1/collect'
import { ElMessage } from 'element-plus'
import { useCollectStore } from '@/store/modules/collect'

const { t } = useI18n()
const collectStore = useCollectStore()

const formData = reactive({
  stratagy: '1',
  tagging_duration: 3,
  enable: false,
})

init()

async function init() {
  const res = await getSettings()
  if (res.status !== 200) {
    return ElMessage.error(res.message)
  }
  const mode = res.data.collecting_mode
  collectStore.collecting_mode = mode || '0'
  formData.tagging_duration = res.data.tagging_duration * 1
  formData.enable = mode === '1' // 0-盲采,1-打标触发
}

const setDuration = (val: number) => {
  const tagging_duration = val.toString()
  setSettings({ tagging_duration })
}
const setEnable = (val: boolean) => {
  const collecting_mode = val ? '1' : '0'
  setSettings({ collecting_mode }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    collectStore.collecting_mode = collecting_mode
  })
  // console.log(val)
}
</script>

<style scoped>
.el-radio-group {
  margin-left: 0;
}
.main-tip {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
}
</style>
