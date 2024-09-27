<template>
  <div class="table-wrap">
    <div class="flex justify-between">
      <!-- 新增标签按钮 -->
      <el-button class="flex-btn" type="primary" @click="openConfig">
        {{ t('tag.addTag') }}
      </el-button>
      <!-- 搜索区域 -->
      <div class="search">
        <span>{{ t('tag.tagName') }}</span>
        <el-input
          id="search-inp"
          v-model="searchInp"
          clearable
          class="ml-2 mr-8"
          style="width: 8rem"
          maxlength="10"
          :placeholder="t('common.inputHolder')"
          @clear="resetTag" />
        <span>{{ t('tag.group') }}</span>
        <el-select v-model="searchGroup" class="ml-2 mr-8" @visible-change="getTagGroup">
          <el-option :label="t('common.total')" value="0">{{ t('common.total') }}</el-option>
          <el-option
            v-for="item in groupList"
            :key="item.id"
            :label="item.name"
            :value="item.name" />
        </el-select>
        <el-button size="small" type="primary" @click="doSearch">{{ t('tag.search') }}</el-button>
      </div>
    </div>
    <!-- 标签列表展示 -->
    <el-table class="data-table mt-4" :data="list" border style="width: 100%">
      <!-- 序号 -->
      <el-table-column type="index" width="60" :label="t('common.series')" />
      <!-- 标签名称 -->
      <el-table-column prop="name" :label="t('tag.tagName')" />
      <!-- 标签类型 -->
      <el-table-column prop="type" :label="t('tag.tagType')">
        <template #default="scope">
          {{ scope.row.type === 1 ? t('tag.pointTag') : t('tag.lineTag') }}
        </template>
      </el-table-column>
      <!-- 所属分组 -->
      <el-table-column prop="tagging_group_name" :label="t('tag.group')" />
      <el-table-column prop="img_url" :label="t('tag.tagImg')">
        <template #default="scope">
          <img
            v-if="scope.row.img_url"
            :src="imgUrl(scope.row.img_url)"
            :alt="scope.row.name"
            class="tag-img"
            @click="previewImg(scope.row.img_url)" />
          <span v-else> -- </span>
        </template>
      </el-table-column>
      <!-- 创建时间 -->
      <el-table-column prop="create_time" :label="t('tag.createTime')" />
      <!-- 操作列:编辑&删除 -->
      <el-table-column prop="operate" :label="t('common.operate')">
        <template #default="scope">
          <!-- 系统标签:不允许删除和编辑 -->
          <template v-if="scope.row.is_built_in">
            <el-tooltip placement="top" :content="t('tag.noEditTag')" :show-after="1000">
              <el-button type="primary" :icon="Edit" size="small" circle class="mr-1 is-disabled" />
            </el-tooltip>
            <el-tooltip placement="top" :content="t('tag.noEditTag')" :show-after="1000">
              <span>
                <el-button
                  type="primary"
                  :icon="Delete"
                  size="small"
                  circle
                  class="mr-1 is-disabled" />
              </span>
            </el-tooltip>
          </template>
          <!-- 自定义标签的编辑和删除操作 -->
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

    <!-- 分页区域 -->
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

  <!-- 标签配置弹窗:新增或编辑 -->
  <el-dialog
    v-model="showConfig"
    width="60%"
    :title="t('tag.addTag')"
    destroy-on-close
    @close="targetId = -1">
    <TagConfig :id="targetId" @handle="handleConfig" />
  </el-dialog>

  <el-dialog v-model="showPreview" width="60%" destroy-on-close>
    <div class="preview">
      <img :src="previewUrl" class="preview-img" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Delete, Edit } from '@element-plus/icons-vue'
import TagConfig from './components/TagConfig.vue'
import { getTagList, deleteTag, getTagGroupList } from '@/api/s1/tag'
import { TagType, TagGroupType } from '@/api/s1/model/tag'
import { imgUrl } from '@/utils/common'

const { t } = useI18n()

const showConfig = ref<boolean>(false) // 是否展示标签配置的弹窗
const showPreview = ref<boolean>(false) // 是否展示图片预览

const previewUrl = ref<string>('') // 预览图片地址

const targetId = ref<number>(-1) // 当前标记标签的id, 为-1时为新增
const list = ref<TagType[]>([]) // 列表数据list

// 当前页&每页显示的条数&总条数
const curPage = ref<number>(1)
const pageSize = ref<number>(20)
const total = ref<number>()

const searchInp = ref<string>('') // 搜索标签名称输入值
const groupList = ref<TagGroupType[]>([]) // 下拉标签分组列表
const searchGroup = ref<string>('0') // 搜索的分组名称

onMounted(() => {
  bindEnterEvent()
  getData()
})

// 绑定回车事件,输入内容按下回车执行搜索
const bindEnterEvent = () => {
  nextTick(() => {
    const input = document.querySelector('#search-inp')
    input?.addEventListener('keyup', e => {
      e = e || window.event
      e.preventDefault()
      if ((e as any).keyCode === 13) {
        getData()
      }
    })
  })
}

// 获取列表数据
const getData = () => {
  getTagList({
    page: curPage.value,
    page_size: pageSize.value,
    name: searchInp.value,
    tagging_group_name: searchGroup.value === '0' ? '' : searchGroup.value,
  }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    total.value = res.data.count
    list.value = res.data.results
  })
}

// 暴露子组件的方法至子组件实例
defineExpose({ getData })

// 打开标签配置弹窗
const openConfig = () => {
  showConfig.value = true
}

// 响应编辑|新增弹窗内保存或取消事件
const handleConfig = (isSave: boolean) => {
  showConfig.value = false
  if (isSave) {
    getData()
  }
}

// 编辑操作点击
const editClick = (id: number) => {
  targetId.value = id
  showConfig.value = true
}

//删除操作点击
const delClick = (id: number) => {
  deleteTag(id).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    getData()
    ElMessage.success(t('common.deleteTip'))
  })
}

// 分组搜索,点击下拉框获取分组数据
const getTagGroup = (visible: boolean) => {
  if (visible) {
    getTagGroupList({ page: 1, page_size: 99999 }).then(res => {
      if (res.status === 200) {
        groupList.value = res.data.results
      }
    })
  }
}

// 标签输入框清除输入内容时,清空搜索关键字
const resetTag = () => {
  getData()
}

// 搜索标签
const doSearch = () => {
  curPage.value = 1
  getData()
}

// 预览图片功能
const previewImg = (url: string) => {
  showPreview.value = true
  previewUrl.value = imgUrl(url)
}
</script>

<style scoped lang="scss">
.search {
  font-size: 0.8rem;
}
.tag-img {
  height: 2rem;
  object-fit: contain;
  cursor: pointer;
}

.preview {
  max-height: 32rem;
  overflow-y: auto;
  &-img {
    width: 100%;
  }
}
</style>
