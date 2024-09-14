<template>
  <div class="box">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>采集</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <el-button type="primary" class="info-btn" @click="gotoSetConfigs">开始采集</el-button>
        <el-button type="primary" class="info-btn" @click="startDevice">调试设备</el-button>
        <el-button  class="info-btn" @click="gotoSetConfigs">添加作业标签</el-button>
        <el-button  class="info-btn" @click="gotoSetConfigs">查看已打标签</el-button>
      </div>
    </div>
    <!-- 控制显示的设备的选择 -->
    <!-- <div v-if="!collectStore.hideVisualize" class="box-top">
      <div class="devices"> -->
        <!-- 雷达设备点云显示控制: 可以选择多个 -->
        <!-- <el-checkbox-group v-model="visualizeStore.selLidars" size="small">
          <el-checkbox
            v-for="item in collectStore.lidars"
            :key="item.id"
            :label="item.name"
            border
            @change="
            (val) => {
              changePoint(val, item)
            }
          ">
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <div class="devices"> -->
        <!-- 摄像头图像显示控制: 单选,选中一个要取消选择其他 -->
        <!-- <el-checkbox-group v-model="visualizeStore.selCameras" size="small">
          <el-checkbox
            v-for="item in collectStore.cameras"
            :key="item.id"
            :label="item.name"
            border
            @change="
            (val) => {
              changeCamera(val,item)
            }
          ">
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div> -->

    <div
      v-loading="visualizeStore.showLoading"
      :element-loading-text="t('device.lodading')"
      element-loading-background="rgba(200, 200, 200, 0.6)"
      class="visible">
      <!-- 图像可视化: 当不展示点云且不隐藏可视化时展示图像 -->
      <ImageView v-if="!collectStore.hideVisualize && !visualizeStore.showPoint" />
      <!-- 点云可视化 -->
      <PointView v-else />
      <!-- <el-aside :style="asideStyle" width="250px">
        <h2>设置</h2>
        <el-button @click="toggleAside" type="primary">
          Collapse 
        </el-button>
      </el-aside>
      <el-aside :style="asideStyle1" width="250px">
        <h2>打标签</h2>
        <el-button @click="toggleAside1" type="primary">
          Collapse 
        </el-button>
      </el-aside> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import PointView from '@/components/visualization/PointView.vue'
import ImageView from '@/components/visualization/ImageView.vue'
import { useCollectStore } from '@/store/modules/collect'
import { useVisualizeStore } from '@/store/modules/visualize'
import { setCollectionStatus } from '@/api/s1/collect'
import { getEnableDevices } from '@/api/s1/device'
import { deletePc, addPcToScene, deleteImage, clearPcs } from '@/basic_data/visualization'
import { ElContainer, ElAside, ElCollapse, ElCollapseItem, ElButton } from 'element-plus';
import { ref, computed } from 'vue';
import { addItem } from '@/api/jsonApi'


const isAsideExpanded = ref(true);
const isAsideExpanded1 = ref(true);

const startDevice = () => {
  const params = {
    "data": {
      "type": "actions",
      "attributes": {
        "command": "startup",
        "devices": [],
        "viewport": "oIo_PGuiI2TCFtN"
      }
    }
  }
  addItem('/models/actions', params)
}

const asideStyle = computed(() => ({
  width: isAsideExpanded.value ? '250px' : '0',
  transition: 'width 0.3s',
  display: 'flex',
  justifyContent: 'flex-end', // Right align
}));

const asideStyle1 = computed(() => ({
  width: isAsideExpanded1.value ? '500px' : '0',
  transition: 'width 0.3s',
   display: 'flex',
  justifyContent: 'flex-end', // Right align
}));

const toggleAside = () => {
  isAsideExpanded.value = !isAsideExpanded.value;
};
const toggleAside1 = () => {
  isAsideExpanded1.value = !isAsideExpanded1.value;
};

const collectStore = useCollectStore()
const visualizeStore = useVisualizeStore()

const { t } = useI18n()

// 这些状态下点击可视化不需要loading
const status = ['collect', 'push_data', 'push_and_collect', 'connect']

