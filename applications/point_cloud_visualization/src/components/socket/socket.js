/**
 * 实时可视化
 */
import { Post } from "../../api/api";
import jsCookie from "js-cookie";
import { ref , onMounted } from 'vue';
import { dataSetStore } from '../../pinia/dataSet.js';
import { DracoPoint, renderODBox, scene, clearGeometry } from '../visualization/lib/initThree';
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
        if (dataSet.currentCamera.port == ip) {
          let url = arrayBufferToBase64(result)
          if(url){
            dataSet.activeCamInfo[type] = url
            // dataSet.activeCam.value = url
          }
        }
      } else if (type == 'perception') {
        if (odAllGroup.list[0]) {
          odAllGroup.list[0].forEach((item,index)=>{
            group.remove(odAllGroup[`allGroup_${0}_${index}`]);
            delete odAllGroup[`allGroup_${0}_${index}`];
          })
        }
        const str = arrayBufferToString(result)
        const obj = JSON.parse(str)
        const data = obj && obj.objects ? obj.objects : []
        if (data && data.length > 0) {
          odAllGroup = renderODBox(data,odAllGroup,0);
          // 检查是否有框生成
          if(odAllGroup.list[0]){
            odAllGroup.list[0].forEach((item,index)=>{
              odAllGroup[`allGroup_${0}_${index}`] = new THREE.Group();
              odAllGroup[`allGroup_${0}_${index}`].add(item.mesh);
              odAllGroup[`allGroup_${0}_${index}`].add(item.line);
              group.add(odAllGroup[`allGroup_${0}_${index}`]);
            })
          }
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

function arrayBufferToString(buffer) {
  const decoder = new TextDecoder('utf-8'); // 'utf-8' 是默认编码
  return decoder.decode(buffer);
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
  const cameras = lists.filter(it => it.type === 'camera')
  dataSet.cameraDevices = cameras.map(it => {
    const device = viewportData.devices.find(item => it.port.indexOf(item['display-port']) > -1)
    return {
      port: it.port,
      slot: device.slot
    }
  })
  dataSet.currentCamera = dataSet.cameraDevices[0]
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