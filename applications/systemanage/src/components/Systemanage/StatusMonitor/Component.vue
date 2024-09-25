<template>
  <div class="container">
    <!-- <div class="form-area">
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
    </div> -->
    <iframe class="system-monitor" :src="'http://10.86.24.49:30000/d/WqBw1Ef4k/alert-overview?orgId=1&kiosk&refresh=5s&theme=light'" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts" setup>
// import { ref } from 'vue'
// import { findAll } from '@/api/jsonApi'
// import gostore from '@/services/governance-store'

// const sensorvalue = ref('')
// const options = ref([])
// // const treedata = ref([])
// const queryCurrentDrivers = () => {
//   try {
//     findAll('/models/devices', {}).then((res: any) => {
//       gostore.reset()
//       gostore.sync(res.data)
//       const datavalue = gostore.findAll('devices')
//       options.value = totree(datavalue)
//       sensorvalue.value = options.value[0] ? options.value[0].options[0].value : ''
//       console.log(options.value, 'options')
//     }).catch((err: any) => {
//       console.log(err, 'err')
//     })
//   } catch (error) {
//     console.error(error)
//   }
// }

// const totree = (data) => {
//   const tree = [];
//   // 通过类型(type)分组
//   data.forEach(sensor => {
//     // 查找当前type是否已经存在于树结构中
//     let parent = tree.find(node => node.label === sensor.type);
    
//     // 如果没有找到，创建一个新的节点
//     if (!parent) {
//       parent = {
//         id: tree.length + 1,  // 自动生成id
//         label: sensor.type,   // 使用type作为label
//         options: []
//       };
//       tree.push(parent);
//     }

//     // 添加子节点（对应传感器的坐标点）
//     parent.options.push({
//       id: parent.options.length + 1 + tree.length,  // 子节点id
//       label: sensor.slot,   
//       value: sensor.key,   
//       type: sensor.type    // 用坐标作为label
//     });
//   });
//   console.log(tree, 'tree')
//   return tree;
// }

// queryCurrentDrivers()


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
  height: calc(100vh - 140px);
}

</style>