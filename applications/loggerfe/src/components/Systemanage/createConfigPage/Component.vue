<template>
  <div class="config-create-container">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item >系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>采集配置</el-breadcrumb-item>
      <el-breadcrumb-item>配置设备</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="panel">
      <div class="title-panel">
        <div class="info">
          <div class="info-detail">
            <!-- <b class="title">配置设备</b> -->
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="step-panel">
      <el-steps align-center :active="active" finish-status="success">
        <el-step title="Step 1" />
      </el-steps>
    </div> -->
    <el-form :model="form" label-width="auto" style="max-width: 600px">
      
      <el-form-item label="设备类型">
        <el-select v-model="form.region" placeholder="请选择驱动" @change="handleDriverChange" clearable>
          <!-- <el-option label="Zone one" value="shanghai" /> -->
          <el-option v-for="item in driversdata" :key="item.id" :label="item.name" :value="item.name" />
        </el-select>
      </el-form-item>
      
      <div v-if="RemoteComponent">
        <!-- 动态渲染远程加载的组件 -->
        <component :is="RemoteComponent" ref="remoteComponentRef"></component>

        <!-- 展示从远程组件获取的表单数据 -->
        <el-form :model="form" label-width="auto" ref="formRef" style="max-width: 600px">
          <el-form-item label="host_name">
            <el-input v-model="form.host_name" />
          </el-form-item>
          <el-form-item label="points_topic">
            <el-input v-model="form.points_topic" />
          </el-form-item>
          <el-form-item label="timestamp_mode">
            <el-input v-model="form.timestamp_mode" />
          </el-form-item>
          <el-form-item label="ptp_utc_tai_offset">
            <el-input v-model="form.ptp_utc_tai_offset" />
          </el-form-item>
          <el-form-item label="point_type">
            <el-input v-model="form.point_type" />
          </el-form-item>
          <el-form-item label="receive_topic">
            <el-input v-model="form.receive_topic" />
          </el-form-item>
          <el-form-item label="save_topic">
            <el-input v-model="form.save_topic" />
          </el-form-item>
          <el-form-item label="bag_file_name">
            <el-input v-model="form.bag_file_name" />
          </el-form-item>
        </el-form>
      </div>
    </el-form>
    <div class="btn-panel">
      <el-button type="primary" @click="getRemoteFormData">保存</el-button>
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
import * as ElementPlus from 'element-plus'; 
import('element-plus/dist/index.css');
const route = useRoute();

const form = reactive({})

// const RemoteComponent = shallowRef(null);
const remoteComponentRef = ref(null); // 用于获取远程组件实例
const driversdata = ref<Row[]>([])

const getRemoteFormData = () => {
  if (remoteComponentRef.value && remoteComponentRef.value.getFormData) {
    const formData = remoteComponentRef.value.getFormData();
    console.log('Remote component form data:', formData);
  } else {
    console.error('Remote component is not loaded or getFormData method is not available');
  }
};

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

queryDeviceDrivers()

const currentDriver = ref(null)
const handleDriverChange = (row: any) => {
  currentDriver.value = driversdata.value.find(it => it.name === row)
  console.log(currentDriver.value, 'currentDriver.value')
  loadRemoteComponent()
}

const onSubmit = async () => {
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
    }).catch(err => {
      console.log(err)
      let msg ='操作失败'
      // const {response:{data:{errors}}} = err
      // if(errors && errors[0]) {
      //   msg = errors[0]['detail']
      // }
      // ElMessage({
      //   message: msg,
      //   type: 'error',
      // })
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
    const response = await fetch(`http://daily-report-dev.10.86.14.200.nip.io/test.vue`);
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

.remote-file {
  height: 100%;
  width: 100%;
  /* padding: 10px; */
}
.remote-form {
  display: flex;
  flex-direction: column;
}

.remote-form .remote-form-item {
  display: flex;
  align-items: center;
  margin-bottom: 22px;
}

.remote-form .remote-form-item label {
  width: 80px;
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
  font-weight: 400;
}

.remote-form-input {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 100%;
}

.remote-form-select {
  background-color: #fff;
  background-image: none;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  box-sizing: border-box;
  color: #606266;
  display: inline-block;
  font-size: inherit;
  height: 40px;
  line-height: 40px;
  outline: none;
  padding: 0 15px;
  transition: border-color .2s cubic-bezier(.645,.045,.355,1);
  width: 100%;
}
</style>