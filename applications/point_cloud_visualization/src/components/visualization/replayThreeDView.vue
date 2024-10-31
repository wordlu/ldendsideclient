<template>
  <div id="threeDView" ref="container">
    <div id="three" ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted , ref , computed , watch , onBeforeUnmount, defineProps } from 'vue';
import * as THREE from 'three';
import {camera, scene, renderer, setCamera, setControls, setControlsEnable, setPointCloud } from './lib/replayInitThree';
import elementResizeDetectorMaker from 'element-resize-detector';
import { allWsSend , ws } from '../socket/thumbnailsocket';
import { dataSetStore } from '@/pinia/dataSet.js';
const dataSet = dataSetStore();

const initThree = async () =>{
  let width = document.getElementById('threeDView').offsetWidth;
  let height = document.getElementById('threeDView').offsetHeight;
  let threeDom = document.getElementById('three');
  let camera = setCamera(width,height);  // 创建相机
  const group = new THREE.Group(); // 创建对象组
  scene.add(group); // 将组添加到场景中
  
  renderer.setSize(width,height);
  renderer.render(scene,camera); // 创建渲染器
  setControls(camera); // 创建轨道控制器
  document.getElementById('three')?.appendChild(renderer.domElement); // 将渲染器的 DOM 元素添加到指定的 div 中
  setPointCloud(dataSet.lidarDevices, dataSet.initDisplays); //  创建点云并添加到场景中

  var animate = function () {
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
    if (resizeRendererToDisplaySize(renderer)) {
      const { clientWidth, clientHeight } = renderer.domElement;
      camera.aspect = clientWidth / clientHeight; // camera.aspect是 相机视口的宽高比
      camera.updateProjectionMatrix(); // 更新透视投影矩阵。
    }
    renderer.render(scene, camera);
  };

  animate();

  // windows
  function onWindowResize() {
    camera.aspect = document.getElementById('threeDView').offsetWidth / document.getElementById('threeDView').offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(document.getElementById('threeDView').offsetWidth, document.getElementById('threeDView').offsetHeight);
  }
  
  window.onresize = onWindowResize;

  // dom
  let erd = elementResizeDetectorMaker();
  erd.listenTo(document.getElementById("threeDView"), () => {
    setTimeout(()=>{
      camera.aspect = document.getElementById('threeDView').offsetWidth / document.getElementById('threeDView').offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(document.getElementById('threeDView').offsetWidth, document.getElementById('threeDView').offsetHeight);
    },1)
  });

  threeDom.addEventListener("mousemove", onDocumentMouseMove, false );
  // threeDom.addEventListener("mouseout", onDocumentMouseout, false );

  var selectedObject = [];
  function onDocumentMouseMove( event ) {
    event.preventDefault();
    var intersects = getIntersects( event.layerX, event.layerY );
    if (intersects.length > 0) {
      intersects.forEach((item,index)=>{
        selectedObject.push(item.object)
        item.object.material.color.set( '#f00' );
        
      })
    }else{
      selectedObject.forEach((item,index)=>{
        selectedObject.push(item)
        item.material.color.set( '#67C23A' );
        
      })
      selectedObject = [];
    }
  }

  let raycaster = new THREE.Raycaster();
  var mouseVector = new THREE.Vector3();
  function getIntersects( x, y ) {
    x = ( x / document.getElementById('threeDView').offsetWidth ) * 2 - 1;
    y = - ( y / document.getElementById('threeDView').offsetHeight ) * 2 + 1;
    mouseVector.set( x, y, 0.5 );
    raycaster.setFromCamera( mouseVector, camera );
    return raycaster.intersectObject( group, true );
  }
}

const resizeRendererToDisplaySize = async(renderer) =>{
  const { width, height, clientWidth, clientHeight } = renderer.domElement;
  const needResize = width !== clientWidth || height !== clientHeight;
  if (needResize) {
    renderer.setSize(clientWidth, clientHeight, false);
  }
  return needResize;
}

onMounted(()=>{
  setTimeout(()=>{
    initThree()
  },100)
})

onBeforeUnmount(()=>{
  allWsSend.close()
  ws.close()
})

</script>

