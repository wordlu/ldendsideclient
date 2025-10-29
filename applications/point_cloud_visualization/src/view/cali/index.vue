<template>
  <div id="calivisualization">
    <div class="view">
      <div class="main">
        <div class="container">
          <threeDView :isCali="isCali" :singleDevice="singleDevice" />
        </div>
        <videoBarVue v-show="showVideoBar" :currentScene="currentScene"/>
      </div>
      <toolBarVue @selModeChange="selModeChange" @activeTabClick="activeTabClick" />
    </div>
  </div>
</template>

<script setup lang='ts'>
import toolBarVue from "./components/toolBar.vue";
import videoBarVue from "./components/videoBar.vue";
import threeDView from "../../components/visualization/caliThreeDView.vue";
import { createHub } from '../../components/socket/calisocket';
import { ref , watch } from 'vue';
import { dataSetStore } from '../../pinia/caliDataSet';
import { useRoute } from 'vue-router';

const route = useRoute();
const isCali = ref(false);
const dataSet = dataSetStore();
const activeCam = ref(dataSet.activeCam);
const currentScene = ref({})
const currentSceneClick = (data) => {
  currentScene.value = data
}

watch(()=>dataSet.activeCam,(newVal)=>{
  dataSet.value = newVal
},{deep:true})

const selModeChange = (val) => {
  isCali.value = (val === 'union')
}
const showVideoBar = ref(true)
const singleDevice = ref('')
const activeTabClick = (val) => {
  singleDevice.value = ''
  showVideoBar.value = (val === 0)
  if (val === 1) {
    // 源
    singleDevice.value = route.query.devicename
  } else if (val === 2) {
    // 目标
    singleDevice.value = 'mainlidar'
  }
}

createHub();
console.log("1:createHub")

function print(val) {
  document.getElementById('activeCamImg').style.width= document.getElementById('draggable-container').offsetWidth+'px'
}

const x = ref(document.documentElement.clientWidth - 408)
const y = ref(document.documentElement.clientHeight - 620)
</script>



<style lang="scss">
#calivisualization{
  width: 100%;
  height: 100%;
  .view{
    width: 100%;
    height: 100%;
    display: flex;
    #toolBar{
      height: 100%;
    }
    #toolBar{
      width: 600px;
      height: 100%;
      background: #fff;
      border-radius: 0 12px 12px 0;
      padding-left: 20px;
    }
    .main{
      flex: 1;
      height: 100%;
      background: #000000;
      border-radius: 12px 0 0 12px;
      position: relative;
      .container{
        width: 100%;
        // height: 50%;
        height: calc(100% - 80px);
      }
    }
    .vdr-container.active{
      border-color: #ffffff!important;
    }
    .vdr-container.dragging{
      border-color: #ffffff!important;
    }
    .draggable-container{
      width: 100%;
      height: 100%;
      overflow: hidden;
      img{
        width: 400px;
        height: auto;
      }
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>