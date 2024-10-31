/**
 * 实时可视化
 */
import { Post } from "../../api/api";
import jsCookie from "js-cookie";
import { ref , onMounted } from 'vue';
import { dataSetStore } from '../../pinia/dataSet.js';
import { DracoPoint, renderODBox, scene, renderObjBox, renderDUTBox, clearGeometry } from '../visualization/lib/initThree';
import * as THREE from 'three'

function getQueryString(name) {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}

const podUrl = ref(null);
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

/**
 * @wodelu
 * 1. 两个数组参数，一个为所有ip，一个为当前连接ip，进行对比
 */
let connectedIPs = []
let closedIPs = []

let webSockets  = {}

let ipList = []

let allportArray = []
const timeouts = {}; // 每个通道的超时ID
let viewportData = null;
// let ipvalue = `ws://${window.parent.location.hostname}`
let ipvalue = `ws://loggertrash`
let reconnectInterval = null;  


export const connectWebSocketArray = (portarray, allports, data) => {
  viewportData = data;
  dataSet = dataSetStore();
  const currentport = portarray ? portarray.split(',') : []
  if (currentport.length > 0) {
    dataSet.pageLoading = true;
  }
  allportArray = JSON.parse(allports)

  //断开所有连接
  if (currentport.length === 0) {
    const lists = allportArray.map(item => `${ipvalue}:${item.port}`)
    disconnectFromAllIPs(lists)
  } else {
    const connectlist = currentport.map(item => {
      return {
        port: `${ipvalue}:${item}`,
        type: allportArray.find(it => it.port == item).type
      }
    })
    const disconnectlist = allportArray.filter(item => !currentport.includes(item.port)).map(it => `${ipvalue}:${it.port}`)
    disconnectFromAllIPs(disconnectlist)
    connectToAllIPs(connectlist)
  }
}
let urlval = ''
export const connectWebSocket = (ip, type) => {
  if (webSockets[ip] && webSockets[ip].status === 'Connected') {
    console.log(`Already connected to ${ip}`);
    return;
  }
  const socket = new WebSocket(ip)
  webSockets[ip] = {
    socket,
    status: 'Connecting...',
  };

  socket.onopen = () => {
    webSockets[ip].status = 'Connected';
    connectedIPs.push(ip);

    const index = closedIPs.find(it => it.ip === ip);
    if (index) {
        clearInterval(index.timer);
        closedIPs = closedIPs.filter(it => it.ip !== ip);
    }
    console.log(`socket.onopen: Connected to ${ip}`);
  };

  socket.onmessage = (event) => {
    dataSet.pageLoading = false;
    // 需求：一秒没接到数据清空上一帧
    clearTimeout(timeouts[ip]);
    timeouts[ip] = setTimeout(() => {
      clearGeometry(ip)
    }, 1000);
    reader.readAs('ArrayBuffer',event.data,function(result){
      if (type == 'lidar') {
        DracoPoint(result, ip)
      } else if (type == 'camera') {
        let url = arrayBufferToBase64(result)
        dataSet.activeCamInfo[type] = url
        if(url){
          dataSet.activeCam.value = url
        }
      }
    });
  }

  socket.onclose = () => {
    webSockets[ip].status = 'Disconnected';
    const index = connectedIPs.indexOf(ip);
    if (index > -1) {
      connectedIPs.splice(index, 1);
    }

    const index2 = closedIPs.find(it => it.ip === ip);
    if (!index2) {
      let timer = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          console.log('尝试重新连接 WebSocket...');
          connectWebSocket(ip, type);
        }
      }, 10000);
      closedIPs.push({
        ip,
        timer
      });
    }
    console.log(`socket.onclose: Disconnected from ${ip}`);
  };

  socket.onerror = (error) => {
    const index2 = closedIPs.find(it => it.ip === ip);
    if (!index2) {
      let timer = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) {
          console.log('尝试重新连接 WebSocket...');
          connectWebSocket(ip, type);
        }
      }, 10000);
      closedIPs.push({
        ip,
        timer
      });
    }
    console.error('socket.onerror: WebSocket error:', error)
  }
}


// 断开指定 IP 的 WebSocket
const disconnectFromIP = (ip) => {
  const wsData = webSockets[ip];
  if (wsData && wsData.socket) {
    wsData.socket.close();
  }
};

// 连接所有 IP
const connectToAllIPs = (lists) => {
  dataSet.lidarDevices = lists.filter(it => it.type === 'lidar').map(it => it.port)
  const displayArr = []
  for(const item in viewportData.displays){
    const itemDisplay = viewportData.devices.find(it => it.slot === item)
    const itemDisplayPort = itemDisplay ? itemDisplay['display-port'] : ''
    const ip = dataSet.lidarDevices.find(it => it.indexOf(itemDisplayPort) > -1)
    const obj = viewportData.displays[item]
    obj.ip = ip
    displayArr.push(obj)
  }
  dataSet.initDisplays = displayArr
  lists.forEach((item,index) => {
    connectWebSocket(item.port, item.type);
  });
};

