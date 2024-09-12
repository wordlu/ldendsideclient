<!--采集配置 -->
<template>
  <div class="config-container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>采集配置</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <b class="title">{{ name }}</b>
          </div>
          <el-input v-model="search" class="search-bar" placeholder="搜索传感器名称" :prefix-icon="Search" />
        </div>
      </div>
    </div>
    <el-row>
      <el-col :span="8">
        <div class="grid-content bg-black" ref="parent">
          <canvas 
            ref="sensorCanvas" 
            @click="handleCanvasClick"
          >
            Your browser does not support canvas.
          </canvas>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content ml">
          <el-tree
            ref="treeRef"
            style="max-width: 600px"
            :data="treedata"
            show-checkbox
            default-expand-all
            node-key="id"
            highlight-current
            :props="defaultProps"
          />
        </div>
      </el-col>
    </el-row>
  </div>
  
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useVisualizeStore } from '@/store/modules/visualize'
import { useCollectStore } from '@/store/modules/collect'
import TopOprt from '@/components/collect/TopOprt.vue'
import OperatingTags from '@/components/tags/OperatingTags.vue'
import PrepareInfo from '@/components/collect/PrepareInfo.vue'
import { ref, onMounted, watchEffect  } from 'vue'
import { setCollectionStatus } from '@/api/s1/collect'
// import Monitor from '@/components/monitor/Index.vue'
import { Search } from "@element-plus/icons-vue"
import { ElTree } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'


interface Tree {
  id: number
  label: string
  children?: Tree[]
}

const treeRef = ref<InstanceType<typeof ElTree>>()

const getCheckedNodes = () => {
  console.log(treeRef.value!.getCheckedNodes(false, false))
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const treedata = ref([])
const sensorData = ref([])
const name = ref('')
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      console.log(datavalue, 'datavalue')
      name.value = datavalue[0].name
      sensorData.value = datavalue[0]['device-hub']
      treedata.value = totree(datavalue[0]['device-hub'])
      createSensorCanvas(treedata.value)
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}

const totree = () => {
  const tree = [];
  // 通过类型(type)分组
  sensorData.value.forEach(sensor => {
    // 查找当前type是否已经存在于树结构中
    let parent = tree.find(node => node.label === sensor.type);
    
    // 如果没有找到，创建一个新的节点
    if (!parent) {
      parent = {
        id: tree.length + 1,  // 自动生成id
        label: sensor.type,   // 使用type作为label
        children: []
      };
      tree.push(parent);
    }

    // 添加子节点（对应传感器的坐标点）
    parent.children.push({
      id: parent.children.length + 1 + tree.length,  // 子节点id
      label: sensor.id,       // 用坐标作为label
    });
  });
  return tree;
}


// 获取canvas的ref
const sensorCanvas = ref(null);
const parent = ref(null);

const resizeCanvas = () => {
  if (parent.value && sensorCanvas.value) {
    // 设置canvas的内部像素大小
    sensorCanvas.value.width = parent.value.clientWidth;
    sensorCanvas.value.height = parent.value.clientHeight;
    // sensorCanvas.value.height = 490;
    // sensorCanvas.value.width = 490;
  }
};

onMounted(() => {
  resizeCanvas();
  // 监听 parent 大小变化
  watchEffect(() => {
    resizeCanvas();
  });
});

// 弹窗提示
const showPopup = (sensor) => {
  alert(`Sensor Type: ${sensor.type}, Position: (${sensor.x}, ${sensor.y})`);
};

const createSensorCanvas = (treeData) => {
  const canvas = sensorCanvas.value;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
  drawSensors(ctx);
}

// 画传感器
const drawSensors = (ctx) => {
  sensorData.value.forEach((sensor) => {
    let color;
    switch (sensor.type) {
      case 'camera':
        color = 'green';
        break;
      case 'lidar':
        color = 'red';
        break;
      default:
        color = 'blue';
    }

    // 绘制圆形
    ctx.beginPath();
    ctx.arc(sensor.x, sensor.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    // 绘制 ID
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white'; // 白色字体
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const textX = sensor.x + 15; // 文字x坐标，偏移圆形
    const textY = sensor.y; // 文字y坐标，与圆形对齐

    ctx.fillText(sensor.id, textX, textY);
  });
};

// 点击事件处理
const handleCanvasClick = (event) => {
  const canvas = sensorCanvas.value;
  const ctx = canvas.getContext("2d");

  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  sensorData.value.forEach((sensor) => {
    const distance = Math.sqrt(
      (x - sensor.x) ** 2 + (y - sensor.y) ** 2
    );
    // 如果点击位置在传感器范围内
    if (distance < 10) {
      showPopup(sensor);
    }
  });
};


queryCurrentDrivers()

</script>
<style scoped lang="scss">
.config-container {
  height: 100%;

  ::v-deep .el-input__icon {
    margin-left: 16px;
  }
  .el-row {
    height: calc(100% - 90px);
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-black {
    background: #000;
  }
  .ml {
    padding-left: 20px;
  }
  .grid-content {
    height: 100%;
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }

  .panel {
    margin-top: 15px;
    flex-grow: 1;
    border: 1px solid transparent;
  }
  .search-bar {
    max-width: 300px;
    padding: 10px
  }

  .title-panel {
    background-color: white;
    display: flex;
    flex-direction: row;

    .info {
      padding: 10px;
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;

      .info-detail {
        display: flex;
        flex-direction: column;
        justify-content: center;

        .title {
          padding: 4px 0;
        }

        .count {
          color: #687078;
          margin-left: 4px;
        }

        .desc {
          color: #545b64;
          font-size: 12px;
        }

        b {
          display: flex;
        }

        p {
          font-weight: 400;
          margin-top: 2px;
        }
      }

      .info-btn-group {
        flex-grow: 1;
        width: 100px;
        display: flex;
        flex-direction: row-reverse;

        .el-button--primary {
          background: #FF7900;
          border: none;
        }

        .info-btn {
          margin: 5px;
        }
      }

    }
  }

}
</style>
