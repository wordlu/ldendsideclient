<template>
  <div>
    <!-- xyz轴视图切换,操作为框选视图的模式时,按钮组不可用 -->
    <div class="py-2">
      <el-button circle @click="viewChange('xy')"
        >XY</el-button
      >
      <el-button circle  @click="viewChange('xz')"
        >XZ</el-button
      >
      <el-button circle  @click="viewChange('yz')"
        >YZ</el-button
      >
      <!-- 方位角极角调整,操作为框选试图的模式时,调整按钮不可用 -->
     <span class="angle ml-4">
      <!-- 轨迹球方位角 -->
      <span class="angle-span mr-2">方位角: </span>
        <el-input-number
          :model-value="pcControlStore.azimuthal"
          controls-position="right"
          size="small"
          :step="1"
          :precision="2"
          :min="-180"
          :max="180"
          @change="azimuthalChange">
        </el-input-number>
        <!-- 轨迹球极角 -->
        <span class="ml-4 angle-span mr-2">极角: </span>
        <el-input-number
          :model-value="pcControlStore.polar"
          size="small"
          controls-position="right"
          :step="1"
          :precision="2"
          :min="-180"
          :max="180"
          @change="polarChange">
        </el-input-number>
      </span>
    </div>

    <!-- 点云选择辅助工具 -->
    <div class="flex py-2">
      <!-- 多边形框选显示的按钮：只显示移动和多边形框选 -->
     <div class="flex">
        <!-- 移动/框选/去除/叠加  v-model="selMode"  @change="selModeChange"-->
        <el-radio-group v-model="pcControlStore.selMode" size="small" @change="selModeChange">
          <el-tooltip
            v-for="(item, index) in selOptions"
            :key="index"
            placement="right-end"
            :content="item.name"
            :show-after="1000">
            <el-radio-button size="default" :label="item.value">
              <Icon :icon="item.icon" />
            </el-radio-button>
          </el-tooltip>
        </el-radio-group>
        <!-- 辅助/反选/取消 -->
        <div class="select-helper flex">
          <!-- 选择辅助 -->
          <!-- <SelectHelper  @apply-select="applySelect" /> -->
          <el-tooltip placement="right-end" content="翻转选区" :show-after="1000">
            <el-button @click="invertArea">
              <Icon icon="mdi:select-inverse" />
            </el-button>
          </el-tooltip>
          <el-tooltip placement="right-end" content="取消选区" :show-after="1000">
            <el-button @click="cancelArea">
              <Icon icon="ic:baseline-deselect" />
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </div>


    <el-steps :active="active" finish-status="success" style="margin: 20px;">
      <el-step title="设置源" @click="next(0)" ></el-step>
      <el-step title="设置目标" @click="next(1)" ></el-step>
      <el-step title="结果" @click="next(2)"></el-step>
    </el-steps>
    <el-descriptions border :column="1" v-show="active === 0">
      <el-descriptions-item label="地面点">
        <el-button type="primary" size="small">设置点云</el-button>
        <el-button type="primary" size="small">清除点云</el-button>
      </el-descriptions-item>
      <el-descriptions-item label="目标检测">
        <el-button type="primary" size="small">添加目标</el-button>
        <el-button type="primary" size="small">上传目标</el-button>
        <el-table :data="tableData" style="width: 100%;margin-top: 20px;" size="small" >
          <el-table-column prop="date" label="序号" width="40" align="center" />
          <el-table-column prop="name" label="可见性" align="center" />
          <el-table-column prop="address" label="操作" width="60" align="center" >
            <template #default="scope">
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>  
        </el-table>
      </el-descriptions-item>
      <el-descriptions-item label="完成">
        <el-button type="primary" size="small" @click="next">完成</el-button>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions border :column="1" v-show="active === 1">
      <el-descriptions-item label="地面点">
        <el-button type="primary" size="small">设置点云</el-button>
        <el-button type="primary" size="small">清除点云</el-button>
      </el-descriptions-item>
      <el-descriptions-item label="目标检测">
        <el-button type="primary" size="small">添加目标</el-button>
        <el-button type="primary" size="small">上传目标</el-button>
        <el-table :data="tableData" style="width: 100%;margin-top: 20px;" size="small" >
          <el-table-column prop="date" label="序号" width="40" align="center" />
          <el-table-column prop="name" label="可见性" align="center" />
          <el-table-column prop="address" label="操作" width="60" align="center" >
            <template #default="scope">
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-table-column>  
        </el-table>
      </el-descriptions-item>
      <el-descriptions-item label="完成">
        <el-button type="primary" size="small"  @click="next">完成</el-button>
      </el-descriptions-item>
    </el-descriptions>
    <el-descriptions border :column="1" v-show="active === 2">
      <el-descriptions-item label="操作">
        <el-button type="primary" size="small">计算</el-button>
        <el-button type="primary" size="small">导出结果</el-button>
      </el-descriptions-item>
      <el-descriptions-item label="源">
        源
      </el-descriptions-item>
      <el-descriptions-item label="目标">
        目标
      </el-descriptions-item>
      <el-descriptions-item label="matrix4">
        <el-table border :data="tableData" style="width: 100%;" size="small" class="result-table">
          <el-table-column prop="date" label="序号"  align="center" />
          <el-table-column prop="name" label="可见性" align="center" />
          <el-table-column prop="date" label="序号"  align="center" />
          <el-table-column prop="name" label="可见性" align="center" />
        </el-table>
      </el-descriptions-item>
      <el-descriptions-item label="tf">
        1243
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { Icon } from '@iconify/vue'
// import SelectHelper from './SelectHelper.vue'

