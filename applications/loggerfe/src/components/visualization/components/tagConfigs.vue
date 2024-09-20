<template>
  <div class="tags-area-content">
    <!-- <el-input v-model="search" class="search-bar" placeholder="搜索标签名称" :prefix-icon="Search" clearable /> -->
     <div class="title">作业标签</div>
    <div class="tags-area" v-if="props.tagData.length > 0">
      <div class="tags-list">
        <div v-for="tagvalue in tagData" :key="tagvalue.id" class="tag-item" @click="handleClick(tagvalue)">
          <div class="table-icon">
            <span class="icon-item" >
              <img class="icon-img"  v-if="tagvalue.sub != 'custom'" :src="'/'+tagvalue.pattern" alt="" >
              <span class="icon-item-custom" v-if="tagvalue.sub == 'custom'" :style="{'background':tagvalue.color}">
                {{ tagvalue.name }}
              </span>
            </span>
            <div class="tag-name" :title="tagvalue.name">{{ tagvalue.name }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="empty" v-else>
      <el-empty description="请先选择作业标签" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits   } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import { Search } from "@element-plus/icons-vue"

// const tagData = ref([])
const emit = defineEmits(['selectTag']);

const handleClick = (tagvalue) => {
  emit('selectTag', tagvalue);
};

const props = defineProps({
  tagData: Array
});

</script>

<style scoped lang="scss">
.tags-area-content {
  min-width: 300px;

  .title {
    font-size: 18px;
    font-weight: 600;
    color: #5A5E72;
    margin-bottom: 10px;
    text-align: left;
  }

  .search-bar {
    width: 300px;
    margin-bottom: 30px;
  }

}

.tags-area {
  height: calc(100vh - 180px);
  overflow: auto;
}

.tags-list {
  width: 300px;
  height: auto;
  overflow: hidden;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 4px;
  // padding: 0 6px;

  .tag-item {
    margin-bottom: 10px;
  }

  .table-icon {
    display: flex;
    flex-direction: column;
    align-items: center;

    .tag-name {
      color: #5A5E72;
      width: 80px;
      text-align: center;
      font-size: 12px;
      font-weight: 500;
      margin-top: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .icon-item {
      border-radius: 8px;
      cursor:pointer;
      margin-bottom: 4px;
      .icon-item-custom{
        border-radius:  10px;
        padding-left: 3px;
        padding-right: 3px;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 500;
        color: #ffffff;
      }
    }

    .icon-img {
      width: 80px;
      height: 80px;
    }
  }
}
</style>
