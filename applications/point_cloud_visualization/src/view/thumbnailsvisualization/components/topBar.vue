<template>
  <div class="scene-top-container">
    <div id="scenelibInfo-left">
      <div class="dataInfo">
        <div class="dataName">
          <span>{{ sceneInfo.datasetname }}</span>
          <tagsVue :reqip="reqip" :icons="filterTagsArray(sceneInfo.datasettags)" style="margin-bottom:10px" v-if="isRender"/>
        </div>
      </div>
      <div class="btns">
        <el-button @click="visible = !visible">导出
          <el-icon style="width: 24px; height: 24px;"><Download /></el-icon>
        </el-button>
        <el-button @click="addSceneClick">新增场景
          <el-icon style="width: 24px; height: 24px;"><Plus /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="scene-area">
      <div class="scene-group" v-for="group in sceneArray" :key="group.type">
        <div class="scene-type">{{ group.type }}</div>
        <!-- <div class="scene-name-array">  -->
          <div class="scene-array" >
            <div class="scene-name" :class="{'is-active': currentScene && namedata.scene_name === currentScene.scene_name}" v-for="(namedata, index) in group.names" :key="namedata.scene_name+index">
              <div class="scene-framelines" v-if="namedata.frame_line && namedata.frame_line.length > 1">
                <div class="current-scene-name" @click="handleClick(namedata)">
                  <span v-if="namedata.currentFrame">{{ namedata.scene_name }}({{ namedata.currentFrame.start }}-{{ namedata.currentFrame.end }})</span>
                  <span v-else>{{ namedata.scene_name }}({{ namedata.frame_line[0].start }}-{{ namedata.frame_line[0].end }})</span>
                </div>
                <el-dropdown>
                  <el-icon class="el-icon--right arrowdown " style="font-size: 19px;">
                    <arrow-down />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="handleClick(namedata, frame)"  v-for="(frame,index) in namedata.frame_line" :key="frame.end+index">
                        {{ namedata.scene_name }}({{ frame.start }} - {{ frame.end }})
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
              <div v-else @click="handleClick(namedata)">{{ namedata.scene_name }}</div>
            </div>
          </div>
        <!-- </div> -->
      </div>
    </div>
    <!-- 添加场景 -->
    <el-dialog 
      v-model="addSceneDialogVisible" 
      title="添加场景" 
      :before-close="handleClose" 
      width="50%" 
      height="100%" modal-class="add-scene-modal">
      <template #footer>
        <div class="add-scene-container">
          <el-form
            ref="ruleFormRef"
            style="max-width: 600px"
            :model="ruleForm"
            :rules="rules"
            label-width="auto"
            class="demo-ruleForm"
            :size="formSize"
            status-icon
          >
            <el-form-item label="数据集" prop="datasetname">
              <el-input v-model="ruleForm.datasetname" disabled/>
            </el-form-item>
            <el-form-item label="时间" required>
              <el-date-picker
                v-model="value1"
                type="datetimerange"
                :disabled-date="disableDatetime"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <el-form-item label="标签" prop="tag_id">
              <el-select
                @change="selectTag"
                v-model="ruleForm.tag_id"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请选择标签"
                :remote-method="remoteMethod"
                :loading="loading"
                style="width: 240px"
              >
                <el-option
                  v-for="item in options"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="标签类型" prop="tag_type">
              <el-select v-model="ruleForm.tag_type" placeholder="标签类型" disabled>
              </el-select>
            </el-form-item>
            
          </el-form>
        </div>
        <span class="dialog-footer">
            <el-button @click="addSceneDialogVisible = false">取消</el-button>
            <el-button class="styleOrange" @click="submitAddTag(ruleFormRef)"  type="primary">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import tagsVue from './tags/tagsNew.vue'
import { Download, Plus, ArrowDown  } from '@element-plus/icons-vue'
import { func_scenes, func_create_scenes } from '../../../api/api'
import { ref, defineEmits, reactive } from 'vue'
import { findAll } from '../../../api/jsonApi'
import { ElMessage } from 'element-plus'

