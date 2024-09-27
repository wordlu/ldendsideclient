<!-- 已打标签页面 -->
<template>
  <div id="marked-wrap" class="marked-wrap">
    <!-- 当前所打标签的回显 -->
    <div class="marked">
      <div class="text-center flex-1">
        <span v-if="props.latestTag.id !== undefined">
          <!-- 点标签展示 -->
          <template v-if="props.latestTag.type === 1">
            {{ props.latestTag.trigger_time }}
          </template>
          <!-- 线标签展示 -->
          <template v-else>
            {{ props.latestTag.start_time }} -
            {{ props.latestTag.end_time }}
          </template>
          <!-- 打的空标签显示为空 -->
          <span v-if="props.latestTag.tag_id === 0" class="ml-4">{{ t('tag.empty') }}</span>
          <span v-else class="ml-4">{{ props.latestTag.name }}</span>
        </span>
        <!-- 暂未打标签的空提示 -->
        <span v-else>{{ t('collect.emptyTagTip') }}</span>
      </div>

      <Icon icon="ri:menu-unfold-line" class="tog-icon" @click="togVisible" />
    </div>

    <!-- 全部已打标签数据展示 -->
    <div v-show="showTags" id="marked-tag-list" class="tags shadow-xl">
      <!-- 无数据空提示 -->
      <el-empty v-if="props.tags.length < 1" :description="t('common.emptyTip')" />
      <!-- 已打标签数据展示 -->
      <template v-else>
        <div v-for="(item, index) in props.tags" :key="index" class="tag">
          <!-- 空标签展 -->
          <span v-if="item.tag_id === 0" class="empty-tag">
            {{ item.start_time }}
            <span class="ml-4">{{ t('tag.empty') }}</span>
          </span>
          <!-- 点标签展示 -->
          <span v-else-if="item.type === 1">
            {{ item.start_time }}
            <span class="ml-4">{{ item.name }}</span>
          </span>
          <!-- 线标签展示 -->
          <span v-else>
            {{ `${item.start_time} -- ${item.end_time}` }}
            <span class="ml-4">{{ item.name }}</span>
          </span>

          <!-- 标签操作区域展示: 空标签展示补齐,正常标签展示删除 -->
          <el-button
            v-if="item.tag_id === 0"
            class="splt-btn ml-4"
            type="primary"
            text
            @click="openSupplement(item)">
            {{ t('tag.supplement') }}
          </el-button>
          <el-popconfirm
            :teleported="false"
            :title="t('tag.deleteTip')"
            :width="180"
            @confirm="delTag(item.id)">
            <template #reference>
              <Icon class="del" icon="ci:close-big" />
            </template>
          </el-popconfirm>
        </div>
      </template>
    </div>

    <!-- 补齐标签弹窗 -->
    <el-dialog v-model="showSupplement" :title="t('tag.supplement')" :before-close="clearStore">
      <h1 class="supl-title">{{ t('tag.supplementTitle') }}</h1>
      <p>{{ t('tag.tagInfo') }}: {{ emptyTag.trigger_time }}</p>
      <div class="tag-wrap">
        <div
          v-for="(item, index) in tagList"
          :key="index"
          :class="{ selected: supplementTag?.id === item.id }"
          class="suplt-tag truncate"
          @click="selectTag(item)">
          {{ item.name }}
        </div>
        <div v-for="item in emptySize" :key="item" class="suplt-empty"></div>
      </div>
      <!-- 底部取消和保存按钮 -->
      <template #footer>
        <span>
          <el-button @click="clearStore">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveSupplement">
            {{ t('common.save') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { deleteTagData, updateTagData } from '@/api/s1/tag/tagging'
import { getTagList } from '@/api/s1/tag'
import { TagData, TagType } from '@/api/s1/model/tag'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const props = defineProps<{
  latestTag: TagData
  tags: TagData[]
}>()

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const showTags = ref<boolean>(false) // 是否展开全部已打标签
const showSupplement = ref<boolean>(false) // 控制标签补齐弹窗的展示
const tagList = ref<TagType[]>([]) // 所有的点标签列表
const emptyTag = ref<TagType>({}) // 需要补充的空标签
const supplementTag = ref<TagType>({}) // 待补弹窗选中的标签

let markedWrapEl = null // 记录已打标签展示区域的父元素
onMounted(() => {
  // 点击已打标签弹出层之外的区域,收起弹层
  markedWrapEl = document.querySelector('#marked-wrap')
  document.addEventListener('click', () => {
    if (showTags.value) showTags.value = false
  })
  markedWrapEl?.addEventListener('click', e => {
    e = e || window.event
    if (e.cancelBubble) e.cancelBubble = true
    else e.stopPropagation()
  })
})

const emptySize = computed(() => {
  // 补齐弹窗内标签的占位元素,为了flex页面布局的逻辑
  return 4 - (tagList.value.length % 4 || 4)
})

// 切换是否展示已打标签
const togVisible = () => {
  showTags.value = !showTags.value
  if (showTags.value) {
    emits('refresh')
  }
}

// 删除已打标签
const delTag = (id?: number) => {
  if (id === undefined) return
  deleteTagData(id).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    emits('refresh')
  })
}

