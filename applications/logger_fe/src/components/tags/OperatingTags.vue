<!-- 本次作业标签 -->
<template>
  <div class="top pt-4">
    <div class="top-oprt clearfix">
      <span class="mr-4">{{ t('collect.operatingTag') }}</span>
      <!-- 按钮展示:默认态展示编辑,编辑态下展示添加 -->
      <Icon
        v-if="!isEdit"
        icon="material-symbols:edit-document-outline"
        class="edit"
        @click="toEditState" />
      <template v-if="isEdit">
        <Icon icon="material-symbols:docs-add-on" class="add" @click="openTagConfig" />
        <span class="ml-4 tip">{{ t('tag.dragTip') }}</span>
      </template>
    </div>

    <!-- 已打标签回显 -->
    <MarkedTags
      v-show="!isEdit"
      :latest-tag="collectStore.latestTag"
      :tags="markedTags"
      @refresh="getMarkedTags" />

    <!-- 编辑态下的取消|保存 -->
    <div v-if="isEdit" class="oprt">
      <el-button size="small" @click="handleCancel">{{ t('common.cancel') }}</el-button>
      <el-button size="small" type="primary" @click="handleSave">
        {{ t('common.save') }}
      </el-button>
    </div>
  </div>

  <div class="tag-wrap pt-4">
    <!-- 编辑状态下可以拖动排序和删除,不可点击打标 -->
    <TagDragConfig v-show="isEdit" :list="dragTags" @update="updateDragTags" @delete="delTag" />
    <!-- 默认状态下只可以点击,不能拖动排序 -->
    <el-empty v-show="!isEdit && showEmpty" :description="t('common.emptyTip')" />
    <div v-show="!isEdit && !showEmpty" class="tags" :class="{ 'is-edit': isEdit }">
      <template v-for="(tag, index) in originTags" :key="index">
        <template v-if="tag">
          <TagItem
            :tag="tag"
            :disabled="!collectStore.isCollect"
            :cache="collectStore.tagging_cache"
            @handle-click="handleTag" />
        </template>
      </template>
    </div>
  </div>

  <!-- 当前作业标签配置弹窗 -->
  <el-dialog v-model="showConfig" width="38rem" :title="t('tag.addOprtTag')" destroy-on-close>
    <TagDataConfig :selected-keys="selectedKeys" :orders="tagOrders" @handle="handleConfig" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import TagDataConfig from './components/OprtTagConfig.vue'
import MarkedTags from './components/MarkedTags.vue'
import TagDragConfig from './components/TagDragConfig.vue'
import { getTagCollection, updateTagPool, addTags, getTagData } from '@/api/s1/tag/tagging'
import { TagCollectItem, TagData } from '@/api/s1/model/tag'
import { ElMessage } from 'element-plus'
import { useCollectStore } from '@/store/modules/collect'
import Emitter from 'tiny-emitter/instance'
import TagItem from './components/TagItem.vue'

const { t } = useI18n()
const collectStore = useCollectStore()

let collection_id = -1 // 当前用户的collection_id
let collection_name = '' // 当前用户的collection_name
let sessionid = '' // 当前用户的sessionid
const emptyNum = 70 // 默认坑位数量
let tagging_tags: TagCollectItem[] = [] // 本次作业标签
let tag_order: number[] = [] // 标签顺序

const showEmpty = ref<boolean>(false) // 无数据时展示空的提示
const showConfig = ref<boolean>(false) // 是否展示编辑弹窗
const isEdit = ref<boolean>(false) // 当前作业标签,是否在编辑态

const originTags = ref<TagCollectItem[]>([]) // 未编辑状态下的标签池
const dragTags = ref<TagCollectItem[]>([]) // 拖动状态下的标签池
const selectedKeys = ref<number[]>([]) // 当前作业标签的id集合,添加时传递给穿梭框
const tagOrders = ref<number[]>([]) // 当前作业标签的顺序集合orders

const markedTags = ref<TagData[]>([]) // 已打标签数据

onMounted(async () => {
  if (sessionStorage.getItem('collectStatusReady') === '0') return
  await getMarkedTags()
  getData()
})

Emitter.on('collectStatusReady', async () => {
  await getMarkedTags()
  getData()
})

// 获取已打标签
const getMarkedTags = async () => {
  const tagDataRes = await getTagData()
  if (tagDataRes.status !== 200) {
    ElMessage.error(tagDataRes.message)
  } else {
    // 如果不在采集状态,不显示已打标签内容
    if (!collectStore.isCollect) {
      markedTags.value = []
      return
    }
    markedTags.value = tagDataRes.data.tagging_data || []
    collectStore.latestTag = markedTags.value[0] || {}
    collectStore.tagging_cache = tagDataRes.data.tagging_cache || []
  }
}

/**
 * 获取标签数据
 */
const getData = async () => {
  getTagCollection().then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    collection_id = res.data?.id
    collection_name = res.data.name
    ;({ sessionid, tagging_tags, tag_order } = res.data)

    if (isEdit.value) {
      dragTags.value = formatOrder(tagging_tags, tag_order, true)
    }
    if (!tagging_tags.length) {
      return (showEmpty.value = true)
    }
    showEmpty.value = false
    // 需要执行两次生成两个不同的对象,避免引用相同
    originTags.value = formatOrder(tagging_tags, tag_order)
  })
}

/**
 * 根据id顺序返回指定顺序的数组
 * @param origin 匹配的原始数组
 * @param orders 顺序
 * @param isDrag 是否是拖拽 拖拽需要填充坑位
 */
