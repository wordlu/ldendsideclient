
<!-- 点云操作区域:补盲雷达向主雷达标定 -->
<template>
  <div id="toolBar">
    <el-aside
      id="pannel-box"
      ref="asideRef"
      width="560px"
      class="disable-selector">
      <div class="tools pl-0">
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
              <!-- 移动/框选/去除/叠加 -->
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
            <el-step title="选择点云" @click="next(0)" ></el-step>
            <el-step title="设置源" @click="next(1)" ></el-step>
            <el-step title="设置目标" @click="next(2)" ></el-step>
            <el-step title="结果" @click="next(3)"></el-step>
          </el-steps>
          <el-descriptions border :column="1" v-show="active === 0">
            <el-descriptions-item label="源">
              {{ $route.query.devicename }}
            </el-descriptions-item>
            <el-descriptions-item label="目标">
              mainlidar
            </el-descriptions-item>
            <el-descriptions-item label="当前帧点云">
              {{ dataSet.activefame }}
            </el-descriptions-item>
            <el-descriptions-item label="完成">
              <el-button type="primary" size="small" @click="next(1)">完成</el-button>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions border :column="1" v-show="active === 1">
            <el-descriptions-item label="地面点">
              <el-button type="primary" size="small" @click="handleSetGround">设置点云</el-button>
              <el-button type="primary" size="small" @click="resetGroundPointsClick">清除点云</el-button>
            </el-descriptions-item>
            <el-descriptions-item label="目标检测">
              <el-button type="primary" size="small" @click="handleAddTarget">添加目标</el-button>
              <el-button type="primary" size="small" @click="handleUploadTargets">上传目标</el-button>
              <el-table :data="tableData" style="width: 100%;margin-top: 20px;" size="small" >
                <el-table-column type="index" label="序号" width="40" align="center" />
                <el-table-column prop="visible" label="可见性" align="center" />
                <el-table-column prop="address" label="操作" width="60" align="center" >
                  <template #default="scope">
                    <el-button link type="danger" size="small">删除</el-button>
                  </template>
                </el-table-column>   
              </el-table>
            </el-descriptions-item>
            <el-descriptions-item label="完成">
              <el-button type="primary" size="small" @click="next(2)">完成</el-button>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions border :column="1" v-show="active === 2">
            <el-descriptions-item label="地面点">
              <el-button type="primary" size="small" @click="handleSetGroundTarget">设置点云</el-button>
              <el-button type="primary" size="small" @click="resetGroundPointsClick">清除点云</el-button>
            </el-descriptions-item>
            <el-descriptions-item label="目标检测">
              <el-button type="primary" size="small">添加目标</el-button>
              <el-button type="primary" size="small">上传目标</el-button>
              <el-table :data="tableData" style="width: 100%;margin-top: 20px;" size="small" >
                <el-table-column prop="idx" label="序号" width="40" align="center" />
                <el-table-column prop="visible" label="可见性" align="center" />
                <el-table-column prop="address" label="操作" width="60" align="center" >
                  <template #default="scope">
                    <el-button link type="danger" size="small">删除</el-button>
                  </template>
                </el-table-column>  
              </el-table>
            </el-descriptions-item>
            <el-descriptions-item label="完成">
              <el-button type="primary" size="small"  @click="next(3)">完成</el-button>
            </el-descriptions-item>
          </el-descriptions>
          <el-descriptions border :column="1" v-show="active === 3">
            <el-descriptions-item label="操作">
              <el-button type="primary" size="small">计算</el-button>
              <el-button type="primary" size="small">导出结果</el-button>
            </el-descriptions-item>
            <el-descriptions-item label="matrix4">
              <!-- <el-table border :data="tableData" style="width: 100%;" size="small" >
                <el-table-column prop="date" label="序号"  align="center" />
                <el-table-column prop="name" label="可见性" align="center" /> 
              </el-table> -->
              <div class="result-table">
                <table cellspacing="0" cellpadding="10">
                  <tbody>
                    <tr v-for="(row, rowIndex) in matrix4" :key="rowIndex">
                      <td v-for="(item, colIndex) in row" :key="colIndex">
                        <div :title="item" class="result-table-cell">{{ item }}</div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="tf">
              1243
            </el-descriptions-item>
          </el-descriptions>
          <div v-show="active === 3" style="position: absolute;bottom:2px;right:20px;">
            <el-button type="primary" size="default" @click="save2Dataset">应用到数据集</el-button>
            <el-button type="primary" size="default" @click="save2Viewport">应用到视角</el-button>
          </div>
        </div>
      </div>
    </el-aside>
  </div>
</template>

