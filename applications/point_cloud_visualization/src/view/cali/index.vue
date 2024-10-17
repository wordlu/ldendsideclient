<template>
  <div id="thumbvisualization">
    <!-- <topBarVue  @currentSceneClick="currentSceneClick" /> -->
    <div class="view">
      <toolBarVue/>
      <div class="main">
        <div class="container">
          <threeDView />
        </div>
        <videoBarVue :currentScene="currentScene"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import toolBarVue from "./components/toolBar.vue";
import topBarVue from "./components/topBar.vue";
import videoBarVue from "./components/videoBar.vue";
import threeDView from "../../components/visualization/threeDView.vue";
import cameras from "../../components/camera/cameras.vue";
import { createHub } from '../../components/socket/calisocket';
import { ref , watch } from 'vue';
import { dataSetStore } from '../../pinia/dataSet';
const dataSet = dataSetStore();
const activeCam = ref(dataSet.activeCam);
const currentScene = ref({})
const currentSceneClick = (data) => {
  currentScene.value = data
}

watch(()=>dataSet.activeCam,(newVal)=>{
  dataSet.value = newVal
},{deep:true})

createHub();
console.log("1:createHub")

function print(val) {
  document.getElementById('activeCamImg').style.width= document.getElementById('draggable-container').offsetWidth+'px'
}

const x = ref(document.documentElement.clientWidth - 408)
const y = ref(document.documentElement.clientHeight - 620)
</script>



<style lang="scss">
#thumbvisualization{
  width: 100%;
  height: 100%;
  .view{
    width: 100%;
    height: 100%;
    display: flex;
    #toolBar{
      height: 100%;
    }
    .main{
      flex: 1;
      height: 100%;
      background: #000000;
      border-radius: 12px;
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