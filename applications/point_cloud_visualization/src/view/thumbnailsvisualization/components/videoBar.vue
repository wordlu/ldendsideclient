

<template>
  <div id="thumbnailsvideoBar">
    <div class="control">
      <div class="control-prev control-item" @click="prev" style="margin-right: 10px;">
        <img src="../../../assets/prev.svg" alt="" style="margin-right: 3px;" />
      </div>
      <div class="control-stop" @click="start">
        <img src="../../../assets/pause.svg" alt="" v-if="isStart" />
        <img src="../../../assets/stop.svg" alt="" class="marginLeft3" v-else />
      </div>
      <div class="control-next control-item" @click="next" style="margin-left: 10px;">
        <img src="../../../assets/next.svg" alt="" style="margin-left: 3px;" />
      </div>
    </div>
    <div class="progress-area">
      <div class="Progress-thumbnails">
        <div class="Progress_back"
          @mouseleave="progressMouseleave"
          @mousedown="setProgressPosDown"
          @mouseup="setProgressPosUp"
          @mousemove="progressMove">
          <div class="Progress_line"></div>
        </div>
        <span style="font-size: 12px;margin-left: 10px;">{{ currentTimeString }}/{{ time_value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { dataSetStore } from '../../../pinia/dataSet'
import { ref , watch , computed, onMounted, nextTick, defineProps } from 'vue'
import { allWsSend, startPlaying, stopPlaying } from '../../../components/socket/thumbnailsocket'
import {dataval} from './dataval'
import { func_scene_thumbnail } from '../../../api/api'
import * as THREE from 'three';
const props = defineProps({
  currentScene: {
    type: Object,
    required: true
  },
});
const data = ref([])
const thumbnailsContainer = ref(null);
const imageCount = ref(9)
const urlParams = new URLSearchParams(window.location.search);
const datasetid = ref(urlParams.get('dataset'))
const getDataval = async () => {
  const arr = await func_scene_thumbnail({dataset: datasetid.value,image_count: imageCount.value})
  return arr.data.data
}
const startframe = ref(0)
const createBox = (obj) => {
  const geometry = new THREE.BoxGeometry(obj.dimension_x, obj.dimension_y, obj.dimension_z);
  const material = new THREE.MeshBasicMaterial({ color: 0xFF7900, wireframe: true });
  const box = new THREE.Mesh(geometry, material);
  box.position.set(obj.position_x, obj.position_y, obj.position_z);
  box.rotation.z = obj.yaw;
  return box;
};

const createThumbnail = (pointCloud) => {
  const boundingBox = new THREE.Box3().setFromObject(pointCloud);
  const center = boundingBox.getCenter(new THREE.Vector3());
  const size = boundingBox.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = 50;
  const aspectRatio = 1; // square thumbnails
  const distance = maxDim / (2 * Math.tan((Math.PI * fov) / 360));

  const thumbRenderer = new THREE.WebGLRenderer({ antialias: true });
  const thumbCamera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.1, 1000);
  const thumbScene = new THREE.Scene();

  thumbCamera.position.set(center.x, center.y, center.z + distance);
  thumbCamera.lookAt(center);
  thumbRenderer.setSize(160, 160);
  thumbRenderer.setClearColor(0x000000, 0);
  thumbRenderer.clear();

  thumbScene.add(pointCloud);
  thumbRenderer.render(thumbScene, thumbCamera);

  thumbScene.remove(pointCloud);
  return thumbRenderer.domElement.toDataURL();
};

const loadThumbnails = () => {
  if (thumbnailsContainer.value) {
    const thumbnailsContainerElem = thumbnailsContainer.value;
    thumbnailsContainerElem.innerHTML = '';

    data.value.forEach((frameData, index) => {
      const frame = new THREE.Group();
      frameData.od.forEach((obj) => {
        if (obj) {
          const box = createBox(obj);
          frame.add(box);
        }
      });

      const thumbnailDiv = document.createElement('div');
      thumbnailDiv.classList.add('thumbnail');
      // if (index === 1) { 
        // thumbnailDiv.classList.add('highlight');
      // }
      thumbnailDiv.style.backgroundImage = `url(${createThumbnail(frame)})`;
      thumbnailsContainerElem.appendChild(thumbnailDiv);
    });
  }
};

onMounted(async () => {});

const dataSet = dataSetStore()

const info = computed(()=>{
  return dataSet.info;
})
const offsetX = ref(0)

const isShow = ref(false)

const frame_count = ref()
const time_value = ref('00:00')

const activeFrame = ref(dataSet.activefame) // 当前帧

const frame_duration = ref(0) //每帧的时长

const moveFrame = ref()

const isStart = ref(false)

const loading = ref(dataSet.loading)

watch(()=>dataSet.loading,(newVal)=>{
  loading.value = newVal
},{deep:true})

const step = computed(()=>{
  const num = document.querySelector('.Progress_back').offsetWidth / (frame_count.value)
  // 进度条的步长 = 进度条渲染长度/帧数
  console.log(document.querySelector('.Progress_back').offsetWidth , frame_count.value - 1, num, '进度条的步长')
  return num
})

if(dataSet.info.frame_count){
  isShow.value = true;
}

const getTimeValue = (start_time, end_time) => {
  if (!start_time || !end_time || end_time < start_time) return '00:00:00';
  const startTime = new Date(start_time);
  const endTime = new Date(end_time);
  const durationMs = endTime - startTime;
  const durationInSeconds = Math.round(durationMs);
  const hours = Math.floor(durationInSeconds / 3600);  // 计算小时
  const minutes = Math.floor((durationInSeconds % 3600) / 60);  // 计算分钟
  const seconds = durationInSeconds % 60;  // 计算秒数
  // 判断是否超过 1 小时
  if (hours > 0) {
    // 超过1小时，显示为 "HH:mm:ss"
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    // 不超过1小时，显示为 "mm:ss"
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

// 计算当前帧对应的时间（毫秒转秒）
const currentTime = computed(() => {
  return activeFrame.value * frame_duration.value;
});

// 将时间戳转换为格式化字符串，显示为 "秒.毫秒" 格式
const currentTimeString = computed(() => {
  const durationMs = currentTime.value;
  const durationInSeconds = Math.round(durationMs);
  const hours = Math.floor(durationInSeconds / 3600);  // 计算小时
  const minutes = Math.floor((durationInSeconds % 3600) / 60);  // 计算分钟
  const seconds = durationInSeconds % 60;  // 计算秒数
  // 判断是否超过 1 小时
  if (hours > 0) {
    // 超过1小时，显示为 "HH:mm:ss"
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    // 不超过1小时，显示为 "mm:ss"
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  // const seconds = Math.floor(currentTime.value / 1000);
  // const milliseconds = currentTime.value % 1000;
  // return `${seconds}.${String(milliseconds).padStart(3, '0')}s`;
});

watch(info,(newVal)=>{
  // 处理帧数
  frame_count.value = newVal.frame_count-1;
  document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px';
  // 计算总时长
  time_value.value = getTimeValue(newVal.start_time, newVal.end_time);
  //计算每帧的时长
  frame_duration.value = (newVal.end_time - newVal.start_time) / frame_count.value;
},{deep:true})

watch(()=>dataSet.activefame,(newVal,oldVal)=>{
  if(isStart.value){
    activeFrame.value = dataSet.activefame
    if(activeFrame.value <= frame_count.value){
      document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px'
    }else{
      isStart.value = false;
    }
  }
})

const progressMove = (e)=>{
  offsetX.value = e.offsetX;
  moveFrame.value = parseInt(e.offsetX / step.value);
}

const progressMouseleave = ()=>{
  
}

const setProgressPosDown = ()=>{
  if(!loading.value){
    document.querySelector('.Progress_line').style.width = offsetX.value + 'px';
    activeFrame.value = moveFrame.value;
    dataSet.activefame = moveFrame.value;
    getCertainFrameData();
  }
}

const setProgressPosUp = ()=>{
  
}

const getCertainFrameData = ()=>{
  allWsSend(activeFrame.value, false, 1);
}

const start=()=>{
  if(!loading.value){
    if(!isStart.value){
      // 当前帧数小于总帧数
      if(activeFrame.value < frame_count.value){
        dataSet.activefame ++
        activeFrame.value = dataSet.activefame
        document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px'
      }else {
        dataSet.activefame = 0
      }
      isStart.value = true
      startPlaying(activeFrame.value) // 开始播放
    }else{
      isStart.value = false
      stopPlaying() // 停止播放
    }
  }
}

const prev=()=>{
  isStart.value = false
  dataSet.activefame = activeFrame.value
  if(activeFrame.value > 0 && activeFrame.value > startframe.value){
    dataSet.activefame --
    activeFrame.value = dataSet.activefame
    getCertainFrameData()
    document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px'
  }
}

const next=()=>{
  isStart.value = false
  dataSet.activefame = activeFrame.value
  if(activeFrame.value < frame_count.value ){
    dataSet.activefame ++
    activeFrame.value = dataSet.activefame
    getCertainFrameData()
    document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px'
  }
}

</script>


<style lang="scss">

.mask {
  position: absolute;
  bottom: 0;
  // left: 20px;
  // right: 20px;
  // width: 100%;
  width: calc(100% - 12px);
  margin: 0 6px;
  height: 180px;
  background: rgba(255, 255, 255, 0.35);
  z-index: 2;
  transition: clip-path 0.3s ease;
}

.thumbnail {
  flex-grow: 1;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  width: 160px; /* Example size */
  height: 160px; /* Example size */
  border-right: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.highlight {
  border: 2px solid black;
}



.vertical-line {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 160px;
  top: 60px;
  background-color: red;
}


#thumbnailsvideoBar{
  z-index: 999;
  color: #ffffff;
  width: calc(100% - 16px);
  height: 50px;
  background: transparent;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  .marginLeft3{
    margin-left: 3px;
  }
  .progress-area {
    width: 100%;
    flex: 1;
  }

  .progress-area-bg {
    background-color: rgba(255, 255, 255, 0.3);
  }

  .control{
    display: flex;
    width: 130px;
    height: 40px;
    align-items: center;
    margin-bottom: 10px;

    .control-item{
      border: 1px solid #FFFFFF1F;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
    }

    .control-stop{
      border: 1px solid #FFFFFF1F;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      cursor: pointer;
    }
  }
  #thumbnails {
    flex: 1;
    /* width: 100%; */
    display: flex;
    border-top: 1px solid #fff;
    margin-top: 4px;
    border-bottom: 1px solid #fff;
    border-left: 4px solid #fff;
    border-right: 4px solid #fff;
    margin: 4px 6px;
  }
  .Progress-thumbnails{
    width: 100%;
    height: 10px;
    display: flex;
    align-items: center;
    padding: 0 6px;
    .Progress_back{
      width: 100%;
      height: 8px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 4px;
      overflow: hidden;
      cursor: pointer;
      .Progress_line{
        width: 0px;
        height: 100%;
        border-radius: 4px;
        background: rgba(255, 121, 0, 1);
      }
    }
  }
}
</style>