interface selOptType {
  name: string
  value: string
  icon: string
}

const active = ref(0)
const tableData = [
  {
    date: '1',
    name: 'Tom',
    date: '1',
    name: 'Tom',
  },
  {
    date: '2',
    name: 'Tom',
    date: '1',
    name: 'Tom',
  },
  {
    date: '2',
    name: 'Tom',
    date: '1',
    name: 'Tom',
  },
  {
    date: '2',
    name: 'Tom',
    date: '1',
    name: 'Tom',
  },
]
const next = (num) => {
  if ((num || num === 0) && typeof(num) === 'number') {
    active.value = num
  } else {
    if (active.value++ > 2) active.value = 0
  }
  
}

const pcControlStore = ref({})
// 多边形框选选项
const selOptions: selOptType[] = [
  { name: 'move', value: 'move', icon: 'bx:move' },
  { name: 'addToArea', value: 'union', icon: 'bi:union' },
  { name: 'subFromArea', value: 'intersection', icon: 'bi:subtract' },
  {
    name: 'intersectArea',
    value: 'difference',
    icon: 'icon-park-solid:intersection',
  },
]

// 应用选择辅助器参数
const applySelect = (params: { prop: string; minVal: number; maxVal: number }) => {
  // pcSelector?.selectByPosRange(params.prop, params.minVal, params.maxVal)
}

// 改变视角
const viewChange = (type: string) => {
  let azimuthal = 0,
    polar = 0
  if (type === 'xy') {
    azimuthal = -90
  } else if (type === 'xz') {
    polar = 90
  } else if (type === 'yz') {
    azimuthal = 90
    polar = 90
  }
  // setControlAngle('azimuthal', azimuthal)
  // setControlAngle('polar', polar)
  azimuthalChange(azimuthal)
  polarChange(polar)
}

// 反转选区
const invertArea = () => {
  // const params: any = pcSelector?.invertSelection()
  // setSelectPoints(params)
}

// 取消选区
const cancelArea = () => {
  // pcSelector?.clearSelection()
  // setSelectPoints()
}

// 改变方位角
const azimuthalChange = (value: number) => {
  pcControlStore.azimuthal = value
  // setControlAngle('azimuthal', value)
}

// 改变极角
const polarChange = (value: number) => {
  pcControlStore.polar = value
  // setControlAngle('polar', value)
}

// 改变选择模式
const selModeChange = (value: string) => {
  debugger
  // switch (value) {
  //   case 'move': // 移动模式
  //     cancelArea()
  //     break
  //   case 'select': // 选择模式
  //     setSelectMode('union')
  //     break
  //   default:
  //     setSelectMode(value)
  // }
  // pcControlStore.setSelMode(value)
}

</script>

<style lang="scss" scoped>

.result-table {
  ::v-deep .el-table__header-wrapper {
    display: none;
  }
}
.el-button--primary {
  background: #FF7900;
  border: 1px solid #FF7900;
}
.el-button--primary:hover{
  color: #FF7900;
  background: #FFF1E5;
  border: 1px solid #FF7900;

}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.flex{
  display: flex;
  align-items: center;
  justify-content: space-between;
}

::v-deep .el-radio-button__inner:hover {
  color: #fe7900;
}

.el-radio-button {
  --el-radio-button-checked-bg-color:#fe7900;
  --el-radio-button-checked-text-color: #fff;
  --el-radio-button-checked-border-color: #fe7900;
  --el-radio-button-disabled-checked-fill: #f2f6fc;
}

.el-radio-button__original-radio:checked + .el-radio-button__inner {
  color: #fff;
  background-color:#fe7900;
  border-color: #fe7900;
  box-shadow: -1px 0 0 0 #fe7900, #fe7900;
}
.select-helper {
  margin-left: 16px;
  .el-button + .el-button {
    margin-left: 0;
  }
}

.flex {
  align-items: center;
  justify-content: space-between;
}

.btn {
  float: right;
}

.controller-icon {
  display: inline-block;
  font-size: 1rem;
}

.angle-span {
  color: #666;
  font-size: 13px;
}
.ml-4 {
    margin-left: 1rem;
}
</style>