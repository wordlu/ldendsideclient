<!--采集配置 -->
<template>
  <div class="config-container"  
    :element-loading-text="loadingtext"
    v-loading="pageLoading" >
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
        </div>
      </div>
    </div>
    <el-row class="config-content">
      <el-col :span="8" style="height: 100%;">
        <div class="grid-content bg-black" ref="parent">
          <img ref="backgroundImage" :src="`http://loggertrash/dms-static/viewports/${viewport_bg}`" alt="Background Image" :style="[baseStyle]">
          <canvas 
            style="position: absolute;"
            ref="sensorCanvas" 
            @click="handleCanvasClick"
          >
            Your browser does not support canvas.
          </canvas>
        </div>
      </el-col>
      <el-col :span="16">
        <div class="grid-content ml">
          <div class="tree-area">
            <el-tree
              ref="treeRef"
              class="tree-content"
              :data="treedata"
              default-expand-all
              node-key="id"
              :highlight-current="false"
              @node-click="handleNodeClick"
              :props="defaultProps"
              :render-content="renderContent"
            >
              <template #default="{ node, data }">
                <span :class="{ 'highlight': isLeaf(data, node) && selectedNode === node }">
                  {{ data.label }}
                </span>
              </template>
            </el-tree>
            <div class="btn-area" v-if="!setConfigValue">
              <el-button type="primary" @click="onSubmit">保存</el-button>
              <el-button @click="onDelete">删除</el-button>
            </div>
          </div>
          <div class="config-area" v-show="selectedNode">
            <div v-if="setConfigValue" class="info-btn-group">
              <el-divider />
              <el-button type="primary" class="info-btn" @click="gotoSetConfigs">配置设备</el-button>
            </div>
            <div v-if="!setConfigValue" style="margin-top: 20px">
              <el-tabs
                v-model="activeName"
                type="card"
                class="demo-tabs"
              >
                <el-tab-pane label="设备配置" name="first">
                    <el-form :model="form" label-width="auto"  style="max-width: 600px">
                      <el-form-item label="设备驱动类型:" label-width="110px">
                        <el-select v-model="form.type" style="width: 300px;" placeholder="请选择驱动" @change="handleDriverChange">
                          <el-option v-for="item in driversdataOptions" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                      </el-form-item>
                      <div v-if="RemoteComponent">
                        <!-- 动态渲染远程加载的组件 -->
                        <component :is="RemoteComponent" ref="remoteComponentRef"></component>
                      </div>
                    </el-form>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog
      v-model="dialogVisible"
      title="导入标定文件"
      width="500"
      :before-close="handleClose"
    >
      <el-upload
        ref="uploadRef"
        class="upload-demo"
        :auto-upload="false"
        :action="uploadUrl"
        :limit="1"
        method="PATCH"
        accept=".json"
        :on-success="uploadSuccess"
        :on-error="errorMessage"
        :on-exceed="handleExceed"
      >
        <template #trigger>
          <el-button type="primary">选择标定文件</el-button>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="submitUpload">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
  
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ref, onMounted, watchEffect, reactive, nextTick, markRaw, watch } from 'vue'
import { Search } from "@element-plus/icons-vue"
import { ElTree, ElMessage, genFileId } from 'element-plus'
import type Node from 'element-plus/es/components/tree/src/model/node'
import { findAll, addItem, patchItem, deleteItem } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import type { UploadInstance, UploadProps, UploadRawFile, TabsPaneContext } from 'element-plus'
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import Vue from 'vue/dist/vue.esm-bundler.js';

interface Tree {
  id: number
  label: string
  children?: Tree[]
}
const baseStyle = ref({})
const loadingtext = ref('')
const pageLoading = ref(false)
const router = useRouter();
const form = reactive({})
const setConfigValue = ref(true)
const treeRef = ref<InstanceType<typeof ElTree>>()
const selectedNode = ref(null);
// 获取canvas的ref
const sensorCanvas = ref(null);
const backgroundImage = ref(null);
const parent = ref(null);
const activeName = ref('first')
const RemoteComponent = ref<any>(null);
const remoteComponentRef = ref(null); // 用于获取远程组件实例
const search = ref('')
const dialogVisible = ref(false)
const uploadUrl = ref('')
const uploadRef = ref<UploadInstance>()

const submitUpload = () => {
  uploadRef.value!.submit()
}

const handleClose = () => {
  uploadRef.value!.clearFiles()
  dialogVisible.value = false
}

