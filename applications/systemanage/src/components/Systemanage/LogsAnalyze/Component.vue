<template>
  <div class="container">
    <el-form  label-width="auto" :inline="true">
      <div class="form-area">
        <el-form-item label="设备">
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
        </el-form-item>
        <el-form-item label="应用">
          <el-select
            v-model="containerValue"
          >
            <el-option label="设备" value="device" />
            <el-option label="可视化" value="display" />
            <el-option label="监控" value="monitor" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间">
          <el-config-provider :locale="locale">
            <el-date-picker
              :clearable="false"
              v-model="dateRange"
              type="datetimerange"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :disabledDate="disabledDateFn"
            />
          </el-config-provider>
        </el-form-item>
        
        <el-form-item label="搜索">
          <el-input v-model="logsinput" style="width: 240px" placeholder="搜索日志内容" />
        </el-form-item>
      </div>
    </el-form>
    <iframe class="system-monitor" :src="`/monitor/d/y8_hb1gHk/device_log?orgId=1&viewPanel=2&var-device=`+sensorvalue+'&theme=light&kiosk&refresh=5s&from='+getTimestamp(dateRange[0])+'&to='+getTimestamp(dateRange[1])+'&var-searchable_pattern='+logsinput+'&var-container='+containerValue" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import zhCn from "element-plus/es/locale/lang/zh-cn"

const locale = zhCn
const monitorPrefix = ref(window.server.monitorPrefix)

const logsinput = ref('')
const sensorvalue = ref('')
const containerValue = ref('device')
const options = ref([])
// 获取当前时间和前一小时的时间
const currentTime = new Date();
const oneHourBefore = new Date(currentTime.getTime() - 60 * 60 * 1000);

// 将当前时间和前一小时设置为默认的时间范围
const dateRange = ref([oneHourBefore, currentTime]);

const getTimestamp = (date: Date) => {
  return Math.floor(date.getTime())
}

const disabledDateFn = (time: any) => {
    return time.getTime() > currentTime.getTime()
}

const queryCurrentDrivers = () => {
  try {
    findAll('/models/devices', {}).then((res: any) => {
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

.form-area {
  margin-bottom: 20px;
  display: flex;
  align-items: flex-start;
  margin-left: 20px;
}

.system-monitor {
  width: 100%;
  height: calc(100vh - 40px);
}

</style>