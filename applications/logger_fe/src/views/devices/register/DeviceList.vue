<template>
  <div class="table-wrap">
    <!-- 设备注册页面: 显示所有设备类型的列表 -->
    <p class="tip">{{ t('register.tip') }}</p>
    <el-table :data="list" border class="mt-4 data-table" style="width: 100%">
      <!-- 序号 -->
      <el-table-column type="index" width="60" :label="t('common.series')" />
      <!-- 设备类型 -->
      <el-table-column prop="name" :label="t('common.type')" />
      <!-- 注册配置模板状态 -->
      <el-table-column prop="register_status" :label="t('register.status')">
        <template #default="scope">
          <span v-if="scope.row.register_status === 'registered'" class="green">
            {{ t('register.configed') }}
          </span>
          <span v-else class="error">{{ t('register.unConfiged') }}</span>
        </template>
      </el-table-column>
      <!-- 申请注册时间 -->
      <el-table-column prop="update_time" :label="t('register.time')" />
      <!-- 授时方式 -->
      <el-table-column prop="timing_mode" :label="t('register.timingMode')">
        <template #default="scope">
          <span v-if="scope.row.register_status === 'registered'">
            {{ scope.row.timing_mode === '-' ? t('register.noTiming') : scope.row.timing_mode }}
          </span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <!-- 操作列:使能&编辑&删除 -->
      <el-table-column prop="operate" :label="t('common.operate')" width="212">
        <template #default="scope">
          <!-- 配置模板 || 编辑模板按钮  -->
          <!-- 系统预设设备类型,禁止编辑 -->
          <el-tooltip
            v-if="scope.row.is_builtint"
            :content="t('register.buildInTip')"
            placement="top-start">
            <!-- span标签是必要的,否则diasbled状态的按钮不能触发tooltip提示 -->
            <span>
              <el-button type="primary" size="small" text disabled>
                {{ t('register.editTemplate') }}
              </el-button>
            </span>
          </el-tooltip>
          <el-tooltip
            v-else-if="scope.row.has_device"
            :content="t('register.hasDeviceTip')"
            placement="top-start">
            <!-- span标签是必要的,否则diasbled状态的按钮不能触发tooltip提示 -->
            <span>
              <el-button type="primary" size="small" text disabled>
                {{ t('register.editTemplate') }}
              </el-button>
            </span>
          </el-tooltip>
          <el-button
            v-else
            :disabled="collectStore.disableEdit"
            type="primary"
            size="small"
            text
            @click="editClick(scope.row.id)">
            {{
              scope.row.register_status === 'registered'
                ? t('register.editTemplate')
                : t('register.addTemplate')
            }}
          </el-button>
          <!-- 查看模板按钮: 未配置模板时不可点击 -->
          <span>
            <el-button
              type="primary"
              size="small"
              text
              :disabled="scope.row.register_status !== 'registered'"
              @click="preview(scope.row)">
              {{ t('register.checkTemplate') }}
            </el-button>
          </span>

          <!-- 删除模板按钮 -->
          <!-- 系统预设设备类型,禁止删除 -->
          <el-tooltip
            v-if="scope.row.is_builtint"
            effect="dark"
            :content="t('register.buildInTip')"
            placement="top-start">
            <!-- span标签是必要的,否则diasbled状态的按钮不能触发tooltip提示 -->
            <span>
              <el-button disabled type="danger" size="small" text>
                {{ t('common.delete') }}
              </el-button>
            </span>
          </el-tooltip>
          <!-- 该设备类型下有设备,禁止删除: 需要先删除设备,才能删除设备类型 -->
          <el-tooltip
            v-else-if="scope.row.has_device"
            effect="dark"
            :content="t('register.hasDeviceTip')"
            placement="top-start">
            <span>
              <el-button disabled type="danger" size="small" text>
                {{ t('common.delete') }}
              </el-button>
            </span>
          </el-tooltip>
          <el-popconfirm
            v-else
            :title="t('device.deleteTypeTip')"
            width="200px"
            @confirm="delClick(scope.row.id)">
            <template #reference>
              <span>
                <el-button :disabled="collectStore.disableEdit" type="danger" size="small" text>
                  {{ t('common.delete') }}
                </el-button>
              </span>
            </template>
          </el-popconfirm>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getDeviceType, deleteDeviceType } from '@/api/s1/device'
import { DeviceType } from '@/api/s1/model/device'
import { ElMessage } from 'element-plus'
import { useCollectStore } from '@/store/modules/collect'

const router = useRouter()
const { t } = useI18n()
const collectStore = useCollectStore()

// 当前页&每页显示的条数&总条数
const curPage = ref<number>(1)
const pageSize = ref<number>(20)
const total = ref<number>()

const list = ref<DeviceType[]>()

onMounted(() => {
  getData()
})

// 点击编辑模板
const editClick = (id: number) => {
  router.push({ path: '/device_template', query: { id } })
}

// 点击查看模板,跳转模板预览页面
const preview = row => {
  router.push({ path: '/device_config', query: { is_check: 1, t_id: row.id } })
  // const resolver = router.resolve({ path: '/template_preview', query: { template } })
  // window.open(resolver.href, '_blank')
}

// 点击删除模板
const delClick = (id: number) => {
  console.log(id)
  deleteDeviceType(id).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    getData()
    ElMessage({
      message: t('common.deleteTip'),
      type: 'success',
    })
  })
}

// 获取全部设备类型列表数据
function getData() {
  getDeviceType({ page: curPage.value, page_size: pageSize.value }).then(res => {
    if (res.status !== 200) {
      return ElMessage.error(res.message)
    }
    list.value = res.data.results
    total.value = res.data.count
  })
}
</script>

<style lang="scss" scoped>
.tip {
  // color: $color-primary;
}
.green {
  // color: $color-success;
}
.error {
  // color: $color-err;
}
.table-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  .data-table {
    flex: 1;
  }
}
</style>