const errorMessage = (response) => {
  ElMessage.error('上传文件失败'+ (response.message ? `:${response.message}!` : '!'))
};

const uploadSuccess = (response, file, fileList) => {
  ElMessage.success('上传成功')
  uploadRef.value!.clearFiles()
  dialogVisible.value = false
};

const handleExceed: UploadProps['onExceed'] = (files) => {
  uploadRef.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  uploadRef.value!.handleStart(file)
}

watch(()=>selectedNode.value, (newVal) => {
  createSensorCanvas(treedata.value)
})

// 自定义树节点的渲染内容
const renderContent = (h, { node, data }) => {
  if (!data.children && data.devicedata) {
    return h('div',{
        style: 'display:flex;align-items:center;',
      },
      [
      h('div', {
        style: 'margin-right: 16px;min-width:90px;text-align:left;',
      },node.label), // 节点标签
      h('div', { 
        style: 'margin-left: 30px; color:#FF7900;font-size:12px;border:1px solid #ff7900;padding: 2px 4px;',
        onClick: () => handleTreeUploadClick(node, data)
      }, '导入标定文件'),  // 重新连接
    ]);
  } else {
    return h('span', {style: 'margin-right: 16px;min-width:90px;text-align:left;'}, node.label); // 非叶子节点只显示标签
  }
};

const handleTreeUploadClick = (node: Node, data: Tree) => {
  dialogVisible.value = true
}

// 文件上传函数
const handleFileUpload = (event, nodeData) => {
  const file = event.target.files[0];
  if (file) {
    console.log('正在上传文件到节点:', nodeData.label);
    console.log('文件信息:', file);

    // 可以在这里处理上传逻辑，例如通过 API 上传文件
    // 示例：将 file 发送到服务器
    const formData = new FormData();
    formData.append('file', file);

    // 假设有上传接口 /upload
    fetch('/upload', {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.ok) {
          console.log('文件上传成功');
        } else {
          console.log('文件上传失败');
        }
      })
      .catch((error) => {
        console.error('上传出错:', error);
      });
  }
};

const onDelete = () => {
  const params = {
      data: {
        id: currentDevice.value.id,
        type: 'devices'
      }
    }
  deleteItem('/models/devices', params).then(res => {
    ElMessage({
      message: "删除成功",
      type: 'success',
    })
    refresh()
  }).catch(err => {
    const {response:{data:{errors}}} = err
    let msg =  "删除失败"
    if(errors && errors[0]) {
      const errmsg = errors[0]['detail']
      msg =  errmsg
    }
    ElMessage({
      message: msg,
      type: 'error',
    })
  })
}

const refresh = () => {
  setTimeout(() => {
    router.go(0);
  }, 1000);
}


const getRemoteFormData = () => {
  if (remoteComponentRef.value && remoteComponentRef.value.getFormData) {
    const formData = remoteComponentRef.value.getFormData();
    Object.keys(form).forEach((key) => {
      if (key !== 'type') {
        delete form[key];
      }
    });
    Object.assign(form, formData);
    console.log('远程组件的表单数据:', formData);
  } else {
    console.error('远程组件加载错误，无法获取表单数据');
  }
};

const validRemoteFormData = () => {
  if (remoteComponentRef.value && remoteComponentRef.value.getFormData) {
    return remoteComponentRef.value.validFormData();
  } else {
    console.error('远程组件加载错误，无法获取表单数据');
  }
}

const onSubmit = async () => {
  const validFormDataErrMsg = validRemoteFormData()
  if (validFormDataErrMsg) {
    ElMessage.error(validFormDataErrMsg)
    return;
  }
  getRemoteFormData()
  try {
    const {type, ...deviceparams} = form
    const params = {
      data: {
        type: 'devices',
        id: currentDevice.value.id,
        attributes: {
          "name": currentDriver.value.name,
          "type": currentDriver.value.type,
          "brand": currentDriver.value.brand,
          "model": currentDriver.value.model,
          "helm-path": currentDriver.value['helm-path'],
          "device-params-path": currentDriver.value['device-params-path'],
          "device-params": deviceparams,
          "driver": currentDriver.value.id,
          "slot": currentDeviceName.value,
          "isdeleted": false,
          "viewport": currentViewport.value.id,
        }
      }
          
    }
    patchItem('/models/devices', params).then((res) => {
      console.log(res)
      ElMessage({
        message: "保存配置成功",
        type: 'success',
      })
      // refresh()
    }).catch(err => {
      let msg = "保存配置失败"
      const {response:{data:{errors}}} = err
      if(errors && errors[0]) {
        msg = errors[0]['detail']
      }
      ElMessage({
        message: msg,
        type: 'error',
      })
      // refresh()
    })
  } catch (error) {
    console.log(error)
  }
}

