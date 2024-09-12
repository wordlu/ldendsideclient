<!-- 设备模板组件: 预览模板 & 查看模板 & 编辑模板共用的组件 -->
<template>
  <div class="img-wrap">
    <img v-for="(item, index) in imgUrls" :key="index" :src="imgUrl(item)" alt="" class="img" />
  </div>
  <el-form ref="formRef" :model="formData" label-width="10rem" :rules="formRules">
    <el-form-item :label="t('device.type')" prop="device_type_id">
      <el-input v-if="isPreview" placeholder="name" disabled :maxlength="50" />
      <el-select
        v-else
        v-model="formData.device_type_id"
        :placeholder="t('device.typeTip')"
        :disabled="isCheck || formData.id"
        @change="selectDeviceType">
        <el-option v-for="item in typeOpt" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
    </el-form-item>
    <el-form-item :label="t('device.name')" prop="name">
      <el-input v-model="formData.name" :placeholder="t('common.inputHolder')" :maxlength="50" />
    </el-form-item>
    <el-form-item :label="t('device.relDataDir')" prop="rel_data_dir">
      <el-input
        v-model="formData.rel_data_dir"
        :placeholder="t('common.inputHolder')"
        :maxlength="50" />
    </el-form-item>
    <el-form-item :label="t('device.maxFrame')" prop="frame_num_per_file">
      <el-input-number v-model="formData.frame_num_per_file" precision="0" :max="999999" :min="0" />
    </el-form-item>
    <RenderComp type="input" :template="formData.config" />
    <el-form-item :label="t('device.description')">
      <el-input
        v-model="formData.description"
        :placeholder="t('common.inputHolder')"
        :maxlength="50" />
    </el-form-item>
    <el-form-item :label="t('device.details')">
      <el-input v-model="formData.detail" :placeholder="t('common.inputHolder')" :maxlength="50" />
    </el-form-item>
    <el-form-item :label="t('common.enable')">
      <el-switch v-model="formData.enable"></el-switch>
    </el-form-item>
    <el-form-item v-if="!isPreview">
      <template v-if="isCheck">
        <el-button @click="cancel">{{ t('common.back') }}</el-button>
      </template>
      <template v-else>
        <el-button type="primary" @click="submitForm(formRef)">{{ t('common.submit') }}</el-button>
        <el-button @click="cancel">{{ t('common.cancel') }}</el-button>
      </template>
    </el-form-item>
  </el-form>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { FormRules, ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { getDeviceTypeById, getDeviceById, getDeviceType, updateDevice } from '@/api/s1/device'
import { DeviceType } from '@/api/s1/model/device'
import RenderComp from '@/components/device/RenderComp.vue'
import { imgUrl } from '@/utils/common'
import { defaultConfig } from '@/basic_data/device'

const { t } = useI18n()

const formRef = ref<FormInstance>()

const route = useRoute()
const router = useRouter()

let deviceTypeList: DeviceType[] = [] // 保存所有可选的设备类型,仅保存非响应
let isCheck = ref<boolean>(false) // 是否是查看模板
let isPreview = ref<boolean>(false) // 是否是预览模板
const imgUrls = ref<string[]>([])

// 所有可选的设备类型,编辑状态下不可修改
const typeOpt = reactive<Array<{ id: number; name: string }>>([])

const formData = reactive<any>({})

onMounted(async () => {
  const category: any = route.query.c || '' // 种类
  const id = Number(route.query.id)
  const device_type_id = Number(route.query.t_id)
  isCheck.value = route.query.is_check !== undefined
  isPreview.value = route.query.is_preview !== undefined
  if (isPreview.value) {
    // 预览设备,使用路由参数传递的模板
    const config = JSON.parse(route.query.config || '{}')
    formData.config = config.template || []
    imgUrls.value = config.img_url
  } else if (category) {
    // 新增设备,获取当前种类下的全部设备类型
    getDeviceType({ category }).then(res => {
      deviceTypeList = res.data.results || []
      ;(res.data.results || []).forEach(item => {
        typeOpt.push({ id: item.id, name: item.name })
      })
    })
    formData.category = category
  } else if (isCheck.value) {
    // 查看模板
    getDeviceTypeDetail(device_type_id)
  } else if (id) {
    // 编辑模式下,根据id获取设备信息,根据deviceTypeId获取指定设备类型的信息
    await getDeviceTypeDetail(device_type_id)
    const info = await getDeviceById(id)
    let config = info.data.config || {}
    formData.config.forEach(temp => {
      temp.value = config[temp.value_name]
    })
    defaultConfig.forEach((p: string) => {
      formData[p] = info.data[p]
    })
  }
})

// 自定义的表格校验规则
let formRules = ref<FormRules>({
  device_type_id: { required: true, message: t('common.emptyErr'), trigger: 'change' },
  name: { required: true, message: t('common.emptyErr'), trigger: 'blur' },
  rel_data_dir: { required: true, message: t('common.emptyErr'), trigger: 'blur' },
  frame_num_per_file: { required: true, message: t('common.emptyErr'), trigger: 'blur' },
})

// 获取指定模板的详细信息
const getDeviceTypeDetail = async (type_id: number) => {
  const res = await getDeviceTypeById(type_id)
  if (res.status === 200) {
    formData.device_type_id = type_id
    formData.config = res.data.config_template || []
    typeOpt.push({ id: res.data.id, name: res.data.name })
    imgUrls.value = res.data.img_url ? res.data.img_url.split(',') : []
  }
}

// 根据不同设备类型,封装动态模板
const getTemplate = (device_type_id: number) => {
  const type = deviceTypeList.find(item => item.id === device_type_id)
  if (!type) return []
  const template: any[] = type.config_template || []
  formData.config = template
  formData.device_type_id = device_type_id
  imgUrls.value = type.img_url ? type.img_url.split(',') : []
}

const selectDeviceType = (value: number) => {
  getTemplate(value)
}

// 提交表单
const submitForm = (formEl: FormInstance | undefined) => {
  if (!formEl || !formData) return
  console.log(formData)
  // return
  formEl.validate(valid => {
    if (valid) {
      let device_type_name = typeOpt?.find(item => item.id === formData.device_type_id)?.name || ''
      const config: any = {
        name: formData.name,
        device_type_name,
        frame_num_per_file: formData.frame_num_per_file,
      }
      formData.config.forEach(item => {
        let value = item.value
        config[item.value_name] = value
      })

      const params: any = {}
      defaultConfig.forEach(c => {
        params[c] = formData[c]
      })
      params.config = config
      params.device_type_name = device_type_name
      if (route.query.id) {
        params.id = route.query.id
      }
      console.log(params)
      // return
      updateDevice(params).then(res => {
        if (res.status === 200) {
          router.go(-1)
        } else {
          ElMessage.error(res.message)
        }
      })
    } else {
      console.log('error submit!')
      return false
    }
  })
}
// 点击取消返回上一页
const cancel = () => {
  router.go(-1)
}
</script>

<style lang="scss" scoped>
.img-wrap {
  text-align: center;
  margin-bottom: 1rem;
}

.img {
  width: 36%;
  display: inline-block;
  margin-right: 1rem;
  height: 11rem;
  object-fit: contain;
}
</style>
