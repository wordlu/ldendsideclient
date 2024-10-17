<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
const { t } = useI18n()

interface rangeOptType {
  key: string
}

const rangeOptions: rangeOptType[] = [{ key: 'x' }, { key: 'y' }, { key: 'z' }]
const minVal = ref<number>(0)
const maxVal = ref<number>(100)

const selHelpProp = ref<string>('x')

// 调整视图模式下禁用
const props = defineProps<{
  disabled: boolean
}>()

const emits = defineEmits<{
  (e: 'applySelect', params: { prop: string; minVal: number; maxVal: number }): void
}>()

const applyClick = () => {
  emits('applySelect', { prop: selHelpProp.value, minVal: minVal.value, maxVal: maxVal.value })
}
</script>
<template>
  <el-tooltip :content="t('tools.selectHelper')" placement="right-end" :show-after="1000">
    <div>
      <el-popover
        placement="bottom-start"
        trigger="click"
        width="400"
        :title="t('tools.selectHelper')">
        <template #reference>
          <el-button :disabled="props.disabled" class="ml-6">
            <Icon icon="carbon:area" />
          </el-button>
        </template>
        <div>
          <span class="mr-2">属性:</span>
          <el-select v-model="selHelpProp" size="small" :teleported="false">
            <el-option
              v-for="item in rangeOptions"
              :key="item.key"
              :label="item.key"
              :value="item.key"></el-option>
          </el-select>
        </div>
        <div class="select-helper mt-4 mb-6">
          <span class="mr-2">{{ t('tools.toolsRange') }}:</span>
          <el-input-number
            v-model="minVal"
            controls-position="right"
            :step="1"
            size="small"></el-input-number>
          --
          <el-input-number
            v-model="maxVal"
            controls-position="right"
            :step="1"
            size="small"></el-input-number>
          <el-button type="primary" class="ml-2" size="small" @click="applyClick">
            {{ t('tools.toolsApply') }}
          </el-button>
        </div>
      </el-popover>
    </div>
  </el-tooltip>
</template>
