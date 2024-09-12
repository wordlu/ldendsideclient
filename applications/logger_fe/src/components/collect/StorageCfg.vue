<!-- 存储配置弹窗 -->
<template>
  <!-- 已选硬盘展示 -->
  <p class="menu">
    <span class="menu-path" @click="getNavPath(0)"> {{ selDisk.name || '/' }} </span>
    <template v-if="storagePath !== '/'">
      <span v-for="(p, index) in menuPath" :key="p" class="menu-path" @click="getNavPath(p, index)">
        {{ p.name }}
      </span>
    </template>
  </p>
  <!-- 硬盘|目录展示区域 -->
  <div class="storage">
    <span v-if="!pathListVisible.length" class="el-table__empty-block">暂无数据</span>
    <div
      v-for="(item, index) in pathListVisible"
      v-else
      :key="index"
      class="storage-item"
      :class="{ selected: item.name === storagePath }"
      @click="setSelectPath(item.name)"
      @dblclick="getSelectPath(item)">
      <div class="item">
        <Icon icon="icon-park-outline:hard-disk-one" class="icon" />
        <div>
          <p>{{ item.name }}</p>
          <p v-if="item.total">
            <span class="use">{{ item.rest }}G可用</span>,总共{{ item.total }}G
          </p>
        </div>
      </div>
      <p v-if="(item.rest || 999) < 0.195" class="tip">{{ t('storage.suggestTip') }}</p>
    </div>
  </div>
  <div class="el-dialog__footer">
    <el-button @click="handleCancel">{{ t('common.cancel') }}</el-button>
    <el-button type="primary" @click="handleSave">
      {{ t('common.save') }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'
import { getDiskInfo } from '@/api/s1/collect'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

interface PathType {
  name: string
  parent: string
  rest?: number
  total?: number
  mnt_path?: string
}

const props = defineProps<{
  path: string // 存放路径
  disk: string // 硬盘名称
}>()
const emits = defineEmits<{
  (e: 'handle', isSave: boolean, params?: { data_root_dir: string; disk_name: string }): void
}>()

/* 封装顶部导航path,格式如下
 * [{parent: '/a/a1', name: '/a12'}]
 */
const menuPath = ref<any>([])

// 页面上显示的磁盘或者文件夹列表
const pathListVisible = computed((): PathType[] => {
  const path = parentPath.value
  if (path === 0) {
    return diskList
  }

  return (pathList.find(item => item.path === path) || {}).child || []
})

/* 存储全部硬盘和路径list,排平路径层级数组,方便查找
 * { path: '/', child: [ {name: 'a'}, { name: 'b' } ] },
 * { path: '/a/', child: [ {name: 'a1'}, {name: a2} ] }
 */
let pathList: any = []

const storagePath = ref<string>('') // 所选硬盘相对路径目录
const parentPath = ref<string | number>(-1) // 保存当前路径的父级目录,0表示当前未选择硬盘,需要先选择硬盘
let diskList = reactive<any>([]) // 硬盘列表
const selDisk = ref<any>({}) // 所选硬盘

// 根据目录获取子目录
const getList = async (path?: string) => {
  // 不传参数时,获取硬盘
  const res = await getDiskInfo(path)
  if (res.status === 200) {
    if (res.data.disk_list) {
      diskList = res.data.disk_list || []
    } else {
      const list = res.data.dir_list.map(item => ({ name: '/' + item.name, parent: path }))
      pathList.push({ path: path || '/', child: list })
    }
  }
  parentPath.value = path || 0
}

onMounted(async () => {
  // 不传递参数,先获取硬盘数据
  await getList()
  // 如果已选硬盘,则设置已选的硬盘数据
  if (props.disk) {
    selDisk.value = diskList.find(item => item.name === props.disk)
    // 获取该硬盘下所有的目录
    await getList(selDisk.value.mnt_path)
  }
  storagePath.value = props.path
  if (props.path) {
    // 如果存在路径的话,获取指定路径下的所有子目录
    const splitIndex = props.path.lastIndexOf('/')
    const parentPath = props.path.substring(0, splitIndex)
    storagePath.value = props.path.substring(splitIndex)
    getList(parentPath || '/')
    // 封装顶部导航交互
    let _p = ''
    parentPath.split('/').forEach(p => {
      if (p) {
        menuPath.value.push({ parent: _p || '/', name: '/' + p })
        _p += '/' + p
      }
    })
  }
})

// 点击指定硬盘
const getSelectPath = (item: PathType) => {
  // 存在硬盘根路径值,则获取硬盘下的所有目录
  if (item.mnt_path) {
    if (item.rest && item.rest < 0.195) {
      ElMessage.error(t('storage.suggestTip'))
      return
    }
    selDisk.value = item
    getList(item.mnt_path)
  } else {
    // 选择的是目录,获取该目录下的子目录
    const fullPath = (item.parent === '/' ? '' : item.parent) + item.name
    menuPath.value.push(item)
    getList(fullPath)
  }
  storagePath.value = ''
  console.log(menuPath.value)
}

const setSelectPath = (path: string) => {
  storagePath.value = path
}

const getNavPath = (path: string | number, index?: number) => {
  if (path === 0) {
    parentPath.value = 0
    menuPath.value = []
    return
  } else {
    menuPath.value = menuPath.value.splice(0, index)
    getList(path.parent)
  }
}

// 点击取消
const handleCancel = () => {
  emits('handle', false)
}
// 点击保存
const handleSave = () => {
  const fullPath = parentPath.value + storagePath.value
  emits('handle', true, { data_root_dir: fullPath, disk_name: selDisk.value.name })
}
</script>

<style lang="scss" scoped>
.menu {
  margin: 1rem 0;
  font-size: 20px;
  &-path {
    cursor: pointer;
    &:hover {
      color: $color-primary;
    }
  }
}
.storage {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-height: 15rem;
  overflow: auto;
  &-item {
    width: 50%;
    padding: 0.5rem;
    border-radius: 0.5rem;
  }
  .selected {
    background: $bg-color2;
  }
  .item {
    display: flex;
    align-items: center;
    cursor: pointer;
    .icon {
      display: inline-block;
      width: 48px;
      height: 48px;
      color: rgb(255, 180, 60);
      margin-right: 4px;
    }
    .use {
      color: $color-primary;
    }
  }
  .tip {
    color: $color-err;
  }
}
.el-dialog__footer {
  padding-bottom: 0;
  padding-top: 30px;
}
</style>
