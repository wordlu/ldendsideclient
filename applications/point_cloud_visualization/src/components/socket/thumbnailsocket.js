/**
 * 可视化回放
 */
import { Post } from "../../api/api";
import jsCookie from "js-cookie";
import { ref , onMounted } from 'vue';
import { dataSetStore } from '../../pinia/dataSet.js';
import { DracoPoint, scene  } from '../visualization/lib/replayInitThree';
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
const podUrl = ref(`ws://${window.parent.location.hostname}/replay/`);
// const podUrl = ref(`ws://loggertrash/replay/`);
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

// 初始化点云文件通道
// export const initPcdSocket = ()=>{
//   pcdWs = new WebSocket(`${podUrl.value}pcd`);

//   pcdWs.onclose = function() {
//     console.log("连接已关闭...");
//   };
// }
// 获取pcd压缩数据并渲染
export const pcdWsSend = (frame)=>{
  try{
    pcdWs.send(JSON.stringify({
      frame_index:frame,
      meta_key:dataSet.activePcdInfo.meta_key,
      meta_val:dataSet.activePcdInfo.meta_val,
      data_files_prefix:dataSet.info.data_files_prefix
    }))

    pcdWs.onmessage = async function(evt) {
      reader.readAs('ArrayBuffer',evt.data,function(result){
        DracoPoint(result)
      });
    };
  }catch(err){
    console.error('Init pcdWsSend error:'+err);
  }
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

//获取视觉数据并渲染
export const camWsSend = (frame)=>{
  try{
    const cams = dataSet.info.meta_json.cam;
    for(let cam in cams){
      camWs.send(JSON.stringify({
        frame_index:frame,
        meta_key:cam,
        meta_val:cams[cam],
        data_files_prefix:dataSet.info.data_files_prefix
      }))
    }
    
    camWs.onmessage = async function(evt) {
      if(typeof evt.data == 'string'){
        activeCam = evt.data
      }else{
        reader.readAs('ArrayBuffer',evt.data,function(result){
          // 摄像头数据赋值
          let url = arrayBufferToBase64(result)
          dataSet.activeCamInfo[activeCam] = url
          if(dataSet.activeCam.cam == activeCam){
            dataSet.activeCam.value = url
          }
        });
      }
    };
  }catch(err){
    console.error('Init camWsSend error:'+err);
  }
}

// 初始化组合数据
export const initAllSocket = ()=>{
  allWs = new WebSocket(`${podUrl.value}frames`);

  allWs.onopen = function() {
    console.log("7:开启点云数据通道,并初始化第一帧点云数据")
    allWsSend(0, 0, 1);
  };

  allWs.onclose = function() {
    console.log("连接已关闭...");
  };
}

let bufferedFrames = []; // 存储帧数据的缓冲区
let totalFrames = 0; // 已请求最大帧数
let isRequesting = false; // 是否正在请求数据
let playInterval;

export const startPlaying = () => {
  if (totalFrames >= dataSet.info.frame_count) totalFrames = 0;
  // 100 毫秒每帧，即每秒 10 帧
  playInterval = setInterval(() => {
    if (bufferedFrames.length > 0) {
      let frameData = bufferedFrames.length > 1 ? bufferedFrames.shift() : bufferedFrames[0];
      renderFrame(frameData); // 渲染当前帧
      console.log('当前帧数111：'+frameData.splitInfo.frame_index)
      // 如果缓冲帧数少于5帧，并且当前缓存最后一帧的帧数大于已请求最大帧数，则请求下一批数据
      if (bufferedFrames.length <= 5 && bufferedFrames[bufferedFrames.length - 1].splitInfo.frame_index >= (totalFrames-1)) {
        allWsSend(totalFrames, 1)
      }
    } else {
      console.log('等待新数据...');
    }
  }, 100);
}

// 结束播放
export const stopPlaying = () => {
  bufferedFrames = [bufferedFrames[bufferedFrames.length - 1]];
  totalFrames = bufferedFrames[0].splitInfo.frame_index;
  if (playInterval) {
    clearInterval(playInterval);
  }
}

// 渲染当前帧
function renderFrame(frameData) {
  const splitInfo = frameData.splitInfo;
  const ArrayBufferData = frameData.ArrayBufferData;
  dataSet.activefame = splitInfo.frame_index
  console.log('当前帧数：'+dataSet.activefame)
  reader.readAs('ArrayBuffer',ArrayBufferData,function(result){
    // 渲染点云数据
    dataSet.lidarDevices.forEach((key,index)=>{
      if (key === "frame_index") return;
      const res = result.slice(splitInfo[key][0],splitInfo[key][1])
      DracoPoint(res, key)
    })
    // 渲染摄像头数据
    dataSet.cameraDevices.forEach((key,index)=>{
      const res = result.slice(splitInfo[key][0],splitInfo[key][1])
      let url = arrayBufferToBase64(res)
      dataSet.activeCamInfo[key] = url
      if(url){
        dataSet.activeCam.value = url
      }
    })
  });
}


// 每次返回的数据帧数
let request_count = 10
export const allWsSend = (frame, play, request_count_val)=>{
  try{
    let options = {
      "dataset": getQueryString('dataset'),
      "devices": dataSet.info.devices,
      "request_index": frame,
      "request_count": request_count_val || request_count
    }

    allWs.send(JSON.stringify(options));
    if (!play) {
      bufferedFrames = [];
      totalFrames = frame;
    } else {
      // 已请求的帧数增加
      totalFrames+= request_count;
    }
    console.log("8:all websocket发送消息")
    allWs.onmessage = async function(evt) {
      // 根据后端返回数据格式区分 数据类型
      if(typeof evt.data == 'string'){
        console.log("10:string数据"+evt.data)
        splitInfo = JSON.parse(evt.data);
        if (splitInfo.frame_index > dataSet.info.frame_count) {
          return;
        }
        bufferedFrames.push({
          splitInfo: splitInfo,
          ArrayBufferData: null
        })
      }else{
        if (splitInfo.frame_index > dataSet.info.frame_count) {
          return;
        }
        // 将接收到的ArrayBuffer数据存储到缓冲区中
        bufferedFrames[bufferedFrames.length - 1].ArrayBufferData = evt.data;
        console.log("10:ArrayBuffer数据")
      }

      if (!play) {
        // 不是播放中直接渲染当前数据
        renderFrame(bufferedFrames[0]);
      }
      // if (play && dataSet.activefame + (request_count -2) <= splitInfo.frame_index) {
      //   dataSet.activefame = dataSet.activefame + request_count
      // }
    };
  }catch(err){
    console.error('Init camWsSend error:'+err);
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