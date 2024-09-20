<script setup>
import toolBarVue from "./components/toolBar.vue";
import topBarVue from "./components/topBar.vue";
import videoBarVue from "./components/videoBar.vue";
import threeDView from "../../components/visualization/threeDView.vue";
import cameras from "../../components/camera/cameras.vue";
import { createHub } from '../../components/socket/socket';
import { ref , watch } from 'vue';
import { dataSetStore } from '../../pinia/dataSet';
const dataSet = dataSetStore();
const activeCam = ref(dataSet.activeCam);

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

<template>
  <div id="visualization">
    <topBarVue />
    <div class="view">
      <toolBarVue />
      <div class="main">
        <Vue3DraggableResizable
          :initW="400"
          :initH="300"
          :x="x"
          :y="y"
          v-model:w="w"
          v-model:h="h"
          v-model:active="active"
          :draggable="true"
          :resizable="true"
          :parent="true"
          @activated="print('activated')"
          @deactivated="print('deactivated')"
          @drag-start="print('drag-start')"
          @resize-start="print('resize-start')"
          @dragging="print('dragging')"
          @resizing="print('resizing')"
          @drag-end="print('drag-end')"
          @resize-end="print('resize-end')"
          style="z-index: 9999;border: 1px solid rgba(235, 233, 233, 0.2);"
        >
          <div class="draggable-container" id="draggable-container" style="color: #ffffff;width: 100%;height: 100%;">
            <img id="activeCamImg" :src="activeCam.value" />
          </div>
        </Vue3DraggableResizable>

        <div class="container">
          <threeDView />
        </div>
        <cameras />
        <videoBarVue />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#visualization{
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
        height: 100%;
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