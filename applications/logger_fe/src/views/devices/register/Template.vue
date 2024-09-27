<template>
  <p class="text-xl font-semibold mb-4">{{ t('register.addTemplate') }}</p>
  <div class="divide-y divide-dashed">
    <!-- 设备类型模板固定字段: 预览展示无交互 -->
    <el-form label-width="10rem">
      <el-form-item :label="t('device.type')" required>
        <span>{{ pageData?.name }}</span>
      </el-form-item>
      <el-form-item :label="t('device.name')" required>
        <el-input :placeholder="t('common.inputHolder')" disabled />
      </el-form-item>
      <el-form-item :label="t('device.relDataDir')" required>
        <el-input :placeholder="t('common.inputHolder')" disabled />
      </el-form-item>
      <el-form-item :label="t('device.maxFrame')" required>
        <el-input-number :placeholder="t('common.inputHolder')" disabled />
      </el-form-item>
      <el-form-item :label="t('device.description')">
        <el-input :placeholder="t('common.inputHolder')" disabled />
      </el-form-item>
      <el-form-item :label="t('device.details')">
        <el-input :placeholder="t('common.inputHolder')" disabled />
      </el-form-item>
      <el-form-item :label="t('common.enable')">
        <el-switch disabled></el-switch>
      </el-form-item>
    </el-form>

    <div class="py-4">
      <!-- 自定义字段 -->
      <div>
        <!-- 自定义字段顶部标题 -->
        <div class="mb-2">
          <span class="text-lg font-medium mr-4"></span>
          <el-button type="primary" size="small" @click="addTemplate">
            + {{ t('register.selfParams') }}
          </el-button>
        </div>
        <!-- 新增字段的模板区域 -->
        <div v-if="!!templateForm" class="bg-overlay mt-4 py-2 rounded template">
          <el-form
            ref="templateFormRef"
            :model="templateForm"
            :rules="templateRules"
            label-width="10rem">
            <el-form-item :label="t('register.paramName')" prop="name">
              <el-input
                v-model="templateForm.name"
                class="inline-inp"
                :placeholder="t('register.showName')"
                :maxlength="50"
                size="small" />

              <el-form-item label="" prop="keyName" class="inline-label">
                <el-input
                  v-model="templateForm.keyName"
                  class="inline-inp"
                  :placeholder="t('register.enName')"
                  :maxlength="50"
                  size="small" />
              </el-form-item>
            </el-form-item>
            <el-form-item :label="t('register.paramType')" prop="type">
              <el-radio-group v-model="templateForm.type" size="small">
                <el-radio label="textInput">{{ t('register.textInput') }}</el-radio>
                <el-radio label="numberInt">{{ t('register.numberInt') }}</el-radio>
                <el-radio label="numberFloat">{{ t('register.numberFloat') }}</el-radio>
                <el-radio label="ipInput">{{ t('register.ipInput') }}</el-radio>
                <el-radio label="yesOrNo">{{ t('register.yesOrNo') }}</el-radio>
                <el-radio label="tf">tf</el-radio>
                <el-radio label="regInput">{{ t('register.selfReg') }}</el-radio>
                <!-- <el-radio label="selector">下拉选择</el-radio> -->
              </el-radio-group>
            </el-form-item>
            <!-- 当类型为自定义正则时,出现自定义正则输入框 -->
            <el-form-item v-if="templateForm.type === 'regInput'" label="" prop="regValue">
              <el-input
                v-model="templateForm.regValue"
                size="small"
                :placeholder="t('register.regHolder')" />
            </el-form-item>
            <el-form-item v-if="templateForm.type === 'selector'" label="添加选项">
              <el-input v-model="templateForm.tempOptIpt" size="small" width="200px"></el-input>
              <el-button size="small" @click="addTemplateOpts">确认</el-button>
            </el-form-item>
            <!-- 当输入类型为tf或者是否选择时不展示是否必填选项 -->
            <el-form-item
              v-if="templateForm.type !== 'tf' && templateForm.type !== 'yesOrNo'"
              :label="t('register.isRequired')"
              prop="required">
              <el-radio-group v-model="templateForm.required" size="small">
                <el-radio :label="true">{{ t('register.yes') }}</el-radio>
                <el-radio :label="false">{{ t('register.no') }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button size="small" @click="cancelTemplate">{{ t('common.cancel') }}</el-button>
              <el-button type="primary" size="small" @click="saveTemplate(templateFormRef)">
                {{ t('common.save') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
        <!-- 用户已添加的自定义字段 -->
        <div class="mt-4">
          <el-form label-width="10rem">
            <el-form-item
              v-for="(item, index) in templateConfig"
              :key="index"
              :label="item.name.zhCn"
              :prop="item.value_name"
              :required="item.required">
              <RenderComp :type="item.type" :is-static="true" />
              <el-button class="ml-4" type="primary" text @click="deleteParam(index)">
                {{ t('common.delete') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="py-4">
        <div class="text-lg font-medium mb-2">{{ t('register.timingModeTip') }}</div>
        <div class="pl-8 mb-4">
          <el-radio-group v-if="pageData" v-model="pageData.timing_mode" size="small">
            <el-radio label="-">{{ t('register.noTiming') }}</el-radio>
            <el-radio label="ptp">ptp</el-radio>
            <el-radio label="gptp">gptp</el-radio>
          </el-radio-group>
        </div>
      </div>
      <div>
        <div class="text-lg font-medium mb-2">
          {{ t('register.uploadImg') }}
          <span class="el-upload__tip ml-4">
            {{ t('register.imgTip') }}
          </span>
        </div>
        <div class="pl-8 img">
          <el-upload
            v-model:file-list="fileList"
            :action="uploadUrl"
            multiple
            class="img-upload"
            size="small"
            accept="image/*"
            list-type="picture-card"
            name="img"
            :class="{ 'no-add': fileList.length >= 2 }"
            :on-exceed="handleExceed"
            :on-preview="previewImg"
            :before-upload="beforeUpload"
            :on-error="handleError"
            :limit="2">
            <Icon class="upload-icon" icon="bi:plus-lg" />
          </el-upload>
        </div>
      </div>

      <div class="mt-8">
        <el-button @click="cancel">{{ t('common.cancel') }}</el-button>
        <el-button type="info" @click="preview">{{ t('common.preview') }}</el-button>
        <el-button type="primary" @click="clickSubmit">
          {{ t('register.createTemplate') }}
        </el-button>
      </div>

      <el-dialog v-model="showPreview">
        <div class="img-wrap">
          <img w-full :src="previewUrl" alt="Preview Image" />
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Icon } from '@iconify/vue'
import type { FormInstance, FormRules, UploadProps } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { getDeviceTypeById, updateDeviceType } from '@/api/s1/device'
import { DeviceType, ConfigTemplate } from '@/api/s1/model/device'
import RenderComp from '@/components/device/RenderComp.vue'
import { ipReg, deviceFixedParams, numberLimit } from '@/utils/common'
import { uploadUrl, imgUrl } from '@/utils/common'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const pageData = ref<DeviceType | null>(null)
// 自定义字段模板对象: 不为null时显示模板对象
const templateForm = ref<{
  name: string
  keyName: string
  type: string
  required: boolean
  regValue: string
  options: Array<string | number>
  tempOptIpt: string
} | null>(null)
// 自定义字段模板表单form实例,新增字段时进行校验
const templateFormRef = ref()
// 用户已定义的模板
const templateConfig = ref<ConfigTemplate[]>([])

const showPreview = ref<boolean>(false) // 是否打开预览图片
const previewUrl = ref<string>('') // 预览图片的地址

onMounted(() => {
  // 根据id获取详细信息
  const id = Number(route.query.id)
  getDeviceTypeById(id).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    pageData.value = res.data
    templateConfig.value = res.data.config_template || []
    if (res.data.img_url) {
      fileList.value = res.data.img_url.split(',').map(i => ({ name: i, url: imgUrl(i) }))
    }
  })
})

// 自定义新增字段的名称校验
const templateRules = reactive<FormRules>({
  name: [
    { required: true, message: t('common.emptyErr'), trigger: 'blur' },
    { validator: checkName, trigger: 'blur' },
  ],
  keyName: [
    { required: true, message: t('common.emptyErr'), trigger: 'blur' },
    { validator: checkKeyName, trigger: 'blur' },
  ],
  regValue: { required: true, message: t('common.emptyErr'), trigger: 'blur' },
})

// 自定义字段,点击添加按钮,创建一个新的模板对象
const addTemplate = () => {
  templateForm.value = {
    name: '',
    keyName: '',
    type: 'textInput',
    required: true,
    regValue: '',
    options: [],
    tempOptIpt: '',
  }
}

const addTemplateOpts = () => {
  if (!templateForm.value) return
  const inp: string = templateForm.value.tempOptIpt
  if (String(Number(inp)) === 'NaN') {
    templateForm.value.options.push(inp)
  } else {
    templateForm.value.options.push(Number(inp))
  }
  templateForm.value.tempOptIpt = ''
}

// 取消保存模板
const cancelTemplate = () => {
  templateForm.value = null
}

// 保存模板,创建一个新的字段
const saveTemplate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate(valid => {
    if (valid) {
      if (!templateForm.value) return
      const { name, type, keyName, required, regValue, options } = templateForm.value
      let verify = {}
      if (type.indexOf('number') > -1) {
        verify = {
          type: 'number',
          maxValue: numberLimit,
          minValue: -numberLimit,
        }
      } else if (type === 'ipInput') {
        const reg_str = ipReg.toString()
        verify = {
          type: 'regex',
          format_reg: reg_str.substring(1, reg_str.length - 1),
        }
      } else if (type === 'regInput') {
        verify = {
          type: 'regex',
          format_reg: regValue,
        }
      }
      let obj = {
        name: { en: name, zhCn: name },
        type: type,
        value: type === 'tf' ? {} : type === 'yesOrNo' ? true : '', // 是非选择,value默认为true
        value_name: keyName,
        required: ['tf', 'yesOrNo'].indexOf(type) > -1 ? false : required, // 是非选择和tf非必选
        verify,
      }
      if (type === 'selector') {
        obj.options = options
      }
      templateConfig.value.push(obj)
      console.log(templateConfig.value)
      templateForm.value = null
    } else {
      console.log('error submit!')
      return false
    }
  })
}
// 删除已添加的自定义字段
const deleteParam = (index: number) => {
  templateConfig.value.splice(index, 1)
}

const fileList = ref<any>([])

const handleExceed: UploadProps['onExceed'] = () => {
  ElMessage.warning(`最多可上传两张图片`)
}

// 文件上传失败
const handleError = (err: Error) => {
  ElMessage.error(err.message)
}

// 图片上传前校验大小
const beforeUpload: UploadProps['beforeUpload'] = rawFile => {
  if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('单张图片大小不可超过2MB!')
    return false
  }
  return true
}