<script setup lang="ts">
import { ref, defineEmits, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useRoute } from 'vue-router';
import { patchItem, findItem, findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import { ElMessage } from 'element-plus'
import { dataSetStore } from "@/pinia/dataSet";
import { Post } from "@/api/api";
import { setSceneGround, clearPlane } from "@/components/visualization/lib/initThree";


const dataSet = dataSetStore();
let caliData = {}

const route = useRoute();
interface selOptType {
  name: string
  value: string
  icon: string
}

const config_json = ref({
  "planeExtractThreshold": 0.1,
  "groundExtractThreshold": 0.06,
  "groundRemoval": true,
  "groundRemovalThreshold": 0.05,
  "targetHeight": 1.25,
  "targetUpperBoundThreshold": 1.25,
  "normalScale": 500,
  "minimalPointsNumber": 5,
  "globalAlign": true,
  "globalAlignThreshold": 0.2,
  "srcVoxelSize": 0.2,
  "distVoxelSize": 0.2
})

const active = ref(0)
const matrix4 =  ref([
    [
        0.9808926046034611,
        0.1652200888256241,
        -0.102723028005871,
        0.5889886522525671
    ],
    [
        0.17620264782356698,
        -0.9782948395208942,
        0.10904968531251212,
        4.645020335900523
    ],
    [
        -0.08247620950436851,
        -0.12506609938446703,
        -0.9887143903324914,
        -1.2630851953840043
    ],
    [
        0,
        0,
        0,
        1
    ]
])
const tableData = ref([])

const next = (num) => {
  // 只有选择点云步骤显示videobar
  active.value = num
  emit('activeTabClick', active.value)
  dataSet.clearSelectionBoxValue++ //清除选框
  resetGroundPointsClick() //清除地面点
}
onMounted(() => {
  getDatasetDetails()
  queryViewportDetails()
})

// 设置目标地面点
const ground_mode_target = ref([])
const handleSetGroundTarget = async () => {
  // @wodelu:TODO:此处应标识是第几次选点
  const selIdx = 0 
  const res = await postSetSourceGroundTarget(selIdx)
  ground_mode_target.value = res.data.ground_mode
  updateRes(res, selIdx)
}
const postSetSourceGroundTarget = async (selIdx: any) => {
  const params =  {
    "dataset": route.query.dataset, //数据集名称
    "device": 'mainlidar', // 雷达名称              
    "frame_index": dataSet.activefame, // 帧id
    "idx": dataSet.selectedIndices,
    "config_json": config_json.value
  }
  return await Post(`/calibration/registration/confirm_ground`, params)
}

const ground_mode = ref([])
// 设置源地面点
const handleSetGround = async () => {
  // @wodelu:TODO:此处应标识是第几次选点
  const selIdx = 0 
  const res = await postSetSourceGround(selIdx)
  ground_mode.value = res.data.ground_mode
  updateRes(res, selIdx)
}

const postSetSourceGround = async (selIdx: any) => {
  const params =  {
    "dataset": route.query.dataset, //数据集名称
    "device": route.query.devicename, // 雷达名称              
    "frame_index": dataSet.activefame, // 帧id
    "idx": dataSet.selectedIndices,
    "config_json": config_json.value,
    "matrix4": matrix4.value
  }
  return await Post(`/calibration/registration/confirm_ground`, params)
}

/**
 * 将后端获取的平面参数转成前端的数据格式.
 * @param {Ojbect} bePlane 后端获取的平面参数.
 */
 const planeParamsCvt = (bePlane: any) => {
  return {
    error: bePlane.error,
    inlierNum: bePlane.inlier_points_num,
    outlierNum: bePlane.outlier_points_num,
    centroid: bePlane.center,
    norm: bePlane.norm,
  }
}
// 渲染地面点
const updateRes = (res: any, selIdx: any) => {
  if (res?.status === 200 || res?.status) {
    // 创建
    caliData.groundIdx = selIdx
    caliData.groundRes = planeParamsCvt(res.data.data)
    caliData.groundState = true
    ElMessage.success(
      `inlier number:: ${res.data.inlier_points_num}, outlier number: ${res.data.outlier_points_num}`
    )
    // 更新画布
    setSceneGround({
      centroid: res.data.data.center,
      norm: res.data.data.norm,
      xLen: 10,
      yLen: 10,
    })
    dataSet.clearSelectionBoxValue++
  } else {
    ElMessage.error('设置点云失败')
    caliData.groundIdx = new Set()
    caliData.groundState = false
    caliData.groundRes = {
      error: 0,
      inlierNum: 0,
      outlierNum: 0,
      centroid: 0,
      norm: 0,
    }
    return
  }
}

// 添加数据
const handleAddTarget = () => {
  // const selIdx = pcSelector?.selIdx
  // if (selIdx?.size == 0) {
  //   ElMessage.error(`please select first`)
  //   return
  // }
  tableData.value.push({
    visible: 0,
    result: [],
  })
  dataSet.selectedTargetIndices.push(dataSet.selectedIndices)
  console.log(dataSet.selectedTargetIndices, "设置目标检测")
  // 清空选区
  // pcSelector?.clearSelection()
  dataSet.clearSelectionBoxValue++
}

// 目标检测
const uploadSourceTargetsIdx = async () => {
  const params =  {
    "dataset": route.query.dataset, //数据集名称
    "device": route.query.devicename, // 雷达名称              
    "frame_index": dataSet.activefame, // 帧id
    "ground_mode": ground_mode.value,
    "idx_list": dataSet.selectedTargetIndices,
    "config_json": config_json.value,
    "matrix4": matrix4.value
  }
  return await Post(`/calibration/registration/confirm_target`, params)

}

// 上传数据
const handleUploadTargets = async () => {
  let res = await uploadSourceTargetsIdx()
  if (res.status === 200 || res.status === 201) {
    debugger
    tableData.value.forEach((val: any, idx: number) => {
      const curData = res.data[idx]
      val.result = [planeParamsCvt(curData[0]), planeParamsCvt(curData[1])]
    })
    // 更新画布
    caliData.targetTable.forEach((val) => {
      addSceneTarget(val.result)
    })
    // 更新目标板状态
    caliData.targetState = true
  } else {
    caliData.targetState = false
    ElMessage.error(res.msg)
    return
  }
}

// 清除地面点
const resetGroundPointsClick = () => {
  caliData.groundIdx = new Set()
  caliData.groundRes = {
    error: 0,
    inlierNum: 0,
    outlierNum: 0,
    centroid: 0,
    norm: 0,
  }
  caliData.groundState = false
  clearPlane()
}

// 获取当前viewport
const viewportData = ref({})
const queryViewportDetails = () => {
  try {
    findAll('/logger/models/viewports', {'filter[using]': true}).then((res: any) => {
      viewportData.value = res.data.data[0]
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}
// 获取当前dataset
const datasetData = ref({})
const getDatasetDetails = () => {
  try {
    findItem('/logger/models/datasets', route.query.datasetid).then((res: any) => {
      gostore.reset()
      datasetData.value = gostore.sync(res.data)
    }).catch((err: any) => {
      console.error(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const save2Dataset = () => {
  const calibrations = datasetData.value.calibrations
  const devicename = route.query.devicename
  calibrations[devicename] = matrix4.value
  const params = {
    data: {
      type: 'datasets',
      id: route.query.datasetid,
      attributes: {
        calibrations: calibrations
      }
    }
        
  }
  patchItem('/logger/models/datasets', params).then((res) => {
    console.log(res)
    ElMessage({
      message: "应用到数据集成功",
      type: 'success',
    })
  }).catch(err => {
    let msg = "应用到数据集失败"
    const {response:{data:{errors}}} = err
    if(errors && errors[0]) {
      msg = errors[0]['detail']
    }
    ElMessage({
      message: msg,
      type: 'error',
    })
  })

}

const save2Viewport = () => {
  const calibrations = viewportData.value.calibrations || {}
  const devicename = route.query.devicename
  calibrations[devicename] = matrix4.value
  const params = {
    data: {
      type: 'viewports',
      id: viewportData.value.id,
      attributes: {
        calibrations: calibrations
      }
    }
  }
  patchItem('/logger/models/viewports', params).then((res) => {
    console.log(res)
    ElMessage({
      message: "应用到视角成功",
      type: 'success',
    })
  }).catch(err => {
    let msg = "应用到视角失败"
    const {response:{data:{errors}}} = err
    if(errors && errors[0]) {
      msg = errors[0]['detail']
    }
    ElMessage({
      message: msg,
      type: 'error',
    })
  })
}

const pcControlStore = ref({
  selMode: 'move',
})
// 多边形框选选项
const selOptions: selOptType[] = [
  { name: 'move', value: 'move', icon: 'bx:move' },
  { name: 'addToArea', value: 'union', icon: 'bi:union' },
  { name: 'subFromArea', value: 'intersection', icon: 'bi:subtract' },
  { name: 'intersectArea', value: 'difference', icon: 'icon-park-solid:intersection',},
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
  emit('selModeChange', value)
  // pcControlStore.value.selMode = value
}
const emit = defineEmits(['selModeChange', 'showVideoBar'])

</script>

<style lang="scss" scoped>

::v-deep .el-descriptions__cell.is-bordered-label {
  width: 100px;
}
.result-table {
  width: 450px;
  overflow: auto;

  table {
    width:450px;
    overflow: auto;

    td {
      border: 1px solid #ebeef5;
      height:36px;

      .result-table-cell {
        width: 100px;
        text-overflow: ellipsis;
        overflow: hidden;
        text-align: center;
        white-space: nowrap;
        color: #303133;
        padding:4px;
        font-size: 12px;
      }
    }
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