<style lang="scss">
#threeDView{
  width: 100%;
  height: 100%;
  position: relative;
  #three{
    width: 100%;
    height: 100%;
  }
  canvas {
    width: 100%;
    height: 100%;
  }

  .loading-3d{
    width: 100%;
    height: 100%;
    background: rgba($color: #000000, $alpha: .7);
    position: relative;
    .loadingText{
      width: 100%;
      color:#ffffff;
      position: relative;
      top: calc(50% - 30px);
      text-align: center;
    }
  }

  .preload-2 {
    position: relative;
    left: 50%;
    top: 50%;
    margin-left: -20px;
    margin-bottom: 40px;
    width: 40px;
    height: 40px;
    z-index: 9;
  }
  .preload-2 span {
    position: absolute;
    display: block;
    bottom: 0px;
    width: 20px;
    height: 20px;
    background: #9b59b6;
  }
  .preload-2 span:nth-child(1) {
    -webkit-animation: preload-2-1 1.5s infinite ease-in-out;
            animation: preload-2-1 1.5s infinite ease-in-out;
  }
  .preload-2 span:nth-child(2) {
    left: 20px;
    -webkit-animation: preload-2-2 1.5s infinite ease-in-out;
            animation: preload-2-2 1.5s infinite ease-in-out;
  }
  .preload-2 span:nth-child(3) {
    top: 0px;
    -webkit-animation: preload-2-3 1.5s infinite ease-in-out;
            animation: preload-2-3 1.5s infinite ease-in-out;
  }
  .preload-2 span:nth-child(4) {
    top: 0px;
    left: 20px;
    -webkit-animation: preload-2-4 1.5s infinite ease-in-out;
            animation: preload-2-4 1.5s infinite ease-in-out;
  }

  @-webkit-keyframes preload-2-1 {
    0% {
      -webkit-transform: translateX(0) translateY(0) rotate(0);
              transform: translateX(0) translateY(0) rotate(0);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(-20px) translateY(-10px) rotate(-180deg);
              transform: translateX(-20px) translateY(-10px) rotate(-180deg);
      border-radius: 50%;
      background: #3498db;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
  }

  @keyframes preload-2-1 {
    0% {
      -webkit-transform: translateX(0) translateY(0) rotate(0);
              transform: translateX(0) translateY(0) rotate(0);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(-20px) translateY(-10px) rotate(-180deg);
              transform: translateX(-20px) translateY(-10px) rotate(-180deg);
      border-radius: 50%;
      background: #3498db;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
  }
  @-webkit-keyframes preload-2-2 {
    0% {
      -webkit-transform: translateX(0px) translateY(0px) rotate(0deg);
              transform: translateX(0px) translateY(0px) rotate(0deg);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(20px) translateY(-10px) rotate(180deg);
              transform: translateX(20px) translateY(-10px) rotate(180deg);
      border-radius: 50%;
      background: #f1c40f;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
  }
  @keyframes preload-2-2 {
    0% {
      -webkit-transform: translateX(0px) translateY(0px) rotate(0deg);
              transform: translateX(0px) translateY(0px) rotate(0deg);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(20px) translateY(-10px) rotate(180deg);
              transform: translateX(20px) translateY(-10px) rotate(180deg);
      border-radius: 50%;
      background: #f1c40f;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
  }
  @-webkit-keyframes preload-2-3 {
    0% {
      -webkit-transform: translateX(0px) translateY(0px) rotate(0deg);
              transform: translateX(0px) translateY(0px) rotate(0deg);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(-20px) translateY(10px) rotate(-180deg);
              transform: translateX(-20px) translateY(10px) rotate(-180deg);
      border-radius: 50%;
      background: #2ecc71;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
  }
  @keyframes preload-2-3 {
    0% {
      -webkit-transform: translateX(0px) translateY(0px) rotate(0deg);
              transform: translateX(0px) translateY(0px) rotate(0deg);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(-20px) translateY(10px) rotate(-180deg);
              transform: translateX(-20px) translateY(10px) rotate(-180deg);
      border-radius: 50%;
      background: #2ecc71;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(-360deg);
              transform: translateX(0) translateY(0) rotate(-360deg);
      border-radius: 0;
    }
  }
  @-webkit-keyframes preload-2-4 {
    0% {
      -webkit-transform: translateX(0px) translateY(0px) rotate(0deg);
              transform: translateX(0px) translateY(0px) rotate(0deg);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(20px) translateY(10px) rotate(180deg);
              transform: translateX(20px) translateY(10px) rotate(180deg);
      border-radius: 50%;
      background: #e74c3c;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
  }
  @keyframes preload-2-4 {
    0% {
      -webkit-transform: translateX(0px) translateY(0px) rotate(0deg);
              transform: translateX(0px) translateY(0px) rotate(0deg);
      border-radius: 0;
    }
    50% {
      -webkit-transform: translateX(20px) translateY(10px) rotate(180deg);
              transform: translateX(20px) translateY(10px) rotate(180deg);
      border-radius: 50%;
      background: #e74c3c;
    }
    80% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
    100% {
      -webkit-transform: translateX(0) translateY(0) rotate(360deg);
              transform: translateX(0) translateY(0) rotate(360deg);
      border-radius: 0;
    }
  }
}
</style>