const previewImg: UploadProps['onPreview'] = uploadFile => {
  previewUrl.value = uploadFile.url!
  showPreview.value = true
}

// 点击取消,关闭模板配置页面
const cancel = () => {
  router.go(-1)
}
// 点击预览,跳转模板预览页面
const preview = () => {
  console.log(JSON.stringify(templateConfig.value))
  const resolver = router.resolve({
    path: '/template_preview',
    query: {
      config: JSON.stringify({
        img_url: getImgUrl(),
        template: templateConfig.value,
      }),
      is_preview: 1,
    },
  })
  window.open(resolver.href, '_blank')
}
// "生成模板"按钮点击
const clickSubmit = () => {
  ElMessageBox.confirm(t('register.tipContent'), t('common.tips'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning',
  })
    .then(() => {
      submitTemplate()
    })
    .catch(() => {
      console.log('1111')
    })
}

// 提交模板
async function submitTemplate() {
  if (!pageData.value) return
  const img = getImgUrl()
  updateDeviceType({
    id: pageData.value.id,
    category: pageData.value.category,
    name: pageData.value.name,
    config_demo: '',
    default_config: '',
    config_template: templateConfig.value,
    timing_mode: pageData.value.timing_mode,
    register_status: 'registered',
    img_url: img.join(','),
  })?.then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    cancel()
  })
  console.log(templateConfig.value)
}