const ruleForm = reactive({
  "datasetname": "",
  "dataset": "",
  "start_time_tamp": null,
  "end_time_tamp": null,
  "tag_id": "",
  "tag_type": ""       
})
const options = ref([])
const value1 = ref([
  null, null
])

const disableDatetime = (time) => {
  if (value1.value[1] && value1.value[0]) {
    return time.getTime() < value1.value[1].getTime() || time.getTime() > value1.value[0].getTime();
  }
  return false;
};
const loading = ref(false)
const remoteMethod = (query) => {
  if (query) {
    loading.value = true
    getTags(query)
  } else {
    options.value = []
  }
}

const selectTag = (val) => {
  const type = options.value.find(it => it.id === val).category
  ruleForm.tag_type = type
  if (!["道路","行为交互","环境","车辆"].includes(type)) {
    ruleForm.tag_type = "其他"
  }
}

const rules = reactive({
  datasetname: [
    { required: true, message: '当前数据集', trigger: 'blur' },
  ],
  start_time_tamp: [
    { required: true, message: '开始时间', trigger: 'change' },
  ],
  end_time_tamp: [
    { required: true, message: '结束时间', trigger: 'change' },
  ],
  tag_id:[
    { required: true, message: '请选择标签', trigger: 'change' },
  ],
})

const addSceneClick = () => {
  addSceneDialogVisible.value = true
  ruleForm.dataset = sceneInfo.value.dataset
  ruleForm.datasetname = sceneInfo.value.datasetname
}
const addSceneDialogVisible = ref(false)
const ruleFormRef = ref()
const submitAddTag = async(formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      func_create_scenes({
        "dataset": ruleForm.dataset,  //数据集id
        "start_time_tamp": value1.value[0] ? Math.floor(value1.value[0].getTime() / 1000) : null,        // 开始时间戳
        "end_time_tamp": value1.value[1] ? Math.floor(value1.value[1].getTime() / 1000) : null,          //结束时间戳
        "tag_id": ruleForm.tag_id                  // 标签id
      }).then(res=>{
        ElMessage({
          message: '创建场景成功',
          type: 'success',
        })
        addSceneDialogVisible.value = false
        getSceneInfo()
      })
    } else {
      console.log('error submit!', fields)
    }
  })
}

const urlParams = new URLSearchParams(window.location.search);
const sceneid = urlParams.get('sceneid')
const reqip = urlParams.get('reqip')
const sceneInfo = ref({})
const sceneArray = ref([])
const currentScene = ref(null)
const isRender = ref(false)
let iconsallData = []
const scenetype = ["道路","行为交互","环境","车辆","其他"]

const handleClick = (namedata, frame) => {
  if (frame) {
    namedata.currentFrame = frame
  }
  if (!frame && currentScene.value && currentScene.value.scene_name === namedata.scene_name) {
    currentScene.value = null
  } else {
    currentScene.value = namedata
  }
  console.log(currentScene.value)
  emits('currentSceneClick', currentScene);
}

const emits = defineEmits(['currentSceneClick']);

const filterTagsArray = (tags) => {
  if (!tags) return [];
  let tagsArr = []
  let iconsall = iconsallData
  for(let i=0;i<tags.length;i++){
    for(let j=0;j<iconsall.length;j++){
      if(iconsall[j].id == tags[i]){
        tagsArr.push(iconsall[j])
      }
    }
  }
  return tagsArr;
}

const getIcons = () => {
  findAll(`${reqip}/api/ca_dms/models/tags`, {category: '行为交互,环境,道路,车辆,trip,项目,批次,自定义场景'}).then((res) => {
    iconsallData = res.data.data.map(it => {
      it.attributes.id = it.id
      return it.attributes
    })
    isRender.value = true
  }).catch((err) => {
    console.log(err, 'err')
  })
}

