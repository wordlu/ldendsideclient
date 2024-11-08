/**
 * 可视化回放
 */
import { Post } from "../../api/api";
import jsCookie from "js-cookie";
import { ref , onMounted } from 'vue';
import { dataSetStore } from '../../pinia/dataSet.js';
import { DracoPoint, scene, clearGeometry, updateGeometry, renderODBox  } from '../visualization/lib/replayInitThree';
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
let currentSelectedSensor = []
let dutAllGroup = { //当前帧目标物组合
  list:new Array()
}

let refAllGroup = { //当前帧目标物组合
  list:new Array()
}

let isData = false;
let viewportData = null;

// 初始化socket,原initSocket
export const createHub = (data)=>{
  viewportData = data;
  ws = new WebSocket(`${podUrl.value}info`);
  dataSet = dataSetStore();
  ws.onopen = function() {
    console.log("3:连接websocket")
    // 发送数据集id
    let options = {
      dataset: getQueryString('dataset')
    }
    ws.send(JSON.stringify(options))
    // console.log("4:websocket发送消息"+JSON.stringify(options))
  };

  ws.onmessage = function(evt) {
    try{
      console.log("5:websocket接收到消息"+evt.data)
      // 初始化数据，获取设备信息
      dataSet.info = JSON.parse(evt.data);
      const devicesHub = viewportData['device-hub']
      dataSet.initDisplays = viewportData.displays;
      currentSelectedSensor = getQueryString('currentSelectedSensor') ? JSON.parse(getQueryString('currentSelectedSensor')) : [];
      // const devicesHub = getQueryString('deviceshub') ? JSON.parse(getQueryString('deviceshub')) : [];
      const lidarDevices = devicesHub.filter(item => item.type == 'lidar').map(it => it.id);
      const cameraDevices = devicesHub.filter(item => item.type == 'camera').map(it => it.id);
      dataSet.lidarDevices = dataSet.info.devices.filter(item => lidarDevices.includes(item));
      const cameraDevicesSelect = dataSet.info.devices.filter(item => cameraDevices.includes(item));
      dataSet.cameraDevices = cameraDevicesSelect.filter(it => currentSelectedSensor.includes(it));
      dataSet.currentCamera = dataSet.cameraDevices[0] ? dataSet.cameraDevices[0] : null;
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


export const changeCamera = (camera) => {
  const frameData = bufferedFrames.find(it => it.splitInfo.frame_index === dataSet.activefame);
  const ArrayBufferData = frameData.ArrayBufferData;
  const splitInfo = frameData.splitInfo;
  reader.readAs('ArrayBuffer',ArrayBufferData,function(result){
    // 渲染摄像头数据
    dataSet.cameraDevices.forEach((key,index)=>{
      const res = result.slice(splitInfo[key][0],splitInfo[key][1])
      if (camera == key) {
        let url = arrayBufferToBase64(res)
        if (currentSelectedSensor.includes(key)) {
          if(url){
            dataSet.activeCamInfo[key] = url
            // dataSet.activeCam.value = url
          }
        } else {
          if(url){
            // dataSet.activeCam.value = ''
            dataSet.activeCamInfo[key] = ''
          }
        }
      }
    })
  })
}

export const startPlaying = () => {
  if (totalFrames >= dataSet.info.frame_count) totalFrames = 0;
  // 100 毫秒每帧，即每秒 10 帧
  playInterval = setInterval(() => {
    if (bufferedFrames.length > 0) {
      let frameData = bufferedFrames.length > 1 ? bufferedFrames.shift() : bufferedFrames[0];
      renderFrame(frameData); // 渲染当前帧
      // console.log('当前帧数111：'+frameData.splitInfo.frame_index)
      // 如果缓冲帧数少于5帧，并且当前缓存最后一帧的帧数大于已请求最大帧数，则请求下一批数据
      if (bufferedFrames.length <= 5 && (bufferedFrames[bufferedFrames.length - 1]?.splitInfo?.frame_index >= (totalFrames-2) || !frameData)) {
        allWsSend(totalFrames, 1)
      }
    } else {
      console.log('等待新数据...');
      if (dataSet.activefame + 1 == dataSet.info.frame_count) {
        dataSet.activefame = dataSet.info.frame_count
      }
    }
  }, 100);
}

// 结束播放
export const stopPlaying = () => {
  bufferedFrames = [bufferedFrames[bufferedFrames.length - 1]];
  totalFrames = bufferedFrames[0]?.splitInfo?.frame_index || dataSet.info.frame_count;
  if (playInterval) {
    clearInterval(playInterval);
  }
}

// 渲染当前帧
function renderFrame(frameData) {
  if (!frameData) return;
  const splitInfo = frameData.splitInfo;
  dataSet.activefame = splitInfo.frame_index
  const ArrayBufferData = frameData.ArrayBufferData;
  // console.log('当前帧数：'+dataSet.activefame)
  if (!ArrayBufferData) return;
  reader.readAs('ArrayBuffer', ArrayBufferData, function(result){
    // 渲染点云数据
    dataSet.lidarDevices.forEach((key,index)=>{
      if (key === "frame_index") return;
      const res = result.slice(splitInfo[key][0],splitInfo[key][1])
      if (currentSelectedSensor.includes(key)) {
        DracoPoint(res, key)
        // updateGeometry(res, key)
      } else {
        clearGeometry(key)
      }
    })
    // 渲染摄像头数据
    dataSet.cameraDevices.forEach((key,index)=>{
      const res = result.slice(splitInfo[key][0],splitInfo[key][1])
      if (dataSet.currentCamera == key) {
        let url = arrayBufferToBase64(res)
        if (currentSelectedSensor.includes(key)) {
          if(url){
            dataSet.activeCamInfo[key] = url
            // dataSet.activeCam.value = url
          }
        } else {
          if(url){
            // dataSet.activeCam.value = ''
            dataSet.activeCamInfo[key] = ''
          }
        }
      }
    })
  });

  const boundingBox = splitInfo.box ? splitInfo.box : []
  // const boundingBox = [{
  //   "timestamp": 1667215911.7006044,
  //   "obj_id": 1,
  //   "yaw": 0.0246862993,
  //   "position_x": -10.3408260345,
  //   "position_y": -3.7921357155,
  //   "position_z": 1.5795454979,
  //   "dimension_x": 7.3658804893,
  //   "dimension_y": 2.2727267742,
  //   "dimension_z": 3.1590909958
  //   },
  //   {
  //   "timestamp": 1667215911.7006044,
  //   "obj_id": 2,
  //   "yaw": -0.0063693528,
  //   "position_x": -12.5363492966,
  //   "position_y": -15.4820775986,
  //   "position_z": 1.893266201,
  //   "dimension_x": 9.2399997711,
  //   "dimension_y": 2.2899999619,
  //   "dimension_z": 3.9000000954
  //   }]
  if (boundingBox.length <= 0) return;
  // 生成车辆的框
  odAllGroup = renderODBox(boundingBox,odAllGroup,dataSet.activefame);
  // 检查是否有框生成
  if(odAllGroup.list.length > 0){
    for(let i=0;i<odAllGroup.list.length;i++){
      // 处理当前激活帧的框
      if(i == dataSet.activefame){
        // 如果当前帧是激活帧，则执行以下操作：
        // 遍历当前帧的所有框。
        // 为每个框创建一个新的THREE.Group对象，并将框的网格和线条添加到该组中。
        // 将该组添加到场景的group中。
        odAllGroup.list[i].forEach((item,index)=>{
          odAllGroup[`allGroup_${i}_${index}`] = new THREE.Group();
          odAllGroup[`allGroup_${i}_${index}`].add(item.mesh);
          odAllGroup[`allGroup_${i}_${index}`].add(item.line);
          group.add(odAllGroup[`allGroup_${i}_${index}`]);
        })
      }else{
        // 如果当前帧不是激活帧
        // 从场景的group中移除对应的组
        // 删除该组
        odAllGroup.list[i].forEach((item,index)=>{
          group.remove(odAllGroup[`allGroup_${i}_${index}`]);
          delete odAllGroup[`allGroup_${i}_${index}`];
        })
      }
    }
  }
}


// 每次返回的数据帧数
let request_count = 20
export const allWsSend = (frame, play, request_count_val)=>{
  try{
    let options = {
      "dataset": getQueryString('dataset'),
      "devices": dataSet.info.devices,
      "request_index": frame,
      "request_count": request_count_val || request_count,
      "skip": 1
    }

    allWs.send(JSON.stringify(options));
    if (!play) {
      bufferedFrames = [];
      totalFrames = frame;
    } else {
      // 已请求的帧数增加
      totalFrames+= request_count;
    }
    // console.log("8:all websocket发送消息")
    allWs.onmessage = async function(evt) {
      let savearr = true;      
      // 根据后端返回数据格式区分 数据类型
      if(typeof evt.data == 'string'){
        // console.log("10:string数据"+evt.data)
        splitInfo = JSON.parse(evt.data);
        // 暂停中并且收到的帧数大于当前帧数，则过滤
        if (!play && splitInfo.frame_index !== dataSet.activefame) {
          savearr = false;
          console.log("过滤")
          return;
        }
        if (splitInfo.frame_index > dataSet.info.frame_count) {
          return;
        }
        bufferedFrames.push({
          splitInfo: splitInfo,
          ArrayBufferData: null
        })
      }else{
        if (!savearr) return;
        if (splitInfo.frame_index > dataSet.info.frame_count) {
          return;
        }
        // 将接收到的ArrayBuffer数据存储到缓冲区中
        bufferedFrames[bufferedFrames.length - 1].ArrayBufferData = evt.data;
      }

      // 不是播放中直接渲染当前帧数据
      if (!play) {
        renderFrame(bufferedFrames[0]);
      }
    };
  }catch(err){
    console.error('Init allWsSend error:'+err);
  }
}


// 数据解析
var reader = { 
  readAs: function(type,blob,cb){	
    var r = new FileReader();	r.onloadend = function(){
      if(typeof(cb) === 'function') {
        cb.call(r,r.result);
      }
    }
    try{
      r['readAs'+type](blob);
    }catch(e){
      console.log('数据解析出错:'+e);
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