<template>
  <el-tabs v-model="activeTab" class="main-cont" @tab-change="tabChange">
    <!-- 标签页面 -->
    <el-tab-pane :label="t('tag.tag')" name="tags">
      <Tags ref="tags" />
    </el-tab-pane>
    <!-- 标签组页面 -->
    <el-tab-pane :label="t('tag.tagGroup')" name="tagGroup">
      <TagGroup ref="tagGroup" />
    </el-tab-pane>
  </el-tabs>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Tags from '@/components/tags/Tags.vue'
import TagGroup from '@/components/tags/TagGroup.vue'

const { t } = useI18n()

const tags = ref()
const tagGroup = ref()

const activeTab = ref<string>('tags')

// 切换标签页时,重新获取数据
const tabChange = (activeName: string) => {
  if (activeName === 'tags') {
    tags.value.getData()
  } else if (activeName === 'tagGroup') {
    tagGroup.value.getData()
  }
}
</script>

<style scoped lang="scss">
.main-cont {
  height: 100%;
}
</style>

<style lang="scss">
.main-cont {
  .el-tabs__content {
    height: calc(100% - 55px);
    .el-tab-pane {
      height: 100%;
    }
  }

  .flex-btn {
    width: 5rem;
  }
  .table-wrap {
    height: 100%;
    display: flex;
    flex-direction: column;
    .data-table {
      flex: 1;
    }
  }
}
</style>
