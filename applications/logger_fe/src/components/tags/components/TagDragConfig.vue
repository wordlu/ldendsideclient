<!-- 标签编辑拖拽排序组件 -->
<template>
  <Drag class="tags is-edit" :list="props.list" :move="dragMove" @end="dragEnd">
    <template #item="{ element }">
      <div v-if="element.id === -1" class="empty"></div>
      <el-button
        v-else
        class="tag"
        :color="element.img_url ? '' : '#FEEFE8'"
        :class="{ 'tag-img': element.img_url }"
        :style="{
          backgroundImage: `url(${JSON.stringify(imgUrl(element.img_url))})`,
        }">
        <div v-if="element.img_url" class="cover">
          {{ element.name }}
        </div>
        <span v-else>{{ element.name }}</span>
        <span v-if="element.is_auto" class="auto-tag">自动</span>
        <Icon class="del" icon="ci:close-big" @click="delTag(element.id)" />
      </el-button>
    </template>
  </Drag>
</template>

<script lang="ts" setup>
import Drag from 'vuedraggable'
import { Icon } from '@iconify/vue'
import { TagCollectItem } from '@/api/s1/model/tag'
import { imgUrl } from '@/utils/common'

const props = defineProps<{
  list: TagCollectItem[]
}>()

const emits = defineEmits<{
  (e: 'update', oldIndex: number, dropIndex: number): void
  (e: 'delete', id: number): void
}>()

let dropIndex = -1 // 记录拖动过程中,目标元素的index

// 拖动排序结束事件
const dragEnd = (dragEv: any) => {
  const oldIndex: number = dragEv.oldIndex
  emits('update', oldIndex, dropIndex)
}
// 拖动时,记录目标元素index
const dragMove = (dragEv: any) => {
  dropIndex = dragEv.relatedContext.index
  return false
}

// 删除标签事件
const delTag = (id: number) => {
  emits('delete', id)
}
</script>

<style lang="scss" scoped>
.tags {
  display: grid;
  grid-template-columns: repeat(auto-fill, 120px);
  justify-content: space-between;
  row-gap: 1.5rem;
  padding: 0 0.4rem;

  .tag {
    width: 111px;
    height: 111px;
    border: none;
    // color: $color-primary;
    font-size: 1.2rem;
    font-weight: 600;
    position: relative;
    border-radius: 16px;
    white-space: pre-wrap;

    &-img {
      background-size: contain;
      background-size: cover;
      background-repeat: no-repeat;
      background-position: center center;
      &:hover {
        .cover {
          opacity: 1;
          transition: all 0.2s;
        }
      }
    }

    .cover {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      border-radius: 16px;
    }

    &.cached {
      animation: breath 1s linear 0.5s infinite alternate;
      //box-shadow: 0px 4px 20px $color-primary;;
    }

    .auto-tag {
      position: absolute;
      top: 0;
      right: 0;
      //background: $color-success;
      color: #ffffff;
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
      border-radius: 0.4rem;
    }
  }
  .empty {
    width: 111px;
    height: 111px;
    border: 1px dashed #feefe8;
    border-radius: 16px;
  }
  .el-button + .el-button {
    margin-left: 0;
  }
  .del {
    position: absolute;
    top: 0.4rem;
    right: 0.4rem;
    font-size: 20px;
    cursor: pointer;
  }
}
</style>
