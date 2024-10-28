

<template>
  <div id="thumbnailsvideoBar">
    <div class="control">
      <!-- <div class="control-prev control-item" @click="prev" style="margin-right: 10px;">
        <img src="../../../assets/prev.svg" alt="" style="margin-right: 3px;" />
      </div> -->
      <div class="control-prev-next" @click="prev">
         上一帧
      </div>
      <div class="control-stop" @click="start">
        <img src="../../../assets/pause.svg" alt="" v-if="isStart" />
        <img src="../../../assets/stop.svg" alt="" class="marginLeft3" v-else />
      </div>
      <div class="control-prev-next" @click="next">
         下一帧
      </div>
      <!-- <div class="control-next control-item" @click="next" style="margin-left: 10px;">
        <img src="../../../assets/next.svg" alt="" style="margin-left: 3px;" />
      </div> -->
    </div>
    <div class="progress-area">
      <div class="Progress-thumbnails">
        <div class="Progress_back"
          @mousedown="setProgressPosDown"
          @mousemove="progressMove">
          <div class="Progress_line"></div>
        </div>
        <span style="min-width: 100px;font-size: 12px;margin-left: 10px;text-align: center;">{{ activeFrame }}/{{ currentTimeString }}/{{ time_value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { dataSetStore } from '../../../pinia/dataSet'
import { ref , watch , computed } from 'vue'
import { allWsSend, startPlaying, stopPlaying } from '../../../components/socket/thumbnailsocket'
import {dataval} from './dataval'
import { func_scene_thumbnail } from '../../../api/api'
import * as THREE from 'three';

const startframe = ref(0)

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
  frame_count.value = newVal.frame_count;
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
    }
    if(activeFrame.value >= frame_count.value){
      isStart.value = false;
      stopPlaying() // 停止播放
    }
  }
})

const progressMove = (e)=>{
  offsetX.value = e.offsetX;
  moveFrame.value = parseInt(e.offsetX / step.value);
}

const setProgressPosDown = ()=>{
  if(!loading.value){
    isStart.value = false
    stopPlaying() // 停止播放
    document.querySelector('.Progress_line').style.width = offsetX.value + 'px';
    activeFrame.value = moveFrame.value;
    dataSet.activefame = moveFrame.value;
    getCertainFrameData();
  }
}

const getCertainFrameData = ()=>{
  allWsSend(activeFrame.value, false, 1);
}

const start=()=>{
  if(!loading.value){
    if(!isStart.value){
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
  stopPlaying() // 停止播放
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
  stopPlaying() // 停止播放
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
    // width: 130px;
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

    .control-prev-next {
      margin: 0 10px;
      min-width: 40px;
      font-size: 12px;
      cursor: pointer;
    }

    .control-prev-next:hover {
      text-decoration: underline;
    }

    .control-prev-next:active {
      color: #FF7900;
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