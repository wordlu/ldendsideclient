
<template>
  <div
    id="visualization"
    element-loading-background="rgba(122, 122, 122, 0.8)"
    v-loading="pageLoading"
  >
    <div class="view">
      <div class="main">
        <div class="container">
          <threeDView />
        </div>
        <cameras />
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
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { dataSetStore } from "../../pinia/dataSet";
import { findAll } from '@/api/jsonApi'
import gostore from '@/services/governance-store'

const dataSet = dataSetStore();
const route = useRoute();
const routeQuery = ref(route.query);
const pageLoading = ref(dataSet.pageLoading);

const viewportData = ref<any>(null);
const queryCurrentDrivers = async() => {
  try {
    await findAll('logger/models/viewports', {include: 'devices', 'filter[using]': true}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      viewportData.value = gostore.findAll('viewports')[0]
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

function print(val) {
  document.getElementById("activeCamImg").style.width =
    document.getElementById("draggable-container").offsetWidth + "px";
}

const x = ref(document.documentElement.clientWidth - 408);
const y = ref(document.documentElement.clientHeight - 620);

watch(
  () => dataSet.pageLoading,
  (newVal, oldVal) => {
    pageLoading.value = newVal;
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  await queryCurrentDrivers()
  console.log("1:createHub");
  connectWebSocketArray(routeQuery.value.portarray, routeQuery.value.allports, viewportData.value);
})

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