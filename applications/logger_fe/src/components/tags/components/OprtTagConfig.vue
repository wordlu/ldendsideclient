<!-- 添加当前作业标签 -->
<template>
  <!-- filterable
    :filter-method="filterMethod"
    filter-placeholder="搜索" -->
  <el-transfer
    v-model="selectedKeys"
    class="add-oprt-tag"
    size="small"
    filterable
    :filter-method="filterMethod"
    filter-placeholder="搜索"
    :data="tagData"
    :titles="[t('tag.unselectTag'), t('tag.selectTag')]"
    :props="{
      key: 'id',
      label: 'name',
    }"
    target-order="push" />

  <p class="add-tip">
    {{ t('tag.addTagTip') }}
    <span @click="toAddTag">{{ t('tag.clickHere') }}</span>
    {{ t('tag.toAdd') }}
  </p>
  <div class="el-dialog__footer">
    <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
    <el-button type="primary" @click="handleSave">
      {{ t('common.save') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getTagList } from '@/api/s1/tag'
import { TagType } from '@/api/s1/model/tag'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useVisualizeStore } from '@/store/modules/visualize'

const { t } = useI18n()
const router = useRouter()
const visualizeStore = useVisualizeStore()

const emits = defineEmits<{
  (e: 'handle', isSave: boolean, params?: any): void
}>()
const props = defineProps<{ selectedKeys: number[]; orders: number[] }>()

const selectedKeys = ref<number[]>(props.selectedKeys || [])

const tagData = ref<TagType[]>([]) // 标签数据

const filterMethod = (query: string, item: TagType) =>
  item?.name?.toLowerCase().includes(query.toLowerCase())

onMounted(() => {
  getTagData()
})

// 获取全部标签数据
const getTagData = () => {
  getTagList({ page: 1, page_size: 99999 }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    tagData.value = res.data.results
  })
}
// 点击取消.关闭配置弹窗
const handleCancel = () => {
  emits('handle', false)
}

const handleSave = () => {
  let dragRealIndex = 0 // 选中的元素与
  let lastRealIndex = -1
  const list = props.orders
  const values = selectedKeys.value
  for (let _i = 0; _i < list.length; _i++) {
    if (list[_i] !== -1) {
      if (list[_i] !== values[dragRealIndex]) {
        list[_i] = -1
      } else {
        dragRealIndex++
      }
      // list[dragRealIndex] = values[dragRealIndex]
      lastRealIndex = _i
    }
    // }
  }

  for (let _i = dragRealIndex; _i < values.length; _i++) {
    list[lastRealIndex + 1] = values[_i]
    lastRealIndex++
  }

  emits('handle', true, { tagging_tags: selectedKeys.value, tag_order: list })
}

// 跳转至标签页添加标签
const toAddTag = () => {
  // 此处的处理是为了让侧边栏菜单同步更新
  visualizeStore.activePath = ''
  setTimeout(() => {
    visualizeStore.activePath = '/tag_index'
  })
  router.push('/tag_index')
}
</script>

<style scoped lang="scss">
.add-tip {
  margin-top: 0.75rem;
  span {
    color: $color-primary;
    cursor: pointer;
  }
}

.el-dialog__footer {
  padding-bottom: 0;
}
</style>
<style lang="scss">
.add-oprt-tag {
  text-align: center;
  .el-transfer__buttons {
    padding: 0 1rem;
  }
  .el-transfer__button {
    display: block;
  }
  .el-transfer__button:nth-child(2) {
    margin: 0.8rem 0 0;
  }
  .el-transfer-panel__filter {
    width: auto;
    box-sizing: border-box;
  }
}
</style>
