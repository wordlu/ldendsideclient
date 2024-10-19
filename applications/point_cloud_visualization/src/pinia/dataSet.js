import { defineStore } from 'pinia'

export const dataSetStore = defineStore('dataSet', {
  state: () => {
    return {
      info:{},
      // 当前帧
      activefame:0,
      // PCD格式数据，用于渲染3d点云
      activePcdInfo:{
        meta_key:null,
        meta_val:null
      },
      // 摄像头数据集合
      activeCamInfo:{},
      // 当前摄像头信息
      activeCam:{
        cam:null,
        value:null
      },
      odInfo:[],
      kpiInfo:[],
      selectedIndices:[],
      selectedTargetIndices:[],
      clearSelectionBoxValue:0,
      loading:true
    }
  },
  getters: { 
    SET_INFO(e){
      return this.info = e;
    },
    GET_INFO(){
      return this.info;
    },
    SET_CAM_INFO(e){
      return this.info = e;
    }
  },
  actions: {
    
  }
})
