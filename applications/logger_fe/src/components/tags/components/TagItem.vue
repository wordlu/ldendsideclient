<template>
  <!-- <div> -->
  <div v-if="tag.id === -1" class="empty"></div>
  <!-- 标签展示 -->
  <el-button
    v-else
    class="shadow-xl tag"
    :color="tag.img_url ? '' : '#FEEFE8'"
    :disabled="disabled"
    :class="{ cached: (cache || []).indexOf(tag.id) > -1 }"
    :style="{
      backgroundImage: tag.img_url ? `url(${JSON.stringify(imgUrl(tag.img_url))})` : '',
    }"
    @click="handleTag(tag)">
    <div v-if="tag.img_url" class="cover">
      {{ tag.name }}
    </div>
    <span v-else>
      {{ tag.name }}
    </span>
    <span v-if="tag.is_auto" class="auto-tag">自动</span>
  </el-button>
  <!-- </div> -->
</template>

<script lang="ts" setup>
import { TagCollectItem } from '@/api/s1/model/tag'
import { imgUrl } from '@/utils/common'

const props = defineProps<{
  tag: TagCollectItem
  disabled?: boolean
  cache?: number[]
}>()
const emits = defineEmits<{
  (event: 'handle-click', tag: TagCollectItem): void
}>()

const handleTag = (tag: TagCollectItem) => {
  emits('handle-click', tag)
}
</script>

<style scoped lang="scss">
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
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;

    &.disabled {
      cursor: not-allowed;
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
      &:hover {
        opacity: 1;
        transition: all 0.2s;
      }
    }

    &.cached {
      animation: breath 1s linear 0.5s infinite alternate;
      //box-shadow: 0 0px 6px 4px $color-primary;
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
</style>