// 打开补齐标签弹窗
const openSupplement = (tag: any) => {
  showSupplement.value = true
  emptyTag.value = tag
  getTagList({ page: 1, page_size: 99999, type: 1 }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    tagList.value = res.data.results || []
  })
}

// 选中指定的标签
const selectTag = (item: TagType) => {
  if (supplementTag.value?.id === item.id) {
    supplementTag.value = {}
  } else {
    supplementTag.value = item
  }
}

// 关闭弹窗,清空缓存
const clearStore = () => {
  supplementTag.value = {}
  emptyTag.value = {}
  showSupplement.value = false
}

// 保存补齐的标签
const saveSupplement = () => {
  // 未选择标签时,直接退出
  if (!emptyTag.value.id || !supplementTag.value.id || supplementTag.value?.id < 0) {
    return ElMessage.error(t('tag.emptyTip'))
  }
  // 补齐标签调接口
  updateTagData(emptyTag.value.id, {
    tag_id: supplementTag.value.id,
    type: 1,
    name: supplementTag.value.name,
    trip_id: emptyTag.value.trip_id,
    sessionid: emptyTag.value.sessionid,
  }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    // 成功: 提示&关闭弹窗&刷新页面
    ElMessage.success(t('common.successTip'))
    clearStore()
    emits('refresh')
  })
}
</script>

<style scoped lang="scss">
@keyframes open {
  0% {
    max-height: 0;
    overflow: hidden;
  }
  100% {
    max-height: 400px;
  }
}
.marked-wrap {
  // flex: 1;
  width: 60%;
  margin: 0 auto;
  height: 2rem;
  // background: $bg-color2;
  border-radius: 16px;
  position: relative;
}
.marked {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-right: 1rem;
  .tog-icon {
    font-size: 30px;
    // color: $el-color-primary-light-3;
    cursor: pointer;
  }
  .text-center {
    font-size: 0.75rem;
    // color: $color-tip;
  }
}
.tags {
  position: absolute;
  width: 100%;
  height: 40rem;
  left: 0;
  // background: $bg-color1;
  z-index: 1;
  padding: 0.8rem 2rem 0.6rem;
  overflow: auto;
  animation: open 0.2s linear;
  border-radius: 10px;
  .tag {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    .del {
      margin-left: 1.2rem;
      cursor: pointer;
    }
  }
  .empty-tag {
    // color: $color-primary;
  }
}

.supl-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 1rem;
}
.tag-wrap {
  margin-top: 1.5rem;
  display: flex;
  max-height: 20rem;
  overflow: auto;
  flex-wrap: wrap;
  justify-content: space-between;
  .suplt-tag {
    width: 30%;
    line-height: 2rem;
    border-radius: 0.4rem;
    text-align: center;
    //border: 1px solid $color-primary;
    margin-bottom: 0.8rem;
    padding: 0 0.4rem;
    cursor: pointer;
    &.selected {
      //background: $color-primary;
    }
  }
  .suplt-empty {
    width: 30%;
  }
}

.splt-btn {
  height: 1.5rem;
}
</style>
