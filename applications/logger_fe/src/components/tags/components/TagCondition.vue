<template>
  <el-form ref="formRef" :model="formData" label-width="10rem" size="small" class="wrap-top">
    <!-- <el-form-item label="使用车型" prop="type">
      <el-select v-model="formData.type">
        <el-option label="车型1" value="1"></el-option>
        <el-option label="车型2" value="2"></el-option>
      </el-select>
    </el-form-item> -->
    <template v-for="(item, index) in formData.expr_items" :key="index">
      <el-form-item
        :label="index === 0 ? t('tag.when') : ''"
        :label-width="index === 0 ? '10rem' : '0'">
        <div v-if="index !== 0" class="extra">
          <el-select v-model="item.expr" class="w-20">
            <el-option :label="t('tag.and')" value="&"></el-option>
            <el-option :label="t('tag.or')" value="|"></el-option>
          </el-select>
        </div>
        <el-form-item
          :prop="'expr_items.' + index + '.key'"
          :rules="{ required: true, message: t('common.emptyErr'), trigger: 'change' }">
          <el-select
            v-model="item.key"
            :placeholder="t('common.selectHolder')"
            @change="(val: any) => setExprItem(val, index)">
            <el-option
              v-for="(t_item, t_index) in exprOpts"
              :key="t_index"
              :label="t_item.label"
              :value="t_item.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          class="mx-4"
          :prop="'expr_items.' + index + '.operator'"
          :rules="{ required: true, message: t('common.emptyErr'), trigger: 'change' }">
          <el-select v-model="item.operator" :placeholder="t('common.selectHolder')">
            <el-option
              v-for="(o, o_i) in opts"
              :key="o_i"
              :label="o.label"
              :value="o.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item
          :prop="'expr_items.' + index + '.int'"
          :rules="{ required: true, message: t('common.emptyErr'), trigger: 'change' }">
          <el-input v-model="item.int" class="w-60" :placeholder="t('common.inputHolder')" />
        </el-form-item>

        <el-button
          v-if="index === 0"
          type="primary"
          size="small"
          class="ml-2"
          @click="addCondition">
          + {{ t('tag.addRule') }}
        </el-button>

        <Icon v-else class="del" icon="ci:close-big" @click="delCondition(index)" />
      </el-form-item>
    </template>

    <el-form-item :label="t('tag.triggerTip')" style="margin-bottom: 0">
      <el-button v-if="ruleData.tag_id" type="primary" class="mr-2" @click="showTagConfig">
        {{ ruleData.name }}
      </el-button>
      <el-button v-else type="primary" class="mr-2" @click="showTagConfig">
        {{ t('tag.selectTagTitle') }}
      </el-button>
      <span>{{ t('tag.triggerTag') }}</span>

      <div class="ml-10">
        <el-button type="primary" @click="saveRules(formRef)">{{ t('common.save') }}</el-button>
      </div>
    </el-form-item>
  </el-form>

  <el-dialog v-model="showSelTag" :title="t('tag.selectTagTitle')" destroy-on-close>
    <TagRadio :selected-id="formData.tag_id" @handle="handleSelectTag" />
  </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { ElMessage, FormInstance } from 'element-plus'
import TagRadio from '@/components/tags/components/TagRadio.vue'
import { setTaggingAutoTag } from '@/api/s1/tag'
import { AutoTagType, RulesType } from '@/api/s1/model/tag'

const { t } = useI18n()

const formRef = ref<FormInstance>()
const emits = defineEmits<{ (e: 'refresh'): void }>()

const opts = [
  { label: '=', value: '=' },
  { label: '<', value: '<' },
  { label: '>', value: '>' },
  { label: '<=', value: '<=' },
  { label: '>=', value: '>=' },
  { label: '!=', value: '!=' },
]

const exprOpts = [
  { label: '左转', value: 'left' },
  { label: '右转', value: 'right' },
  { label: '刹车', value: 'break' },
]

const formData = ref<RulesType>({
  tag_id: 0,
  exprs: '',
  expr_items: [
    {
      key: '',
      operator: '',
      int: '',
    },
  ],
})

let ruleData = ref<AutoTagType>({
  name: '',
  tag_id: 0,
  type: 0,
  enable: true,
})

const showSelTag = ref<boolean>(false) // 是否展示选择标签的弹窗

// 点击添加条件
const addCondition = () => {
  formData.value.expr_items.push({
    key: '',
    operator: '',
    int: '',
    expr: '&',
  })
}

const delCondition = (index: number) => {
  formData.value.expr_items.splice(index, 1)
}

const showTagConfig = () => {
  showSelTag.value = true
}

const setExprItem = (val: string, index: number) => {
  console.log(val, index)
  const label = exprOpts.find(i => i.value === val)?.label
  formData.value.expr_items[index].label = label
}

// 选择标签点击取消或保存
const handleSelectTag = (isSave: boolean, tag?: any) => {
  console.log(isSave, tag)
  if (isSave) {
    if (tag.type === 1) {
      // 点标签需要设置duration,目前固定写死
      formData.value.duration = 5
    } else {
      delete formData.value.duration
    }
    formData.value.tag_id = tag.id
    ruleData.value.type = tag.type
    ruleData.value.name = tag.name
    ruleData.value.tag_id = tag.id
  }
  showSelTag.value = false
}

// 保存规则
const saveRules = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log(ruleData.value)
      if (!ruleData.value.tag_id) {
        return ElMessage.error('请选择标签')
      }
      const submitData = formData.value
      let exprs = ''
      submitData.expr_items.map((r, i) => {
        if (i !== 0) {
          exprs += r.expr
        }
      })
      submitData.exprs = exprs
      ruleData.value.rule = submitData
      console.log(ruleData)
      setTaggingAutoTag(ruleData.value).then(res => {
        if (res.status !== 200) {
          return ElMessage.error(res.message)
        }
        ElMessage.success(t('common.successTip'))
        resetForm(formEl)
        emits('refresh')
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

// 保存完或者取消编辑时重置规则表单
const resetForm = (formEl: any) => {
  formEl?.resetFields()
  ruleData.value = {
    name: '',
    tag_id: 0,
    type: 0,
    enable: true,
  }
}

const setExprTarget = (target: AutoTagType) => {
  if (!target.rule) return
  target.rule.expr_items.forEach(el => {
    delete el.desc
  })
  formData.value = target.rule
  ruleData.value = target
}

defineExpose({ setExprTarget })
</script>

<style lang="scss" scoped>
.wrap-top {
  padding: 0.8rem 0;
  border-radius: var(--el-input-border-radius, var(--el-border-radius-base));
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
}
.extra {
  width: 10rem;
  text-align: right;
  padding-right: 12px;
}
.del {
  font-size: 1.2rem;
  margin-left: 0.5rem;
  cursor: pointer;
}
</style>
