<!-- 新增|编辑标签弹窗 -->
<template>
  <el-form ref="formRef" :model="target" label-width="120px" :rules="rules">
    <!-- 标签类型 -->
    <el-form-item :label="t('tag.tagType')">
      <el-select v-model="target.type">
        <el-option :label="t('tag.pointTag')" :value="1" />
        <el-option :label="t('tag.lineTag')" :value="2" />
      </el-select>
    </el-form-item>
    <!-- 所属分组 -->
    <el-form-item :label="t('tag.group')">
      <el-select
        v-model="target.tagging_group_id"
        :placeholder="t('common.selectHolder')"
        clearable>
        <el-option
          v-for="group in groupList"
          :key="group.id"
          :label="group.name"
          :value="group.id" />
      </el-select>
    </el-form-item>
    <!-- 标签名称 -->
    <el-form-item :label="t('tag.tagName')" prop="name">
      <el-input v-model.trim="target.name" :placeholder="t('common.inputHolder')" maxlength="10" />
    </el-form-item>
    <!-- 标签英文名称 -->
    <el-form-item :label="t('tag.enName')" prop="en_name">
      <el-input v-model="target.en_name" :placeholder="t('common.inputHolder')" maxlength="20" />
    </el-form-item>
    <el-form-item :label="t('register.uploadImg')">
      <UploadImg ref="uploadRef" :limit="1" :action="uploadUrl" @upload="getUploadUrls" />
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
import { ref, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, FormRules, FormInstance } from 'element-plus'
import { enNameReg } from '@/utils/common'
import { TagGroupType, TagType } from '@/api/s1/model/tag'
import { getTagDetail, updateTag, getTagGroupList } from '@/api/s1/tag'
import UploadImg from '@/components/layout/UploadImg.vue'
import { uploadUrl } from '@/utils/common'

const { t } = useI18n()

const formRef = ref<FormInstance>()
const uploadRef = ref()

const props = defineProps<{
  id: number
}>()

const emits = defineEmits<{
  (e: 'handle', isSave: boolean, path?: string): void
}>()

// 当前编辑的标签,新增时为空
const target = ref<TagType>({})

const groupList = ref<TagGroupType[]>([])

onMounted(() => {
  getTagGroupList({ page: 1, page_size: 99999 }).then(res => {
    if (res.status === 200) {
      groupList.value = res.data.results
    }
  })
  if (props.id > -1) {
    // 存在id,为编辑状态
    getTagDetail(props.id).then(res => {
      if (res.status !== 200) {
        return ElMessage.error(res.message)
      }
      if (res.data.tagging_group_id === 0) {
        res.data.tagging_group_id = null
      }
      target.value = res.data
      if (res.data.img_url) {
        uploadRef.value?.setFileList([res.data.img_url])
      }
    })
  }
})

// 英文名称校验,支持字母数字下划线,数字不能在首位
const checkEnName = (rule: any, value: any, callback: any) => {
  if (!enNameReg.test(value)) {
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

// 上传成功获取返回的图片url
const getUploadUrls = (urls: string[]): void => {
  target.value.img_url = urls.join(',')
}

// 点击取消
const handleCancel = () => {
  emits('handle', false)
}

// 点击保存
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.validate(valid => {
    if (valid) {
      const { name, en_name, description, tagging_group_id, type, img_url } = target.value
      const params: TagType = {
        name,
        en_name,
        description,
        tagging_group_id,
        type,
        img_url: img_url || '',
      }
      if (props.id > -1) {
        params.id = props.id
      }
      updateTag(params).then(res => {
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