const formatOrder = (
  origin: TagCollectItem[],
  orders: number[],
  isDrag?: boolean
): TagCollectItem[] => {
  const result: TagCollectItem[] = []
  const lastRealIndex = getLastRealIndex(orders)

  // 拖拽数据(isDrag: true)如果数据小于70个,用坑位补全70个
  const lastIndex = isDrag ? Math.max(lastRealIndex + 1, emptyNum) : lastRealIndex + 1

  for (let i = 0; i < lastIndex; i++) {
    if (orders[i] > -1) {
      const o_i = origin.findIndex(el => el?.id === orders[i])
      if (o_i > -1) {
        result.push(origin[o_i])
      } else {
        result.push({ id: -1 })
      }
    } else {
      result.push({ id: -1 })
    }
  }
  return result
}

// 点击编辑按钮,转换成编辑状态
const toEditState = () => {
  dragTags.value = formatOrder(tagging_tags, tag_order, true)
  isEdit.value = true
}

// 拖动结束更新拖动标签池:
const updateDragTags = (oldIndex: number, dropIndex: number) => {
  const res = dragTags.value
  // 拖动结束调换两个标签的位置
  ;[res[dropIndex], res[oldIndex]] = [res[oldIndex], res[dropIndex]]
}

// 保存当前作业标签
const handleSave = () => {
  const list = dragTags.value
  let lastIndex = getLastRealIndex(list)

  const tag_order_ids: number[] = []
  const tagging_tags_ids: number[] = []

  list.forEach(i => {
    if (i) {
      tag_order_ids.push(i.id)
      if (i.id > -1) {
        tagging_tags_ids.push(i.id)
      }
    }
  })

  updatePool({ tagging_tags: tagging_tags_ids, tag_order: tag_order_ids }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
  })

  originTags.value = list.slice(0, lastIndex + 1)
  tagging_tags = originTags.value
  tag_order = tag_order_ids
  isEdit.value = false
}

// 找到指定数据里最后一个真实标签元素所在的位置
const getLastRealIndex = (list: Array<any>) => {
  for (let i = list.length - 1; i > -1; i--) {
    if (typeof list[i] === 'number') {
      if (list[i] > -1) {
        return i
      }
    } else {
      if (list[i]?.id > -1) {
        return i
      }
    }
  }
  return -1
}

// 打开添加的穿梭框
const openTagConfig = () => {
  showConfig.value = true
  const keys: number[] = []
  const orders: number[] = []
  dragTags.value.forEach(i => {
    if (i) {
      if (i.id > -1) {
        keys.push(i.id)
      }
      orders.push(i.id)
    }
  })
  selectedKeys.value = keys
  tagOrders.value = orders
}

// 取消编辑
const handleCancel = () => {
  isEdit.value = false
}

/**
 * 点击取消|保存新增标签的弹窗
 * @param isSave 是否是保存 false-取消 true-保存
 * @param values 操作为保存时: 选中的标签的id集合[id]
 * @result 封装现有的orders: 被删掉的标签,坑位置空,添加的标签加在最后一个真实标签的后面
 */
const handleConfig = async (isSave: boolean, params?: any) => {
  showConfig.value = false
  if (isSave) {
    const res = await updatePool(params)
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    getData()
  }
}

const updatePool = (params: { tagging_tags: number[]; tag_order: number[] }) =>
  updateTagPool(collection_id, {
    id: collection_id,
    name: collection_name,
    sessionid,
    tagging_tags: params.tagging_tags,
    tag_order: params.tag_order,
  })

// 编辑状态下点击标签右上角删除按钮 删除标签保留坑位
const delTag = (id: number) => {
  const list = dragTags.value
  for (let i = 0; i < list.length; i++) {
    if (list[i]?.id === id) {
      list[i] = { id: -1 }
      return
    }
  }
}

// 点击标签进入打标状态: id,name
const handleTag = (tag: TagCollectItem) => {
  if (!collectStore.isCollect) return
  if (tag.id === undefined) return
  addTags({ id: tag.id, type: tag.type || 1 }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    if (res.data.tagging_target?.id) {
      collectStore.latestTag = res.data.tagging_target || {}
    }
    collectStore.tagging_cache = res.data.tagging_cache || []
    // getMarkedTags()
  })
}
</script>

<style scoped lang="scss">
.top {
  padding-bottom: 1rem;
  border-bottom: 2px solid #666;
  &-oprt {
    display: flex;
    align-items: center;
    float: left;
    height: 2rem;
  }
  .edit {
    font-size: 30px;
    // color: $el-color-primary-light-3;
    cursor: pointer;
    z-index: 1;
  }
  .add {
    font-size: 32px;
    // color: $el-color-primary-light-3;
    cursor: pointer;
  }
}
.tip {
  font-size: 0.75rem;
  // color: $color-tip;
}
.tag-wrap {
  // background: $bg-color;
  height: calc(100% - 4rem);
  border-radius: 4px;
  overflow: auto;
  flex: 1;
  .tags {
    display: grid;
    grid-template-columns: repeat(auto-fill, 120px);
    justify-content: space-between;
    row-gap: 1.5rem;
    padding: 0 0.4rem;

    &.is-edit > .tag {
      .del {
        position: absolute;
        top: 0.4rem;
        right: 0.4rem;
        font-size: 20px;
        cursor: pointer;
      }
    }
  }
}
.oprt {
  text-align: right;
  padding-top: 4px;
}
</style>

<style>
.el-button.tag > span {
  word-break: break-all;
  max-height: 100%;
  flex-wrap: wrap;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding: 0.5rem 0;
}
</style>
