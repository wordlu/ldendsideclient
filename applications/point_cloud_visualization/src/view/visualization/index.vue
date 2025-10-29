
<template>
  <div
    id="visualization"
    element-loading-background="rgba(122, 122, 122, 0.8)"
    v-loading="pageLoading"
  >
    <div class="view">
      <div class="main">
        <div class="container">
          <threeDView  v-if="viewportData" />
        </div>
        <cameras :timeoutLoading="timeoutLoading" />
        <toolBarVue />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import toolBarVue from "./components/toolBar.vue";
import videoBarVue from "./components/videoBar.vue";
import threeDView from "../../components/visualization/threeDView.vue";
import cameras from "../../components/camera/cameras.vue";
import { connectWebSocketArray } from "../../components/socket/socket";
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { dataSetStore } from "../../pinia/dataSet";
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'
import { ElMessage } from 'element-plus'

const dataSet = dataSetStore();
const route = useRoute();
const routeQuery = ref(route.query);
const pageLoading = ref(dataSet.pageLoading);
const timer = ref(null); 
const viewportData = ref<any>(null);
const timeoutLoading = ref(false);

function print(val) {
  document.getElementById("activeCamImg").style.width =
    document.getElementById("draggable-container").offsetWidth + "px";
}

const x = ref(document.documentElement.clientWidth - 408);
const y = ref(document.documentElement.clientHeight - 620);


function startTimeout() {
  timer.value = setTimeout(() => {
    pageLoading.value = false; // 去掉 loading 状态
    timeoutLoading.value = true;
    ElMessage({
      message: '设备启动异常，请检查设备连接！',
      type: 'error',
      duration: 20000,
      showClose: true,
    })
  },  5 * 60 * 1000);
}


watch(
  () => dataSet.pageLoading,
  (newVal, oldVal) => {
    pageLoading.value = newVal;
    if (dataSet.pageLoading && !timer.value) {
      startTimeout();
    } else if (!dataSet.pageLoading && timer.value) {
      clearTimeout(timer.value);
      timer.value = null;
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  const usingViewport = await findAll('logger/models/viewports', {include: 'devices', 'filter[using]': true})
  gostore.reset()
  gostore.sync(usingViewport.data)
  viewportData.value = gostore.findAll('viewports')[0]
  connectWebSocketArray(routeQuery.value.portarray, routeQuery.value.allports, viewportData.value);
  if (dataSet.pageLoading && !timer.value) {
    startTimeout();
  }
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearTimeout(timer.value);
  }
});

</script>


<style lang="scss">
.el-loading-spinner .path {
  stroke: #ff7900 !important;
}
#visualization {
  width: 100%;
  height: 100%;
  .view {
    width: 100%;
    height: 100%;
    display: flex;
    #toolBar {
      height: 100%;
    }
    .main {
      flex: 1;
      height: 100%;
      background: #000000;
      border-radius: 12px;
      position: relative;
      .container {
        width: 100%;
        height: 100%;
      }
    }
    .vdr-container.active {
      border-color: #ffffff !important;
    }
    .vdr-container.dragging {
      border-color: #ffffff !important;
    }
    .draggable-container {
      width: 100%;
      height: 100%;
      overflow: hidden;
      img {
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