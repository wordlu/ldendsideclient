<template>
  <div class="tags-area-content">
    <!-- {{ tagData }} -->
    <el-input v-model="search" class="search-bar" placeholder="搜索标签名称" :prefix-icon="Search" clearable />
    <div class="tags-area">
      <div v-for="tagvalue in tagData" :key="tagvalue.id" class="tag-item">
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
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect, reactive } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import { Search } from "@element-plus/icons-vue"

const tagData = ref([])
const getTags = (lidarname: string) => {
  try {
    findAll('/models/tags', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('tags')
      tagData.value = datavalue
      console.log(tagData.value, 'datavalue')
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

getTags()
</script>

<style scoped lang="scss">
.tags-area-content {
  .search-bar {
    max-width: 200px;
    margin-bottom: 30px;
  }
}

.tags-area {
  width: 200px;
  height: calc(100vh - 300px);
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

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
      // min-width: 32px;
      // height: 32px;
      border-radius: 8px;
      // margin-left: 12px;
      // display: flex;
      // justify-content: center;
      // align-items: center;
      cursor:pointer;
      margin-bottom: 4px;
      .icon-item-custom{
        // min-width: 32px;
        border-radius: 6px;
        padding-left: 3px;
        padding-right: 3px;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        // position: absolute;
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
