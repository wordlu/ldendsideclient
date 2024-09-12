<template>
  <div>
    <!-- <span> -->
    <el-input
      v-model="searchInp"
      :placeholder="t('common.inputHolder')"
      class="s-inp"
      clearable
      @clear="handleSearch" />
    <!-- </span> -->
    <el-button type="primary" text size="small" @click="handleSearch">
      {{ t('tag.search') }}
    </el-button>
  </div>
  <div class="flex tag-wrap">
    <div
      v-for="(item, index) in tagList"
      :key="index"
      class="tag truncate"
      :class="{ selected: selectedTag?.id === item.id }"
      @click="selectTag(item)">
      {{ item.name }}
    </div>
    <div v-for="item in emptySize" :key="item" class="empty"></div>
  </div>
  <div class="text-right mt-4">
    <el-button @click="emits('handle', false)">{{ t('common.cancel') }}</el-button>
    <el-button type="primary" @click="handleSave">
      {{ t('common.save') }}
    </el-button>
  </div>
</template>

<script lang="ts" setup>
import { getTagCollection } from '@/api/s1/tag/tagging'
import { TagType } from '@/api/s1/model/tag'
import { ElMessage } from 'element-plus'
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  selectedId?: number
}>()

const emits = defineEmits<{
  (event: 'handle', isSave: boolean, tag?: TagType): void
}>()

let originList: TagType[] = []

const searchInp = ref<string>('')

const tagList = ref<TagType[]>([])

const selectedTag = ref<TagType>()

onMounted(async () => {
  const res = await getTagCollection()
  if (res.status !== 200) {
    return ElMessage.error(res.message)
  }
  tagList.value = res.data.tagging_tags || []
  originList = res.data.tagging_tags || []
  if (props.selectedId !== 0) {
    selectedTag.value = tagList.value.find(i => i.id === props.selectedId)
  }
})

const emptySize = computed(() => {
  // 补齐弹窗内标签的占位元素,为了flex页面布局的逻辑
  return 3 - (tagList.value.length % 3 || 3)
})

// 选中指定的标签
const selectTag = (item: TagType) => {
  if (selectedTag.value?.id === item.id) {
    selectedTag.value = {}
  } else {
    selectedTag.value = item
  }
}

const handleSave = () => {
  emits('handle', true, selectedTag.value)
}

const handleSearch = () => {
  tagList.value = originList.filter(i => i.name?.includes(searchInp.value)) || []
}
</script>

<style scoped lang="scss">
.s-inp {
  width: 50%;
  margin-right: 0.5rem;
}

.tag-wrap {
  margin-top: 1.5rem;
  display: flex;
  max-height: 20rem;
  overflow: auto;
  flex-wrap: wrap;
  justify-content: space-between;
  .tag {
    width: 30%;
    line-height: 2rem;
    border-radius: 0.4rem;
    text-align: center;
    border: 1px solid $color-primary;
    margin-bottom: 0.8rem;
    padding: 0 0.4rem;
    cursor: pointer;
    &.selected {
      background: $color-primary;
    }
  }
  .empty {
    width: 30%;
  }
}
</style>
