<script setup>
import { dataSetStore } from '../../../pinia/dataSet'
import { ref , watch , computed } from 'vue'
import { allWsSend } from '../../../components/socket/socket'
const dataSet = dataSetStore()

const info = computed(()=>{
  return dataSet.info;
})

const offsetX = ref(0)

const isShow = ref(false)

const frames_num = ref()

const activeFrame = ref(dataSet.activefame)

const moveFrame = ref()

const isStart = ref(false)

const loading = ref(dataSet.loading)

watch(()=>dataSet.loading,(newVal)=>{
  loading.value = newVal
},{deep:true})

const step = computed(()=>{
  return document.querySelector('.Progress_back').offsetWidth / (frames_num.value - 1);
})

if(dataSet.info.frames_num){
  isShow.value = true;
}

watch(info,(newVal)=>{
  frames_num.value = newVal.frames_num-1;
  document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px';
},{deep:true})

watch(()=>dataSet.activefame,(newVal,oldVal)=>{
  if(isStart.value){
    activeFrame.value = dataSet.activefame
    if(activeFrame.value <= frames_num.value){
      allWsSend(activeFrame.value,true)
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
    getData();
  }
}

const setProgressPosUp = ()=>{
  
}

const getData = ()=>{
  allWsSend(activeFrame.value,false);
}

const start=()=>{
  if(!loading.value){
    if(!isStart.value){
      if(activeFrame.value < frames_num.value){
        dataSet.activefame ++
        activeFrame.value = dataSet.activefame
        allWsSend(activeFrame.value, false)
        document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px'
        isStart.value = true
      }else if(activeFrame.value >= frames_num.value){
        isStart.value = true
        dataSet.activefame = 0
      }else{
        isStart.value = false;
      }
    }else{
      isStart.value = false
    }
  }
}

const prev=()=>{
  isStart.value = false
  dataSet.activefame = activeFrame.value
  if(activeFrame.value > 0){
    dataSet.activefame --
    activeFrame.value = dataSet.activefame
    allWsSend(activeFrame.value,false)
    document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px'
  }
}

const next=()=>{
  isStart.value = false
  dataSet.activefame = activeFrame.value
  if(activeFrame.value < frames_num.value){
    dataSet.activefame ++
    activeFrame.value = dataSet.activefame
    allWsSend(activeFrame.value,false)
    document.querySelector('.Progress_line').style.width = step.value * activeFrame.value + 'px'
  }
}

</script>

<template>
  <div id="videoBar">
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
    <div class="Progress">
      <div class="Progress_back"
        @mouseleave="progressMouseleave"
        @mousedown="setProgressPosDown"
        @mouseup="setProgressPosUp"
        @mousemove="progressMove">
        <div class="Progress_line"></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#videoBar{
  position: absolute;
  left: 8px;
  bottom: 8px;
  z-index: 999;
  color: #ffffff;
  width: calc(100% - 16px);
  height: 50px;
  background: #191919;
  border-radius: 8px;
  display: flex;
  .marginLeft3{
    margin-left: 3px;
  }
  .control{
    display: flex;
    width: 130px;
    height: 100%;
    align-items: center;
    margin-left: 30px;
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
  .Progress{
    flex: 1;
    padding: 0 20px;
    display: flex;
    align-items: center;
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