const handleNodeClick = (nodeData: Tree, node: any) => {
  if (isLeaf(nodeData)) {
    selectedNode.value = node; 
    getSensoronfigs(nodeData)
  }
}
const isLeaf = (nodeData, node) => {
  if (!selectedNode.value && (node && node.data && !node.data.children)) {
    selectedNode.value = node; 
    getSensoronfigs(nodeData)
  }
  return nodeData && (!nodeData.children || nodeData.children.length === 0);
};
const driversdata = ref<Row[]>([])
const driversdataOptions = ref<Row[]>([])
const queryDeviceDrivers = (page: number) => {
  try {
    findAll('/models/device-drivers', {}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      driversdata.value = gostore.findAll('device-drivers')
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.log(error)
  }
}
const currentDriver = ref(null)
const handleDriverChange = (row: any) => {
  currentDriver.value = driversdata.value.find(it => it.id === row)
  console.log(currentDriver.value, 'currentDriver.value')
  setFormDataNull()
  loadRemoteComponent()

}
const currentDevice = ref({})
const currentDeviceName = ref('')
const getSensoronfigs = (nodedata) => {
  driversdataOptions.value = driversdata.value.filter(it => it.type === nodedata.type)
  currentDeviceName.value = nodedata.label
  try {
    findAll('/models/devices', {'filter[slot]': nodedata.label}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('devices')
      if(datavalue.length > 0) {
        currentDevice.value = datavalue[0]
        uploadUrl.value = `http://loggertrash/api/logger/models/devices/${currentDevice.value.id}/upload_calibration`
        currentDriver.value = driversdata.value.find(it => it.id === currentDevice.value.driver)
        setConfigValue.value = false
        setFormData(datavalue[0])
        loadRemoteComponent()
      } else {
        setConfigValue.value = true
      }
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const setFormData = (details: any) => {
  form.type = details.driver
  Object.assign(form, details['device-params']);
  console.log(form, 'form')
}

const setFormDataNull = () => {
  for(const key in form) {
    if (key !== 'type') {
      form[key] = ''
    }
  }
}
const gotoSetConfigs = () => {
  window.history.pushState(null, '', `/loggerfe/root/createConfig?type=${selectedNode.value.data.type}&slot=${currentDeviceName.value}&viewport=${currentViewport.value.id}`)
}

const defaultProps = {
  children: 'children',
  label: 'label',
}

const treedata = ref([])
const sensorData = ref([])
const name = ref('')
const currentViewport = ref(null)
const viewport_bg = ref('')
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {'filter[using]': true, include: 'devices',}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      currentViewport.value = datavalue[0]
      viewport_bg.value = datavalue[0]['image-path']
      baseStyle.value = {
        width: '559px',
      }
      name.value = datavalue[0].name
      const devicehub = datavalue[0]['device-hub']
      sensorData.value = devicehub
      const device = datavalue[0]['devices']
      const devicehubdata = devicehub.map((item: any) => {
        return {
          ...item,
          devicedata: device.find((it: any) => it.slot === item.id),
        }
      })
      treedata.value = totree(devicehubdata)
      setTimeout(() => {
        createSensorCanvas(treedata.value)
      }, 100)
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
        id: sensor.type,  // 自动生成id
        label: sensor.type,   // 使用type作为label
        children: []
      };
      tree.push(parent);
    }

    // 添加子节点（对应传感器的坐标点）
    parent.children.push({
      id: sensor.type+'_'+sensor.id,  // 子节点id
      label: sensor.id,   
      devicedata: sensor.devicedata,
      type: sensor.type    // 用坐标作为label
    });
  });
  return tree;
}

const resizeCanvas = () => {
  if (parent.value && sensorCanvas.value) {
    // 设置canvas的内部像素大小
    sensorCanvas.value.width = parent.value.clientWidth;
    sensorCanvas.value.height = parent.value.clientHeight;
  }
};

onMounted(async () => {
  await queryDeviceDrivers()
  queryCurrentDrivers()
  resizeCanvas();
  // 监听 parent 大小变化
  watchEffect(() => {
    resizeCanvas();
  });
});