onMounted(() => {
  clearPcs()
  // getEnableDevices().then(res => {
  //   if (res.status === 200) {
  //     // const devices = collectStore.deviceConfig || []
  //     // res.data.forEach(i => {
  //     //   const d_index = devices.findIndex(d => d.name === i.name)
  //     //   if (d_index > -1) {
  //     //     i.device_status = devices[d_index].device_status
  //     //   }
  //     // })
  //     collectStore.deviceConfig = res.data
  //   }
  // })
})

/**
 * 取消/订阅雷达点云
 * @param val true - 订阅 false - 取消订阅
 * @param name 设备名称
 */
const changePoint = (val: boolean, item: { name: string }) => {
  if (val) {
    // 添加订阅
    if (visualizeStore.selCameras.length > 0) {
      // 订阅雷达时,如果之前选中了相机,则取消订阅相机
      setCollect('stop_push', visualizeStore.selCameras)
      visualizeStore.selCameras = []
    }
    // 添加订阅,切换展示点云视图并添加点云图像
    visualizeStore.showPoint = true
    setCollect('push_data', [item.name])
    addPcToScene(item.name)
  } else {
    // 取消雷达订阅, 删除指定点云
    setCollect('stop_push', [item.name])
    deletePc(item.name)
  }
  if (status.indexOf(item.device_status) < 0) {
    setLoading(val, item.name, true)
  }
}

// 订阅/取消订阅相机图像: 相机的图像暂时不支持叠加,同时只能订阅一个相机设备
const changeCamera = (val: boolean, item: { name: string }) => {
  if (val) {
    visualizeStore.showLoading = false
    // 添加订阅
    if (visualizeStore.selLidars.length > 0) {
      // 订阅雷达时,如果之前选中了相机,则取消订阅相机
      setCollect('stop_push', visualizeStore.selLidars)
      visualizeStore.selLidars = []
    }
    // 如果存在多个相机,则先取消其他相机的订阅
    if (visualizeStore.selCameras.length > 1) {
      const stop_names = visualizeStore.selCameras.filter(i => i !== item.name)
      deleteImage(stop_names[0])
      setCollect('stop_push', stop_names)
    }
    // 设置当前相机的订阅
    visualizeStore.selCameras = [item.name]
    setCollect('push_data', [item.name])
    clearPcs()
    visualizeStore.showPoint = false
  } else {
    setCollect('stop_push', [item.name])
    visualizeStore.showPoint = true
  }
  if (status.indexOf(item.device_status) < 0) {
    setLoading(val, item.name)
  }
}

const setCollect = (status: string, names: string[]) => {
  setCollectionStatus({
    status: status,
    data: {
      names,
    },
  })
}

// 连接设备进入可视化时,设置loading
function setLoading(isAdd: boolean, name: string, isLidar?: boolean) {
  if (isAdd) {
    visualizeStore.tempDevice.push(name)
    const delay = isLidar ? 200 : 1000
    setTimeout(() => {
      if (
        visualizeStore.tempDevice.length > 0 &&
        ['stop', 'initialize'].indexOf(collectStore.collectStatus) > -1
      ) {
        visualizeStore.showLoading = true
      }
    }, delay)
  } else {
    if (isLidar) {
      const temp_index = visualizeStore.tempDevice.findIndex(i => i === name)
      if (temp_index > -1) {
        visualizeStore.tempDevice.splice(temp_index, 1)
      }
    } else {
      visualizeStore.tempDevice = []
    }
    if (visualizeStore.tempDevice.length === 0 && visualizeStore.showLoading) {
      visualizeStore.showLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  height: 100%;
  display: flex;
  flex-direction: column;

  .el-button--primary {
    background: #FF7900;
    border: none;
  }

  .title-panel {
    background-color: white;
    display: flex;
    flex-direction: row;
    margin: 20px 0;
  }

  &-top {
    height: 4.5rem;
  }
  .devices {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 0.6rem;
  }
  .visible {
    flex: 1;
  }
}
</style>