const getTags = (name) => {
  findAll(`${reqip}/api/ca_dms/models/tags`, {
    'category': '行为交互,环境,道路,车辆,trip,项目,批次,自定义场景',
    'filter[name][fuzzy-match]': name
  }).then((res) => {
    options.value = res.data.data.map(it => {
      it.attributes.id = it.id
      return it.attributes
    })
    loading.value = false
  }).catch((err) => {
    console.log(err, 'err')
  })
}

function getSceneInfo(){
  func_scenes({id:sceneid,version:'v2'}).then(res=>{
    let data = res.data.data.attributes
    data.id = res.data.data.id
    sceneInfo.value = data
    value1.value = [new Date(parseInt(data.dataset_starttime/1000000)), new Date(parseInt(data.dataset_endtime/1000000))]
    const arr = scenetype.map(it => {
      let sceneGroup = null
      if (it !== "其他") {
        sceneGroup = {
          type: it,
          names: data.scene_time_index.filter(item => item.category === it)
        } 
      } else {
        sceneGroup = {
          type: it,
          names: data.scene_time_index.filter(item => !["道路","行为交互","环境","车辆"].includes(item.category))
        } 
      }
      return sceneGroup
    })
    sceneArray.value = arr.filter(it => it.names.length > 0)
  })
}

getIcons()
getSceneInfo()

</script>

<style lang="scss">
.add-scene-modal {
  background: rgba(0, 0, 0, 0.25) !important;
}
.scene-top-container {
  padding: 0 10px;
  margin-bottom: 10px;
  width: 100%;

  .scene-area {
    display: flex;
    height: 60px;
    padding: 10px;
    background: #f5f5f5;

    .scene-group {
      display: flex;
      flex-direction: column;
      margin-right: 24px;

      .scene-type {
        font-size: 12px;
        color: #909399;
        // margin-bottom: 10px;
      }

      .scene-array {
        display: flex;
        
        .is-active {
          background: #ddd;
          border-radius: 4px;
        }

        .scene-name {
          margin-right: 10px;
          padding: 4px;
          font-size: 12px;
          white-space: nowrap;
          cursor: pointer;

          .scene-framelines {
            display: flex;

            .arrowdown:focus {
              border: none;
            }
          }
        }
      }
    }
  }

  #scenelibInfo-left{
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    margin-bottom: 10px;

    .dataInfo{
      display: flex;
      align-items: center;

      

      .btns {
        width: 276px;
        height: 180px;
        background: #fff;
        position: absolute;
        bottom: 0px;
        .el-tooltip__trigger {
          margin-top: 20px;
          width: 258px;
          height: 40px;
          background: #FFF1E5;
          color: #FF7900;
          border: none;
          margin-left: 0;
        }
        .exp-btn {
          margin: 20px 0;
          width: 258px;
          /* height: 40px; */
          background: #FFF1E5;
          color: #FF7900;
          border: none;
        }
      }

      .dataName{
        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 600;
        font-size: 24px;
        line-height: 32px;
        display: flex;
        align-items: center;
        color: #2D2F39;
        
        .scene-name-tag-icon {
          width: 24px; 
          height: 24px; 
          margin-right: 10px;
        }
      }
      .dataTime{
        margin-top: 4px;
        /* General/text-md/CN-Regular */

        font-family: 'PingFang SC';
        font-style: normal;
        font-weight: 400;
        font-size: 14px;
        line-height: 22px;


        /* 01 Netural/N300 */

        color: #8D91A5;
      }
      .setView{
        margin-top: 49px;
        .video_show{
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
          .video_show_label{
            /* General/text-md/CN-Medium */

            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 600;
            font-size: 14px;
            line-height: 22px;
            /* identical to box height, or 157% */

            display: flex;
            align-items: center;

            /* 01 Netural/N700 */

            color: #2D2F39;
          }
          .video_show_btn{
            /* Small/text-sm/CN-Regular */

            font-family: 'PingFang SC';
            font-style: normal;
            font-weight: 400;
            font-size: 12px;
            line-height: 20px;
            /* identical to box height, or 167% */

            display: flex;
            align-items: center;
            text-align: right;

            /* 02 Brand/P400 */

            color: #FF7900;
          }
        }
      }
    }
  }
}
 
</style>