// 弹窗提示
const showPopup = (sensor) => {  
  const node = treeRef.value.getNode(sensor.type+'_'+sensor.id);
  if (node) {
    handleNodeClick(node.data, node)
  }
};
const deployDevices = ref([])
const getAllDevices = async() => {
  try {
    await findAll('/models/devices').then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('devices')
      deployDevices.value = datavalue
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}



const createSensorCanvas = async (treeData) => {
  await getAllDevices()
  const canvas = sensorCanvas.value;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布
  drawSensors(ctx);
}

// 画传感器
const drawSensors = (ctx) => {
  // 获取图片宽高
  const imageWidth = backgroundImage.value.clientWidth
  const imageHeight = backgroundImage.value.clientHeight

  // 更新 canvas 大小
  sensorCanvas.value.width = imageWidth
  sensorCanvas.value.height = imageHeight

  sensorData.value.forEach((sensor) => {
    let color = '#fff1e5'
    // @wodelu:TODO 计算适应缩放后的坐标
    const scaleX = imageWidth / imageWidth
    const scaleY = imageHeight / imageHeight
    const adjustedX = sensor.x * scaleX
    const adjustedY = sensor.y * scaleY

    
    // 绘制圆形
    ctx.beginPath();
    ctx.arc(adjustedX, adjustedY, 10, 0, 2 * Math.PI) // 半径为5
    ctx.lineWidth = 3;
    if (deployDevices.value.find(it => it.slot === sensor.id)) {
      color = '#ff7900'
    }
    ctx.fillStyle = color;
    ctx.fill();
    // ctx.strokeStyle = color;
    // ctx.stroke();
    ctx.closePath();

    // 绘制设备名称
    ctx.font = '14px bold';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    if (sensor.id === selectedNode.value?.data?.label) {
      ctx.fillStyle = '#ff7900';
    } else {
      ctx.fillStyle = 'black';
    }

    const textX = adjustedX + 15; // 文字x坐标，偏移圆形
    const textY = adjustedY + 3 // 文字y坐标，与圆形对齐

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
    if (distance < 20) {
      showPopup(sensor);
    }
  });
};

const loadRemoteComponent = async () => {
  try {
    const response = await fetch(`${window.server.mecPrefix}/dms-static/components/${currentDriver.value['component-path']}`);
    const vueFile = await response.text();
    const { descriptor } = parse(vueFile);
    const script = compileScript(descriptor, { id: 'remote-component' });
    const { code: templateCode } = compileTemplate({ source: descriptor.template!.content, id: 'remote-component' });

    const scriptFunction = new Function(`
      const exports = {};
      ${script.content.replace('export default', 'exports.default =')}
      return exports.default;
    `);

    const scriptExports = scriptFunction();

    const component = {
      template: descriptor.template!.content || '',
      setup() {
        const data = scriptExports.data ? scriptExports.data.call(this) : {};
        for (const key in data) {
          if (form[key]) {
            data[key] = form[key];
          }
        }
        const methods = scriptExports.methods || {};
        for (const key in methods) {
          methods[key] = methods[key].bind(data);
        }

        if (scriptExports.mounted) {
          onMounted(scriptExports.mounted.bind(data));
        }

        return {
          ...data,
          ...methods,
        };
      },
    };
    if (descriptor.styles.length > 0) {
      descriptor.styles.forEach(style => {
        const { code: styleCode } = compileStyle({
          source: style.content,
          id: 'remote-component',
          scoped: style.scoped
        });
        const styleTag = document.createElement('style');
        styleTag.innerHTML = styleCode;
        document.head.appendChild(styleTag);
      });
    }

    RemoteComponent.value = markRaw(component);
    RemoteComponent.value = Vue.extend(component);
  } catch (err) {
    console.error('Failed to load remote component:', err);
  }
};


</script>
<style scoped lang="scss">
.config-container {
  height: 100%;
  .el-button--primary {
    background: #FF7900;
    border: none;
  }

  .info-btn-group {
    text-align: center;

    .info-btn {
      margin-top: 88px;
    }
  }

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
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    // border: 1px solid #eee;
  }
  .ml {
    padding-left: 20px;
  }

  .config-area {

    .el-tab-pane {
      height: calc(100vh - 500px);
      overflow: auto;
    }
  }

  .tree-area {
    display: flex;
    justify-content: space-between;
    padding-right: 20px;

    .highlight {
      padding: 4px;
      background-color: #FFF1E5;
      color: #FF7900;
    }

    .tree-content {
      width: 300px; 
      // height: 260px; 
      height: auto;
      overflow: auto;
    }
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
  .config-content {
    padding: 0 10px;
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
      // justify-content: space-between;

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
