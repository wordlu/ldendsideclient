<template>
  <div class="config-create-container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/loggerfe/root/configs' }">采集配置</el-breadcrumb-item>
      <el-breadcrumb-item>配置设备</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
          </div>
        </div>
      </div>
    </div>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      
      <el-form-item label="设备驱动类型">
        <el-select v-model="form.type" placeholder="请选择驱动" @change="handleDriverChange">
          <el-option v-for="item in driversdata" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </el-form-item>
      
      <div v-if="RemoteComponent">
        <!-- 动态渲染远程加载的组件 -->
        <component :is="RemoteComponent" ref="remoteComponentRef"></component>
      </div>
    </el-form>
    <div class="btn-panel">
      <el-button type="primary" @click="onSubmit">保存</el-button>
      <el-button>取消</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { parse, compileScript, compileTemplate, compileStyle } from '@vue/compiler-sfc';
import { reactive, onMounted } from 'vue'
import { findAll, addItem, patchItem } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus'
import * as ElementPlus from 'element-plus'; 
import('element-plus/dist/index.css');
const route = useRoute();

const form = reactive({})

// const RemoteComponent = shallowRef(null);
const remoteComponentRef = ref(null); // 用于获取远程组件实例
const driversdata = ref<Row[]>([])

const queryDeviceDrivers = (page: number) => {
  try {
    findAll('/models/device-drivers', {'filter[type]': route.query.type}).then((res: any) => {
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

queryDeviceDrivers()

const currentDriver = ref(null)
const handleDriverChange = (row: any) => {
  currentDriver.value = driversdata.value.find(it => it.name === row)
  console.log(currentDriver.value, 'currentDriver.value')
  loadRemoteComponent()
}


const getRemoteFormData = () => {
  if (remoteComponentRef.value && remoteComponentRef.value.getFormData) {
    const formData = remoteComponentRef.value.getFormData();
    Object.assign(form, formData);
    console.log('远程组件的表单数据:', formData);
  } else {
    console.error('远程组件加载错误，无法获取表单数据');
  }
};

const onSubmit = async () => {
  getRemoteFormData()
  try {
    const deviceparams = {
      "points_topic": form.points_topic,
      "host_name": form.host_name,
      "timestamp_mode": form.timestamp_mode,
      "ptp_utc_tai_offset": form.ptp_utc_tai_offset,
      "point_type": form.point_type,
      "receive_topic": form.receive_topic,
      "save_topic": form.save_topic,
      "bag_file_name": form.bag_file_name,
    }
    const params = {
      data: {
        type: 'devices',
        attributes: {
          "name": currentDriver.value.name,
          "type": currentDriver.value.type,
          "brand": currentDriver.value.brand,
          "model": currentDriver.value.model,
          "helm-path": currentDriver.value['helm-path'],
          "device-params-path": currentDriver.value['device-params-path'],
          "device-params": deviceparams,
          "driver": currentDriver.value.id,
          "slot": route.query.slot,
          "isdeleted": false,
          "viewport": route.query.viewport,
        }
      }
          
    }
    addItem('/models/devices', params).then((res) => {
      console.log(res)
      ElMessage({
        message: "保存配置成功",
        type: 'success',
      })
      window.history.pushState(null, '', `/loggerfe/root/configs`)
    }).catch(err => {
      console.log(err)
      let msg ='保存配置失败'
      const {response:{data:{errors}}} = err
      if(errors && errors[0]) {
        msg = errors[0]['detail']
      }
      ElMessage({
        message: msg,
        type: 'error',
      })
    })
  } catch (error) {
    console.log(error)
  }
}
// 创建一个 ref 来保存加载的远程组件
const RemoteComponent = ref<any>(null);

const loadRemoteComponent = async () => {
  try {
    // Step 1: Fetch the remote .vue file content
    // const response = await fetch(`http://daily-report-dev.10.86.14.200.nip.io/test.vue`);
    const response = await fetch(`${window.server.mecPrefix}/static/components/${currentDriver.value['component-path']}`);
    const vueFile = await response.text();

    // Step 2: Parse the .vue file using @vue/compiler-sfc
    const { descriptor } = parse(vueFile);

    // Step 3: Compile <script> and <template> sections
    const script = compileScript(descriptor, { id: 'remote-component' });
    const { code: templateCode } = compileTemplate({ source: descriptor.template!.content });

    const scriptFunction = new Function(`
      const exports = {};
      ${script.content.replace('export default', 'exports.default =')}
      return exports.default;
    `);

    const scriptExports = scriptFunction();

    // Create a new Vue component using the compiled script and template
    const component = {
      template: descriptor.template!.content || '',
      // setup: () => {
      //   const scriptExports = {};
      //   eval(script.content); // Dynamically evaluate script code
      //   return scriptExports;
      // },
      setup() {
        // return  scriptExports.data ? scriptExports.data.call(this) : {};
        const data = scriptExports.data ? scriptExports.data.call(this) : {};

        // Bind methods to the component instance
        const methods = scriptExports.methods || {};
        for (const key in methods) {
          methods[key] = methods[key].bind(data);
        }

        // Handle lifecycle hooks
        if (scriptExports.mounted) {
          onMounted(scriptExports.mounted.bind(data));
        }

        return {
          ...data,
          ...methods,
        };
      },
    };

    // Compile and apply styles (if present)
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

    // Set the compiled component to render
    RemoteComponent.value = component;
  } catch (err) {
    console.error('Failed to load remote component:', err);
  }
};

// loadRemoteComponent()
</script>
<style scoped lang="scss">
.config-create-container {
  height: 100%;
  padding: 24px;

  .el-button--primary {
    background: #FF7900;
    border: none;
  }

  .btn-panel {
    position: absolute;
    bottom: 40px;
    right: 40px;
  }

  .info-btn-group {
    text-align: center;
    margin-top: 88px;

    .info-btn {
      margin: 5px;
    }
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
<style>

</style>