// 断开所有 IP
const disconnectFromAllIPs = (lists) => {
  lists.forEach((ip) => {
    disconnectFromIP(ip);
  });
};

// //获取视觉数据并渲染
export const allWsSend = (frame,play)=>{
  try{
    let options = {
      frame_index:frame,
      pcd: dataSet.info.meta_json.pcd,
      cam: dataSet.info.meta_json.cam,
      data_files_prefix: dataSet.info.data_files_prefix,
      od: dataSet.info.meta_json.od,
      kpi: getQueryString('kpi'),
      client_name: getQueryString('client_name')
    }

    if(getQueryString('endtime')){
      options.end_ts = parseTimestamp(getQueryString('endtime'));
    }

    if(getQueryString('starttime')){
      options.start_ts = parseTimestamp(getQueryString('starttime'));
    }

    allWs.send(JSON.stringify(options));
    console.log("8:all websocket发送消息"+JSON.stringify(options))

    allWs.onmessage = async function(evt) {
      console.log("9:all websocket接收消息"+evt.data)
      // console.log("env.data",evt.data)
      // 根据后端返回数据格式区分 数据类型
      if(typeof evt.data == 'string'){
        console.log("10:all websocket接收到string格式数据")
        splitInfo = JSON.parse(evt.data);
        /**
         * od 真值数据
         * kpi 包含ref&dut ref是待测数据 dut是真值数据
         */
        dataSet.odInfo = splitInfo.od?splitInfo.od:[];
        dataSet.kpiInfo = splitInfo.kpi?splitInfo.kpi:[];
      }else{
        console.log("10:all websocket接收到ArrayBuffer格式数据")
        // 点云数据
        reader.readAs('ArrayBuffer',evt.data,function(result){
          for(let key in splitInfo){
            // activeCamInfo 当前帧的摄像头数据
            if(dataSet.activeCamInfo.hasOwnProperty(key)){
              // 摄像头数据生成 base64的url
              let url = arrayBufferToBase64(result.slice(splitInfo[key][0],splitInfo[key][1]))
              dataSet.activeCamInfo[key] = url
              if(dataSet.activeCam.cam == key){
                dataSet.activeCam.value = url
              }
            }
            if(dataSet.activePcdInfo.meta_key == key){
              DracoPoint(result)
            }
          }
        });

        // 生成车辆的框
        odAllGroup = renderODBox(dataSet.odInfo,odAllGroup,dataSet.activefame-1);
        if(odAllGroup.list.length > 0){
          for(let i=0;i<odAllGroup.list.length;i++){
            if(i == dataSet.activefame-1){
              odAllGroup.list[i].forEach((item,index)=>{
                odAllGroup[`allGroup_${i}_${index}`] = new THREE.Group();
                odAllGroup[`allGroup_${i}_${index}`].add(item.mesh);
                odAllGroup[`allGroup_${i}_${index}`].add(item.line);
                group.add(odAllGroup[`allGroup_${i}_${index}`]);
              })
            }else{
              odAllGroup.list[i].forEach((item,index)=>{
                group.remove(odAllGroup[`allGroup_${i}_${index}`]);
                delete odAllGroup[`allGroup_${i}_${index}`];
              })
            }
          }
        }

        refAllGroup = renderObjBox(dataSet.kpiInfo,refAllGroup);
        if(refAllGroup.list.length > 0){
          for(let i=0;i<refAllGroup.list.length;i++){
            if(i == dataSet.activefame-1){
              refAllGroup.list[i].forEach((item,index)=>{
                refAllGroup[`allGroup_${i}_${index}`] = new THREE.Group();
                refAllGroup[`allGroup_${i}_${index}`].add(item.mesh);
                refAllGroup[`allGroup_${i}_${index}`].add(item.line);
                group.add(refAllGroup[`allGroup_${i}_${index}`]);
              })
            }else{
              refAllGroup.list[i].forEach((item,index)=>{
                group.remove(refAllGroup[`allGroup_${i}_${index}`]);
                delete refAllGroup[`allGroup_${i}_${index}`];
              })
            }
          }
        }
        
        dutAllGroup = renderDUTBox(dataSet.kpiInfo,dutAllGroup);
        if(dutAllGroup.list.length > 0){
          for(let i=0;i<dutAllGroup.list.length;i++){
            if(i == dataSet.activefame-1){
              dutAllGroup.list[i].forEach((item,index)=>{
                dutAllGroup[`allGroup_${i}_${index}`] = new THREE.Group();
                dutAllGroup[`allGroup_${i}_${index}`].add(item.mesh);
                dutAllGroup[`allGroup_${i}_${index}`].add(item.line);
                group.add(dutAllGroup[`allGroup_${i}_${index}`]);
              })
            }else{
              dutAllGroup.list[i].forEach((item,index)=>{
                group.remove(dutAllGroup[`allGroup_${i}_${index}`]);
                delete dutAllGroup[`allGroup_${i}_${index}`];
              })
            }
          }
        }

        if(play){
          dataSet.activefame++
        }
      }
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