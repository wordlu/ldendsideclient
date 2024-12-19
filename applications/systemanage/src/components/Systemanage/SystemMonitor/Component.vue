<template>
  <div class="system-monitor-container">
    <div class="title">
      <el-radio-group v-model="title" size="small">
        <el-radio-button label="系统监控" value="系统监控" />
        <el-radio-button label="设备监控" value="设备监控" />
      </el-radio-group>
    </div>
    <iframe v-show="title === '系统监控'" class="system-monitor" :src="`/monitor/?orgId=1&kiosk&refresh=5s&theme=light`" frameborder="0"></iframe>

    <div class="form-area" v-show="title === '设备监控'">
      <el-select v-model="sensorvalue" placeholder="Select" style="width: 240px">
        <el-option-group
          v-for="group in options"
          :key="group.label"
          :label="group.label"
        >
          <el-option
            v-for="item in group.options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-option-group>
      </el-select>
    </div>
    <iframe v-show="title === '设备监控'" class="device-monitor" :src="`/monitor/d/O_ciWJgHz/device-monitor?orgId=1&var-device=`+sensorvalue+'&theme=light&kiosk&refresh=5s&from=now-1h&to=now'" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch  } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'

const title = ref('系统监控')

const sensorvalue = ref('')
const options = ref([])
// const treedata = ref([])
const queryCurrentDrivers = () => {
  try {
    findAll('/logger/models/devices', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('devices')
      options.value = totree(datavalue)
      sensorvalue.value = options.value[0] ? options.value[0].options[0].value : ''
      console.log(options.value, 'options')
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const totree = (data) => {
  const tree = [];
  // 通过类型(type)分组
  data.forEach(sensor => {
    // 查找当前type是否已经存在于树结构中
    let parent = tree.find(node => node.label === sensor.type);
    
    // 如果没有找到，创建一个新的节点
    if (!parent) {
      parent = {
        id: tree.length + 1,  // 自动生成id
        label: sensor.type,   // 使用type作为label
        options: []
      };
      tree.push(parent);
    }

    // 添加子节点（对应传感器的坐标点）
    parent.options.push({
      id: parent.options.length + 1 + tree.length,  // 子节点id
      label: sensor.slot,   
      value: sensor.key,   
      type: sensor.type    // 用坐标作为label
    });
  });
  console.log(tree, 'tree')
  return tree;
}

queryCurrentDrivers()


</script>

<style lang="scss" scoped>
// ::v-deep .el-radio-button__original-radio:checked+.el-radio-button__inner {
//   background-color: #FFF1E5;
//   border-color: #FFF1E5;
// }
.system-monitor-container {
  .title {
    margin-bottom: 20px;
  }
  .system-monitor {
    width: 100%;
    height: calc(100vh - 180px);
  }

  .device-monitor {
    width: 100%;
    height: calc(100vh - 230px);
  }

  .form-area {
    margin-bottom: 20px;
    display: flex;
    align-items: flex-start;
    margin-left: 20px;
  }

  
}
</style>

<style>
/* 针对 Chrome、Edge、Safari */
::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
  height: 8px; /* 横向滚动条高度 */
}

/* 滚动条轨道 */
::-webkit-scrollbar-track {
  background: #f0f0f0; /* 轨道颜色 */
  border-radius: 4px;
}

/* 滚动条滑块 */
::-webkit-scrollbar-thumb {
  background-color: #888; /* 滑块颜色 */
  border-radius: 4px;
  border: 2px solid #f0f0f0; /* 滑块外边框颜色 */
}

/* 鼠标悬浮时的滚动条滑块 */
::-webkit-scrollbar-thumb:hover {
  background-color: #555; /* 鼠标悬浮时滑块颜色 */
}

</style>