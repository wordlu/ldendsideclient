<template>
  <p class="top-tip">{{ t('tag.setAutoTip') }}</p>

  <TagCondition ref="conditionRef" @refresh="getList" />

  <el-table :data="list" border class="mt-4" style="width: 100%">
    <el-table-column prop="name" :label="t('tag.conditionCreated')">
      <template #default="scope">
        <span>{{ t('tag.when') }}</span>
        <span>{{ scope.row.desc }} </span>
        <span>{{ t('tag.triggerTip') }}</span>
        <span>{{ scope.row.name }}</span>
        <span>{{ t('tag.triggerTag') }}</span>
      </template>
    </el-table-column>
    <!-- 操作列:使能&编辑&删除 -->
    <el-table-column prop="operate" width="208" :label="t('common.operate')">
      <template #default="scope">
        <el-button type="primary" size="small" text @click="editRule(scope.row)">
          {{ t('common.edit') }}
        </el-button>
        <span>
          <el-button type="danger" size="small" text @click="delRule(scope.row.id)">
            {{ t('common.delete') }}
          </el-button>
        </span>
        <el-switch
          :model-value="scope.row.enable"
          inline-prompt
          size="small"
          :active-text="t('common.enabled')"
          :inactive-text="t('common.disabled')"
          width="60px"
          @change="(val: boolean) => switchEnable(val, scope.$index)" />
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import TagCondition from '@/components/tags/components/TagCondition.vue'
import { getTaggingAutoTag, delTaggingAutoTag } from '@/api/s1/tag'
import { AutoTagType } from '@/api/s1/model/tag'
import { ElMessage } from 'element-plus'
import { setTaggingAutoTag } from '@/api/s1/tag'

const { t } = useI18n()

const list = ref<AutoTagType[]>()

const conditionRef = ref()

onMounted(() => {
  getList()
})

const getList = () => {
  getTaggingAutoTag().then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }

    list.value = (res.data || []).map(el => {
      const desc = (el.rule?.expr_items || [])
        .map(expr => {
          console.log(expr)
          return (expr.expr || '') + expr.label + expr.operator + expr.int
        })
        .join('')
      console.log(desc)
      el.desc = desc
      return el
    })
    console.log(list.value)
  })
}

// 编辑条件
const editRule = (item: AutoTagType) => {
  conditionRef.value.setExprTarget(item)
}

const delRule = (id: number) => {
  console.log(id)
  delTaggingAutoTag(id).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    ElMessage.success(t('common.deleteTip'))
    getList()
  })
}

const switchEnable = (val: boolean, index: number) => {
  const row = list.value![index]
  row.enable = val
  setTaggingAutoTag(row).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
  })
}
</script>

<style scoped lang="scss">
.top-tip {
  color: $color-primary;
  margin-bottom: 0.6rem;
}
</style>
