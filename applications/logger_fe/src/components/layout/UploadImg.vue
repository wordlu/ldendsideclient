<template>
  <el-upload
    v-model:file-list="fileList"
    :action="action"
    multiple
    class="img-upload"
    size="small"
    accept="image/*"
    list-type="picture-card"
    name="img"
    :class="{ 'no-add': fileList.length >= limit }"
    :on-exceed="handleExceed"
    :on-preview="previewImg"
    :before-upload="beforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-remove="handleDelete"
    :limit="limit">
    <Icon class="upload-icon" icon="bi:plus-lg" />
  </el-upload>

  <el-dialog v-model="showPreview">
    <div class="img-wrap">
      <img w-full :src="previewUrl" alt="Preview Image" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { UploadProps, UploadFile, UploadFiles } from 'element-plus'
import { Icon } from '@iconify/vue'
import { ElMessage } from 'element-plus'
import { imgUrl } from '@/utils/common'

const props = defineProps<{
  limit: {
    type: number
    default: 2
    require: false
  }
  action: string
}>()
const emits = defineEmits<{
  (e: 'upload', urlList: string[]): void
}>()

const fileList = ref<any>([])
const showPreview = ref<boolean>(false) // 是否打开预览图片
const previewUrl = ref<string>('') // 预览图片的地址

const setFileList = (list: string[]) => {
  fileList.value = list.map(i => ({ name: i, url: imgUrl(i) }))
}

defineExpose({ setFileList })

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

const handleSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles): void => {
  const urlList = uploadFiles.map((i: any) => (i.response ? i.response.data.url : i.name))
  emits('upload', urlList)
}

const previewImg: UploadProps['onPreview'] = uploadFile => {
  previewUrl.value = uploadFile.url!
  showPreview.value = true
}

const handleDelete = () => {
  emits('upload', [])
}
</script>

<style scoped lang="scss">
.upload-icon {
  font-size: 2.6rem;
}
</style>
<style lang="scss">
.no-add {
  .el-upload--picture-card {
    display: none;
  }
}
</style>
