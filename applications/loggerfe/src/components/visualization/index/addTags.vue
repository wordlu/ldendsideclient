<template>
  <div>
    <!-- <tagConfigs :tagData="tagDataProp" @selectTag="handleSelectTag"/> -->
    <el-button class="info-btn" @click="addTaskTags">添加作业标签</el-button>
    <el-button class="info-btn" @click="checkTags">查看已打标签</el-button>
    <el-dialog
      v-model="dialogVisible"
      title="添加作业标签"
      width="680"
      :before-close="handleClose"
    >
      <el-transfer
        class="tags-transfer"
        v-model="transferDataValue"
        :titles="['全部标签', '作业标签']"
        filter-placeholder="搜索标签名称"
        :data="transferData"
      />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddTags">
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog
      v-model="checkTagsDialogVisible"
      title="已打标签"
      width="800"
      :before-close="handleCheckTagsClose"
    >
      <el-table :data="taggingsTableData" height="360">
        <el-table-column prop="tagname" label="标签名称"  show-overflow-tooltip/>
        <el-table-column prop="tagcategory" label="标签分类"  width="150" show-overflow-tooltip/>
        <el-table-column label="开始时间" width="160" show-overflow-tooltip>
          <template #default="scope">{{ formatter(scope.row.starttime, "yyyy-MM-dd hh:mm:ss") }}</template>
        </el-table-column>
        <el-table-column label="结束时间" width="160" show-overflow-tooltip>
          <template #default="scope">{{ formatter(scope.row.endtime, "yyyy-MM-dd hh:mm:ss") }}</template>
        </el-table-column>
        <el-table-column
          property="name"
          label="操作"
          width="50">
          <template #default="scope">
            <el-dropdown @command="(val) => handleCommand(val, scope.row)">
              <span class="el-dropdown-link">
                <el-button @click="handleClick(scope.row)" type="text" size="small" :icon="MoreFilled"></el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="删除" :icon="MoreFilled">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="checkTagsDialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, onUnmounted  } from 'vue';
import tagConfigs from '@/components/visualization/index/tagConfigs.vue'
import gostore from '@/services/governance-store'

const transferData = ref<Option[]>()
const transferDataValue = ref([])
const checkTagsDialogVisible = ref(false)
const taggingsTableData = ref([])
const handleCheckTagsClose = (done: () => void) => {
  checkTagsDialogVisible.value = false
}

const dialogVisible = ref(false)
const addTaskTags = () => {
  dialogVisible.value = true
}

const handleClose = (done: () => void) => {
  dialogVisible.value = false
}

const tagDataProp = ref([])
const confirmAddTags = () => {
  dialogVisible.value = false
  tagDataProp.value = tagData.value.filter(it => transferDataValue.value.includes(it.id))
}

const checkTags = () => {
  getTaggings()
  checkTagsDialogVisible.value = true
}

const getTaggings = (lidarname: string) => {
  try {
    findAll('/models/taggings', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('taggings')
      taggingsTableData.value = datavalue
    }).catch((err: any) => {
      console.error(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}


//获取标签列表
const tagData = ref([])
const getTags = (lidarname: string) => {
  try {
    findAll('/models/tags', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('tags')
      tagData.value = datavalue
      transferData.value = datavalue.map((item: any) => {
        return {
          key: item.id,
          label: item.name,
          data: item
        }
      })
    }).catch((err: any) => {
      console.error(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const handleSelectTag = (tagData: any) => {
  const currentTime = new Date().toISOString()
  const params = {
    "data": {
      "type": "taggings",
      "attributes": {
        "tagid": tagData.id,
        "tagname": tagData.name,
        "tagtype": tagData.type,
        "tagcategory": tagData.category,
        "starttime": currentTime,
        "endtime": currentTime,
        "triggertime": currentTime,
      }
    }
  }
  addItem('/models/taggings', params).then((res: any) => {
    ElMessage({
      message: "打标签成功",
      type: 'success',
    })
  }).catch((err: any) => {
    console.error(err, 'err')
    ElMessage({
      message: "打标签失败",
      type: 'error',
    })
  })
}


const handleCommand = (command, row) => {
  if(command == '删除'){  
    const params = {
      data: {
        id: row.id,
        type: 'taggings'
      }
    }
    deleteItem('/models/taggings', params).then(res => {
      ElMessage({
        message: "删除成功",
        type: 'success',
      })
      getTaggings()
    }).catch(err => {
      console.error(err, 'err')
      const {response:{data:{errors}}} = err
      let msg =  "删除失败"
      if(errors && errors[0]) {
        const errmsg = errors[0]['detail']
        msg = errmsg
      }
      ElMessage({
        message: msg,
        type: 'error',
      })
    })
  }
}


const formatter = (thistime: any, fmt: string) => {
  if (!thistime) return '--'
  const isUTC = thistime.indexOf('Z') > -1 ? 'UTC' : ''
  // const isUTC = ""
  let $this = new Date(thistime)
  let o = {
    'M+': $this[`get${isUTC}Month`]() + 1,
    'd+': $this[`get${isUTC}Date`](),
    'h+': $this[`get${isUTC}Hours`](),
    'm+': $this[`get${isUTC}Minutes`](),
    's+': $this[`get${isUTC}Seconds`](),
    'q+': Math.floor(($this[`get${isUTC}Month`]() + 3) / 3),
    'S': $this[`get${isUTC}Milliseconds`]()
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, ($this[`get${isUTC}FullYear`]() + '').substr(4 - RegExp.$1.length))
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

const handleClick = (e) =>{
  // activeRow.value = e
  console.log(e)
}


onMounted(() => {
  getTags()
})

</script>

<style lang="scss">
.tags-transfer {

  .el-transfer-panel__filter {
    margin: 0 !important;
  }

  .el-button.is-disabled {
    background-color: #FFF1E5;
    border-color:#FFF1E5;
    color: #FF7900;
  }
  .el-button--primary {
    background-color: #FF7900;
    border-color:#FF7900;
  }

  .el-checkbox {
    // background-color: #FF7900;
    // border-color: #FF7900;
  }

  .el-checkbox__input.is-checked .el-checkbox__inner, .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #FF7900;
    border-color: #FF7900;
  }
  .el-checkbox__input:hover .el-checkbox__inner  {
    border-color: #FF7900;
  }


  .el-checkbox__input.is-checked+.el-checkbox__label,  .el-checkbox__label:hover, .el-checkbox__input:hover, .el-checkbox__input:hover { 
    color: #FF7900;
  }
}
</style>