function getImgUrl() {
  return (
    fileList.value.map(i => {
      return i.response ? i.response.data.url : i.name
    }) || []
  )
}

// 校验自定义字段的英文名称: 字段格式是否符合,字段名称是否已存在
function checkKeyName(rule: any, value: any, callback: any) {
  if (!/^[a-zA-Z_]{0,}$/.test(value)) {
    return callback(new Error(t('common.paramErr')))
  }
  const names = templateConfig.value
    .map((i: any) => i.value_name)
    .concat(deviceFixedParams.map(i => i.keyName))
  if (names.indexOf(value) > -1) {
    return callback(new Error(t('common.existErr')))
  }
  callback()
}

// 校验自定义字段的显示名称: 字段名称是否已存在
function checkName(rule: any, value: any, callback: any) {
  const names = templateConfig.value
    .map((i: any) => i.name.zhCn)
    .concat(deviceFixedParams.map(i => i.name))
  if (names.indexOf(value) > -1) {
    return callback(new Error(t('common.existErr')))
  }
  callback()
}
</script>

<style scoped lang="scss">
.inline-inp {
  width: 10rem;
}
.template {
  .el-form-item {
    margin-bottom: 0.5rem;
    &.inline-label {
      margin-bottom: 0;
      margin-left: 1rem;
    }
  }
}
.img {
  .el-upload__tip {
    display: inline;
  }
}
.upload-icon {
  font-size: 2.6rem;
}
.img-wrap {
  max-height: 36rem;
  overflow: auto;
  img {
    margin: 0 auto;
  }
}
</style>
<style lang="scss">
.no-add {
  .el-upload--picture-card {
    display: none;
  }
}
</style>
