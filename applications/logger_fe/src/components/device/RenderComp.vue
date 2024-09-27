<template>
  <!-- 根据类型渲染不同的组件 -->
  <!-- 静态展示,无交互不可编辑 -->
  <template v-if="props.isStatic">
    <el-input-number v-if="props.type === 'numberInt'" disabled />
    <el-input-number v-else-if="props.type === 'numberFloat'" disabled />
    <el-radio-group v-else-if="props.type === 'yesOrNo'" disabled :model-value="true">
      <el-radio :label="true">{{ t('common.yes') }}</el-radio>
      <el-radio :label="false">{{ t('common.no') }}</el-radio>
    </el-radio-group>
    <template v-else-if="props.type === 'tf'">
      <div>
        <span class="label">x</span>
        <el-input-number disabled />
        <span class="label">y</span>
        <el-input-number disabled />
        <span class="label">z</span>
        <el-input-number disabled />
      </div>
      <div class="mt-2">
        <span class="label">roll</span>
        <el-input-number disabled />
        <span class="label">pitch</span>
        <el-input-number disabled />
        <span class="label">yaw</span>
        <el-input-number disabled />
      </div>
    </template>
    <el-input v-else disabled :placeholder="t('common.inputHolder')" />
  </template>

  <template v-else>
    <el-form-item
      v-for="(item, index) in props.template"
      :key="index"
      :label="item.name.zhCn"
      :prop="'config.' + index + '.value'"
      :rules="formatRules(item)">
      <el-input-number
        v-if="item.type === 'numberInt'"
        v-model="item.value"
        precision="0"
        :max="item.verify.maxValue"
        :min="item.verify.minValue" />
      <el-input-number
        v-else-if="item.type === 'numberFloat'"
        v-model="item.value"
        precision="6"
        :max="item.verify.maxValue"
        :min="item.verify.minValue" />

      <el-radio-group v-else-if="item.type === 'yesOrNo'" v-model="item.value">
        <el-radio :label="true">{{ t('common.yes') }}</el-radio>
        <el-radio :label="false">{{ t('common.no') }}</el-radio>
      </el-radio-group>
      <template v-else-if="item.type === 'tf'">
        <div>
          <span class="label">x</span>
          <el-input-number
            v-model="item.value.x"
            precision="5"
            :max="numberLimit"
            :min="-numberLimit" />
          <span class="label">y</span>
          <el-input-number
            v-model="item.value.y"
            precision="5"
            :max="numberLimit"
            :min="-numberLimit" />
          <span class="label">z</span>
          <el-input-number
            v-model="item.value.z"
            precision="5"
            :max="numberLimit"
            :min="-numberLimit" />
        </div>
        <div class="mt-2">
          <span class="label">roll</span>
          <el-input-number
            v-model="item.value.roll"
            precision="5"
            :max="numberLimit"
            :min="-numberLimit" />
          <span class="label">pitch</span>
          <el-input-number
            v-model="item.value.pitch"
            precision="5"
            :max="numberLimit"
            :min="-numberLimit" />
          <span class="label">yaw</span>
          <el-input-number
            v-model="item.value.yaw"
            precision="5"
            :max="numberLimit"
            :min="-numberLimit" />
        </div>
      </template>
      <template v-else-if="item.type === 'selector'">
        <el-select v-model="item.value">
          <el-option v-for="opt in item.options" :key="opt" :value="opt" :label="opt" />
        </el-select>
      </template>
      <el-input v-else v-model="item.value" maxlength="50" :placeholder="t('common.inputHolder')" />
    </el-form-item>
  </template>
</template>
<script setup lang="ts">
import { numberLimit } from '@/utils/common'
import { useI18n } from 'vue-i18n'
/**
 * type - 具体渲染的组件类型,静态模板是需要
 * isStatic - 是否静态,静态展示无交互不可编辑,默认false
 * template - 组件绑定的模板对象,非静态时需要
 */
const props = defineProps<{ type?: string; isStatic?: boolean; template?: any }>()

const { t } = useI18n()

const formatRules = item => {
  const res = []
  if (item.required) {
    res.push({
      required: item.required || false,
      message: t('common.emptyErr'),
      trigger: 'blur',
    })
  }
  if (item.verify.type === 'regex') {
    res.push({
      validator: (rule: any, value: any, callback: any) => {
        validator(value, callback, item.verify)
      },
      trigger: 'blur',
    })
  }
  return res
}

function validator(value: any, callback: any, verify: any) {
  if (!verify.required) return callback()
  if (!verify) return callback()
  if (verify.type === 'regex') {
    // 正则格式的校验
    const reg = new RegExp(verify.format_reg)
    if (!reg.test(value)) {
      callback(new Error(t('common.paramErr')))
    } else {
      callback()
    }
  }
  callback()
}
</script>
<style scoped>
.el-input {
  flex: 1;
}
.label {
  display: inline-block;
  text-align: right;
  padding-right: 0.5rem;
  width: 3.6rem;
}
</style>
