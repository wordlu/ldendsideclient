/**
 * 可视化回放
 */
import { Post } from "../../api/api";
import jsCookie from "js-cookie";
import { ref , onMounted } from 'vue';
import { dataSetStore } from '../../pinia/dataSet.js';
import { DracoPoint , renderODBox , scene , renderObjBox , renderDUTBox } from '../visualization/lib/initThree';
import * as THREE from 'three'

function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}
// 数据回显
// const podUrl = ref(`ws://${window.parent.location.hostname}/replay/`);
const podUrl = ref(`ws://loggertrash/replay/`);
let dataSet;
let ws;
let pcdWs;
let camWs;
let allWs;
let encodeWs;
let activeCam;
let splitInfo;
let group = new THREE.Group();
scene.add(group);
let odAllGroup = { //当前帧目标物组合
  list:new Array()
}

let dutAllGroup = { //当前帧目标物组合
  list:new Array()
}

let refAllGroup = { //当前帧目标物组合
  list:new Array()
}

let isData = false;

// 初始化socket,原initSocket
export const createHub = ()=>{
  ws = new WebSocket(`${podUrl.value}info`);
  dataSet = dataSetStore();
  ws.onopen = function() {
    console.log("3:连接websocket")
    // 发送数据集id
    let options = {
      dataset: getQueryString('dataset')
    }
    ws.send(JSON.stringify(options))
    console.log("4:websocket发送消息"+JSON.stringify(options))
  };

  ws.onmessage = function(evt) {
    try{
      console.log("5:websocket接收到消息"+evt.data)
      // 初始化数据，获取设备信息
      dataSet.info = JSON.parse(evt.data);
      const devicesHub = getQueryString('deviceshub') ? JSON.parse(getQueryString('deviceshub')) : [];
      const lidarDevices = devicesHub.filter(item => item.type == 'lidar').map(it => it.id);
      const cameraDevices = devicesHub.filter(item => item.type == 'camera').map(it => it.id);
      dataSet.lidarDevices = dataSet.info.devices.filter(item => lidarDevices.includes(item));
      dataSet.cameraDevices = dataSet.info.devices.filter(item => cameraDevices.includes(item));
      initAllSocket()
      dataSet.loading = false
    }catch(err){
      console.error('Init socket error:'+err);
    }
  };

  ws.onerror = (event) => {
    console.error('连接出错: ', event);
  };

  ws.onclose = function() {
    console.log("连接已关闭...");
  };
}

// 初始化视觉数据
// export const initCamSocket = ()=>{
//   camWs = new WebSocket(`${podUrl.value}cam`);

//   camWs.onclose = function() {
//     console.log("连接已关闭...");
//   };

//   const cams = dataSet.info.meta_json.cam;

//   //生成摄像头数据的结构
//   //cam 摄像头的名称
//   for(let cam in cams){
//     dataSet.activeCamInfo[cam] = null;
//   }

//   dataSet.activeCam.cam = Object.keys(dataSet.activeCamInfo)[0];
// }


// 初始化组合数据
export const initAllSocket = ()=>{
  allWs = new WebSocket(`${podUrl.value}frames`);

  allWs.onopen = function() {
    console.log("7:开启点云数据通道all")
    // 发送数据集id
    allWsSend(0, 0, 0, 1);
  };

  allWs.onclose = function() {
    console.log("连接已关闭...");
  };

  // const cams = dataSet.info.meta_json.cam;

  // for(let cam in cams){
  //   dataSet.activeCamInfo[cam] = null;
  // }

  // dataSet.activeCam.cam = Object.keys(dataSet.activeCamInfo)[0];
}

