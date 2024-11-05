<template>
  <div id="thumbvisualization">
    <div class="view">
      <div class="main">
        <div class="container">
          <threeDView v-if="viewportData" />
        </div>
        <cameras />
        <toolBarVue />
        <videoBarVue :currentScene="currentScene"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import videoBarVue from "./components/videoBar.vue";
import toolBarVue from "./components/toolBar.vue";
import threeDView from "../../components/visualization/replayThreeDView.vue";
import cameras from "../../components/camera/replaycameras.vue";
import { createHub } from '../../components/socket/thumbnailsocket';
import { ref , watch, onMounted } from 'vue';
import { dataSetStore } from '../../pinia/dataSet';
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'

const dataSet = dataSetStore();
const viewportData = ref<any>(null);

onMounted(async () => {
  const usingViewport = await findAll('logger/models/viewports', {include: 'devices', 'filter[using]': true})
  gostore.reset()
  gostore.sync(usingViewport.data)
  viewportData.value = gostore.findAll('viewports')[0]
  createHub(viewportData.value);
})
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