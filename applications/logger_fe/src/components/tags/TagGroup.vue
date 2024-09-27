<template>
  <div class="table-wrap">
    <el-button class="flex-btn" type="primary" @click="showConfig = true">
      {{ t('tag.addGroup') }}
    </el-button>
    <el-table class="data-table mt-4" :data="list" border style="width: 100%">
      <!-- 序号 -->
      <el-table-column type="index" width="60" :label="t('common.series')" />
      <!-- 分组名称 -->
      <el-table-column property="name" :label="t('tag.groupName')" />
      <!-- 英文名称 -->
      <el-table-column property="en_name" :label="t('tag.enName')" />
      <!-- 创建时间 -->
      <el-table-column property="create_time" :label="t('tag.createTime')" />
      <!-- 操作列:编辑&删除 -->
      <el-table-column property="operate" :label="t('common.operate')">
        <template #default="scope">
          <template v-if="scope.row.is_built_in">
            <el-tooltip placement="top" :content="t('tag.noEditGroup')" :show-after="1000">
              <el-button
                type="primary"
                :icon="Edit"
                size="small"
                circle
                class="mr-1 is-disabled"></el-button>
            </el-tooltip>
            <el-tooltip placement="top" :content="t('tag.noEditGroup')" :show-after="1000">
              <span>
                <el-button
                  type="primary"
                  :icon="Delete"
                  size="small"
                  circle
                  class="mr-1 is-disabled"></el-button>
              </span>
            </el-tooltip>
          </template>
          <template v-else>
            <el-tooltip placement="top" :content="t('common.editCfg')" :show-after="1000">
              <el-button
                type="primary"
                :icon="Edit"
                size="small"
                circle
                class="mr-1"
                @click="editClick(scope.row.id)"></el-button>
            </el-tooltip>
            <el-popconfirm
              :title="t('tag.deleteTip')"
              width="200px"
              @confirm="delClick(scope.row.id)">
              <template #reference>
                <span>
                  <el-button type="danger" :icon="Delete" size="small" circle></el-button>
                </span>
              </template>
            </el-popconfirm>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:currentPage="curPage"
      v-model:page-size="pageSize"
      small
      background
      layout="total, sizes, prev, pager, next, jumper"
      :page-sizes="[10, 20, 30, 40, 50, 100]"
      :total="total"
      :pager-count="4"
      class="mt-4"
      @size-change="getData"
      @current-change="getData" />
  </div>
  <!-- 标签分组配置弹窗:新增或编辑 -->
  <el-dialog
    v-model="showConfig"
    width="60%"
    :title="t('tag.addGroup')"
    destroy-on-close
    @close="targetId = -1">
    <GroupConfig :id="targetId" @handle="handleConfig" />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Delete, Edit } from '@element-plus/icons-vue'
import GroupConfig from './components/GroupConfig.vue'
import { getTagGroupList, deleteTagGroup } from '@/api/s1/tag'
import { TagGroupType } from '@/api/s1/model/tag'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

// 是否展示分组配置的弹窗
const showConfig = ref<boolean>(false)

// 响应编辑|新增弹窗内保存或取消事件
const handleConfig = (isSave: boolean) => {
  showConfig.value = false
  if (isSave) {
    getData()
  }
}

// 展示的列表数据
const list = ref<TagGroupType[]>([])
// 当前页&每页显示的条数&总条数
const curPage = ref<number>(1)
const pageSize = ref<number>(20)
const total = ref<number>(0)

const targetId = ref<number>(-1) // 当前编辑对象的id

onMounted(() => {
  getData()
})

// 获取列表数据: 参数page-当前页;page_size-每页数据
const getData = () => {
  getTagGroupList({ page: curPage.value, page_size: pageSize.value }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    total.value = res.data.count
    list.value = res.data.results
  })
}

defineExpose({ getData })

// 编辑操作点击
const editClick = (id: number) => {
  targetId.value = id
  showConfig.value = true
}
//删除操作点击
const delClick = (id: number) => {
  deleteTagGroup(id).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    getData()
    ElMessage.success(t('common.deleteTip'))
  })
}
</script>
