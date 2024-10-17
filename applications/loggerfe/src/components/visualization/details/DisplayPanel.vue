<template>
  <div class="display-panel disable-selector">
    <!-- 可折叠配置 -->
    <el-collapse v-model="activeName">
      <!-- 显示设置 -->
      <el-collapse-item name="viewSet" :title="t('visualize.visibleSet')">
        <div class="item-wrap">
          <span class="mr-2">{{ t('visualize.pointSize') }}</span>
          <el-input-number
            v-model="pointSize"
            size="small"
            :min="0.0001"
            :max="10"
            :step="0.01"
            @change="changePointSize" />
        </div>
        <div class="item-wrap">
          <!-- 颜色维度 -->
          <div class="flex mt-4">
            <span class="mr-2">{{ t('visualize.colorProp') }}</span>
            <el-select
              v-model="colorProp"
              :placeholder="t('common.selectHolder')"
              size="small"
              @change="changeColorProp">
              <el-option v-for="item in colorPropOpt" :key="item" :label="item" :value="item" />
              <el-option key="isFixColor" lable="fixed" value="fixed"></el-option>
            </el-select>
            <!-- 当颜色策略为固定颜色值,设置固定颜色值 -->
            <div v-if="colorProp === 'fixed'" class="ml-4">
              <span class="mr-2">{{ t('common.colorVal') }}</span>
              <el-color-picker v-model="color" size="small" @change="changeColor" />
            </div>
          </div>
          <!-- 最大值/最小值/自动 -->
          <div class="mt-4">
            <span class="mr-2">{{ t('visualize.minVal') }}</span>
            <el-input-number
              v-model="minColorPropVal"
              size="small"
              :disabled="autoColorRange"
              :min="-numberLimit"
              :max="maxColorPropVal"
              @change="changeMinColor" />
          </div>
          <div class="mt-4">
            <span class="mr-2">{{ t('visualize.maxVal') }}</span>
            <el-input-number
              v-model="maxColorPropVal"
              size="small"
              :disabled="autoColorRange"
              :min="minColorPropVal"
              :max="numberLimit"
              @change="changeMaxColor" />
            <span class="mr-2 ml-4">{{ t('visualize.auto') }}</span>
            <el-switch v-model="autoColorRange" @change="changeAuto" />
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item name="dataSources" :title="t('visualize.dataSource')">
        <DataSource />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DataSource from './DataSource.vue'
// import { changeProps } from '@/basic_data/visualization'
import { useI18n } from 'vue-i18n'
// import { numberLimit } from '@/utils/common'
const { t } = useI18n()

const colorPropOpt = ['x', 'y', 'z', 'intensity'] // 颜色策略

const getStorage = () => {
  let storage
  try {
    storage = JSON.parse(localStorage.getItem('user_settings') || '{}')
  } catch {
    storage = {}
  }
  // 设置默认值:固定颜色自动赋色
  if (storage.isFixColor === undefined) storage.isFixColor = true
  if (storage.autoColorRange === undefined) storage.autoColorRange = true
  return storage
}

// 获取localStorage保存的值
const storageVal = getStorage()

const activeName = ref<string>('dataSources')
const pointSize = ref<number>(storageVal.pointSize || 0.01) // 点云大小
const colorProp = ref<string>(storageVal.isFixColor ? 'fixed' : storageVal.colorProp) // 颜色策略
const color = ref<string>('#00ffff') // 固定颜色值
const minColorPropVal = ref<number>(storageVal.minColorPropVal || 0) // 颜色范围最小值
const maxColorPropVal = ref<number>(storageVal.maxColorPropVal || 100) // 颜色范围最大值
const autoColorRange = ref<boolean>(storageVal.autoColorRange || false) // 是否是自动赋色

// 保存设置到localStorage
const setPropStorage = (params: { [key: string]: string | number | boolean }) => {
  for (let key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      storageVal[key] = params[key]
    }
  }
  changeProps(params)
  if (storageVal) {
    localStorage.setItem('user_settings', JSON.stringify(storageVal))
  }
}

const changePointSize = (value: number) => {
  setPropStorage({ pointSize: value })
}

const changeColorProp = (value: string) => {
  // 如果选择的是固定颜色,则设置颜色值
  if (value === 'fixed') {
    setPropStorage({ colorProp: '', isFixColor: true })
  } else {
    setPropStorage({ colorProp: value, isFixColor: false })
  }
}

const changeColor = (value: string) => {
  setPropStorage({ color: value })
}

const changeMinColor = (value: number) => {
  setPropStorage({ minColorPropVal: value })
}

const changeMaxColor = (value: number) => {
  setPropStorage({ maxColorPropVal: value })
}

const changeAuto = (value: boolean) => {
  setPropStorage({ autoColorRange: value })
}
</script>

<style scoped lang="scss">
.display-panel {
  // background: rgba(255, 255, 255, 1);
  width: 40%;
  min-width: 20rem;
  max-width: 30rem;
  height: 100%;
  overflow: auto;
}

.el-descriptions__content {
  .el-select {
    width: 120px;
  }
}

.operation {
  display: flex;
  justify-content: space-around;
  align-items: center;

  > * {
    margin-left: 5px;
  }
}

.expand-form {
  .el-input-number--mini {
    width: 100px;
  }

  .el-form-item {
    margin-bottom: 0px;
  }
}
.el-collapse-item {
  padding-left: 0.75rem;
}
</style>
