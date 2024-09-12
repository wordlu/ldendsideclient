<!-- 新增|编辑标签分组弹窗 -->
<template>
  <el-form ref="formRef" :model="target" label-width="80px" :rules="rules">
    <!-- 分组名称 -->
    <el-form-item :label="t('tag.groupName')" prop="name">
      <el-input v-model.trim="target.name" :placeholder="t('common.inputHolder')" maxlength="10" />
    </el-form-item>
    <!-- 分组英文名称 -->
    <el-form-item :label="t('tag.enName')" prop="en_name">
      <el-input v-model="target.en_name" :placeholder="t('common.inputHolder')" maxlength="20" />
    </el-form-item>
    <!-- 描述说明 -->
    <el-form-item :label="t('tag.description')">
      <el-input
        v-model="target.description"
        type="textarea"
        show-word-limit
        :placeholder="t('common.inputHolder')"
        :rows="3"
        maxlength="100" />
    </el-form-item>
  </el-form>
  <div class="el-dialog__footer">
    <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
    <el-button type="primary" @click="submitForm(formRef)">
      {{ t('common.save') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, FormRules, FormInstance } from 'element-plus'
import { enNameReg } from '@/utils/common'
import { getTagGroupDetail, updateTagGroup } from '@/api/s1/tag'
import { TagGroupType } from '@/api/s1/model/tag'

const { t } = useI18n()
const formRef = ref<FormInstance>()

const props = defineProps<{
  id: number
}>()

// 当前编辑的标签,新增时为空
const target = ref<TagGroupType>({ name: '', en_name: '', description: '' })

onMounted(() => {
  if (props.id > -1) {
    // 存在id,为编辑状态
    getTagGroupDetail(props.id).then(res => {
      if (res.status !== 200) {
        return ElMessage.error(res.message)
      }
      target.value = res.data
    })
  }
})

const emits = defineEmits<{
  (e: 'handle', isSave: boolean, path?: string): void
}>()

// 英文名称校验,支持字母数字下划线,数字不能在首位
const checkEnName = (rule: any, value: any, callback: any) => {
  if (!enNameReg.test(value)) {
    console.log(t('common.enNameErr'))
    callback(t('common.enNameErr'))
  }
  callback()
}

// 表单校验规则
const rules = reactive<FormRules>({
  name: [{ required: true, message: t('common.emptyErr'), trigger: 'blur' }],
  en_name: [
    { required: true, message: t('common.emptyErr'), trigger: 'blur' },
    { validator: checkEnName, trigger: 'blur' },
  ],
})

// 点击取消
const handleCancel = () => {
  emits('handle', false)
}
// 点击保存
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(valid => {
    if (valid) {
      const { name, en_name, description } = target.value
      const params: TagGroupType = {
        name,
        en_name,
        description,
      }
      if (props.id > -1) {
        params.id = props.id
      }
      updateTagGroup(params).then(res => {
        if (res.status !== 200) {
          return ElMessage.error(res.message)
        }
        ElMessage.success(t('common.successTip'))
        emits('handle', true)
      })
    } else {
      console.log('error submit!')
      return false
    }
  })
}
</script>

<style scoped lang="scss">
.el-dialog__footer {
  padding-bottom: 0;
  padding-top: 30px;
}
.el-form-item {
  margin-bottom: 26px;
}
</style>