let urlval = ''
let request_count = 10
//获取视觉数据并渲染
export const allWsSend = (frame,play,endframe,request_count_val)=>{
  
  try{
    let options = {
      "dataset": getQueryString('dataset'),
      "devices": dataSet.info.devices,
      "request_index": frame,
      "request_count": request_count_val || request_count
      // frame_index:frame,
      // pcd: dataSet.info.meta_json.pcd,
      // cam: dataSet.info.meta_json.cam,
      // data_files_prefix: dataSet.info.data_files_prefix,
      // od: dataSet.info.meta_json.od,
      // kpi: getQueryString('kpi'),
      // client_name: getQueryString('client_name')
    }

    // if(getQueryString('endtime')){
    //   options.end_ts = parseTimestamp(getQueryString('endtime'));
    // }

    // if(getQueryString('starttime')){
    //   options.start_ts = parseTimestamp(getQueryString('starttime'));
    // }

    allWs.send(JSON.stringify(options));
    console.log("8:all websocket发送消息"+JSON.stringify(options))

    allWs.onmessage = async function(evt) {
      // console.log("9:all websocket接收消息"+evt.data)
      // 根据后端返回数据格式区分 数据类型
      if(typeof evt.data == 'string'){
        console.log("10:all websocket接收到string格式数据"+evt.data)
        splitInfo = JSON.parse(evt.data);
        
      }else{
        console.log("10:all websocket接收到ArrayBuffer格式数据")
        console.log(urlval,splitInfo.frame_index, "=====urlval")
        // 点云数据
        reader.readAs('ArrayBuffer',evt.data,function(result){
          // for(let key in splitInfo){

            // activeCamInfo 当前帧的摄像头数据
            // if(dataSet.activeCamInfo.hasOwnProperty(key)){
            //   // 摄像头数据生成 base64的url
            //   let url = arrayBufferToBase64(result.slice(splitInfo[key][0],splitInfo[key][1]))
            //   dataSet.activeCamInfo[key] = url
            //   if(dataSet.activeCam.cam == key){
            //     dataSet.activeCam.value = url
            //   }
            // }

            // activePcdInfo 当前帧的点云数据
            // if(dataSet.activePcdInfo.meta_key == key){
            //   DracoPoint(result)
            // }
            dataSet.lidarDevices.forEach((key,index)=>{
              if (key === "frame_index") return;
              const res = result.slice(splitInfo[key][0],splitInfo[key][1])
              if (!urlval || urlval == key) {
                urlval = key
                console.log("渲染点云1")
                DracoPoint(res)
              } else {
                console.log("渲染点云2")
                DracoPoint(res, 2)
              }
            })

            // dataSet.cameraDevices.forEach((key,index)=>{
            //   const res = result.slice(splitInfo[key][0],splitInfo[key][1])
            //   let url = arrayBufferToBase64(res)
            //   dataSet.activeCamInfo[key] = url
            //   if(dataSet.activeCam.cam == key){
            //     dataSet.activeCam.value = url
            //   }
            // })
          // }
        });
        
      }

      console.log("判断结束：",endframe, dataSet.activefame, play)
      if (play && dataSet.activefame <= endframe && dataSet.activefame + (request_count -2) <= splitInfo.frame_index) {
        dataSet.activefame = dataSet.activefame + request_count
      }
    };
  }catch(err){
    console.error('Init allWsSend error:'+err);
  }
}


// 数据解析
var reader = { 
  readAs: function(type,blob,cb){	var r = new FileReader();	r.onloadend = function(){
      if(typeof(cb) === 'function') {
        cb.call(r,r.result);
      }
    }
    try{
      r['readAs'+type](blob);
    }catch(e){
      console.log('error')
    }
  }
}

function arrayBufferToBase64 (buffer) {
  var binary = ''
  var bytes = new Uint8Array(buffer)
  var len = bytes.byteLength
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return 'data:image/jpeg;base64,' +  window.btoa(binary)
}

function parseTimestamp(timetamp){
  let timetampStr = timetamp.toString()
  return parseFloat(timetampStr.substring(0,10)+'.'+timetampStr.substring(10,13))
}

export { ws , pcdWs , camWs , encodeWs , isData };