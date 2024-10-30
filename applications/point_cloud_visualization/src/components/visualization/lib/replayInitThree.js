import * as THREE from 'three'

import DracoDecoderModule from './draco_decoder'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { setSceneGround } from './caliInitThree';
let camera,controls;
let geometry = new THREE.BufferGeometry()//创建图形对象
let geometry_draco; // draco 图形对象
let vertices = new Float32Array()//创建图形的顶点对象
let attribue = new THREE.BufferAttribute(vertices, 3)//创建属性对象
let renderObject = {}
//创建一个三维场景
const scene = new THREE.Scene()
//添加光源
const ambient = new THREE.AmbientLight(0x93BE2E, 0.5), light = new THREE.PointLight(0x93BE2E, 0.4)
scene.add(ambient)
light.position.set(1000,1000,1000)
scene.add(light)

//创建辅助坐标轴，X 轴为红色，Y 轴为绿色，Z 轴为蓝色。
const axesHelper = new THREE.AxesHelper(10)
scene.add(axesHelper)


// 渲染动画
const animate = () => {
  requestAnimationFrame(animate)
  if (!scene || !camera) return
  renderer?.render(scene, camera)
  controls?.update()
}

animate()

// //创建一个WebGL渲染器
const renderer = new THREE.WebGLRenderer()

export { scene , renderer , controls , camera}

//创建相机
export const setCamera = (width, height) => {
  camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 3000)
  setCameraPosition('xy')
  camera.up.set(0, 0, 1)
  // 在大多数属性发生改变之后，你将需要调用.updateProjectionMatrix来使得这些改变生效
  camera.updateProjectionMatrix()
  return camera;
}

export const setCameraPosition = (view) => {
  if (view === 'xy') {
    // 正视图
    camera.position.set(0, 0, 30);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  } else if (view === 'yz') {
    // 左视图
    camera.position.set(-30, 0, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  } else {
    // 俯视图
    camera.position.set(0, 30, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }
}

export const setControls = (camera) => {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.addEventListener('change',()=>{
    renderer.render(scene, camera)
  })
  return controls
}

export const setControlsEnable = (val) => {
  controls.enableRotate = val; // 禁用旋转
  controls.enableZoom = val; // 禁用缩放
  controls.enablePan = val; // 禁用平移 
}

export const setPointCloud = (lidarDevices) => {
  function getRandomHexColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16); // 16777215 是 #ffffff 的十进制表示
    return `#${randomColor.padStart(6, '0')}`; // 确保颜色代码为6位
  }
  
  function initpoint(obj) {
    for (let key in obj) {
      let points = new THREE.Points(obj[key].geometry, obj[key].material)//将上述对象配置到点模型对象上
      scene.add(points)
    }
  }

  lidarDevices.forEach((item,index)=>{
    renderObject[item] = {
      geometry: new THREE.BufferGeometry(),
      material:  new THREE.PointsMaterial({
        color: getRandomHexColor(),
        size: 0.001,
      })
    }
  })
  initpoint(renderObject) //  创建点云并添加到场景中
}

// Draco 解压pcd数据创建数据
export const DracoPoint = async (arr, type) =>{
  // 加载Draco解码器模块
  const decoderModule = await DracoDecoderModule();
  // 初始化解码缓冲区:将输入的数组arr转换为Uint8Array，并初始化解码缓冲区
  const buffer = new decoderModule.DecoderBuffer();
  buffer.Init(new Uint8Array(arr), arr.byteLength);
  // 创建一个Draco解码器实例
  const decoder = new decoderModule.Decoder();
  // 获取编码数据的几何类型（三角形网格或点云
  const geometryType = decoder.GetEncodedGeometryType(buffer);

  // 根据几何类型，创建相应的输出几何对象，并调用相应的解码函数。
  let outputGeometry;
  let status;
  if (geometryType == decoderModule.TRIANGULAR_MESH) {
    outputGeometry = new decoderModule.Mesh();
    status = decoder.DecodeBufferToMesh(buffer, outputGeometry);
  } else {
    outputGeometry = new decoderModule.PointCloud();
    status = decoder.DecodeBufferToPointCloud(buffer, outputGeometry);
  }

  // 遍历预定义的属性ID和类型，获取并解析几何属性
  const attributeIDs = {
    position: 'POSITION',
    intensity: 'GENERIC'
    // normal: 'NORMAL',
    // color: 'COLOR',
    // uv: 'TEX_COORD',
  }

  const attributeTypes = {
    position: 'Float32Array',
    normal: 'Float32Array',
    color: 'Float32Array',
    uv: 'Float32Array',
    intensity: 'Uint16Array'
  }
  
  for (var attributeName in attributeIDs) {
    var attributeType = attributeTypes[attributeName]
    var attribute
    var attributeID

    if (true) {
      attributeID = decoder.GetAttributeId(outputGeometry, decoderModule[attributeIDs[attributeName]])
      if (attributeID === -1) continue
      attribute = decoder.GetAttribute(outputGeometry, attributeID)
    }

    if (attributeIDs[attributeName] === 'POSITION') {
      geometry_draco = decodeAttribute(decoderModule, decoder, outputGeometry, attributeName, attributeType, attribute)
    }
  }

  // 调用createGeometry函数，将解码后的几何数据转换为可用的几何对象
  createGeometry(geometry_draco, type)
  // 释放解码器、几何对象和缓冲区的资源
  decoderModule.destroy(outputGeometry);
  decoderModule.destroy(decoder);
  decoderModule.destroy(buffer);
}

function createGeometry(geometryData, type) {
  let attribute = geometryData
  let name = attribute.name
  let array = attribute.array
  let itemSize = attribute.itemSize
  if (type) {
    renderObject[type]['geometry'].setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  } else {
    geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  }
}

export const updateGeometry = (arrayBuffer, type) => {
  let name = 'position'
  let itemSize = 3
  let array = new Float32Array(arrayBuffer)
  if (type) {
    renderObject[type]['geometry'].setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  } else {
    geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  }
}

export const clearGeometry = (type) => {
  renderObject[type]['geometry'].setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3))
}

function decodeAttribute(draco, decoder, dracoGeometry, attributeName, attributeType, attribute) {
  var numComponents = attribute.num_components()
  var numPoints = dracoGeometry.num_points()
  var numValues = numPoints * numComponents
  var dracoArray
  var ptr
  var array

  switch (attributeType) {
    case 'Float32Array':
      var dataSize = numValues * 4
      ptr = draco._malloc(dataSize)
      decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_FLOAT32, dataSize, ptr)
      array = new Float32Array(draco.HEAPF32.buffer, ptr, numValues).slice()
      draco._free(ptr)
      break

    case 'Int8Array':
      ptr = draco._malloc(numValues)
      decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_INT8, numValues, ptr)
      array = new Int8Array(draco.HEAP8.buffer, ptr, numValues).slice()
      draco._free(ptr)
      break

    case 'Int16Array':
      var dataSize = numValues * 2
      ptr = draco._malloc(dataSize)
      decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_INT16, dataSize, ptr)
      array = new Int16Array(draco.HEAP16.buffer, ptr, numValues).slice()
      draco._free(ptr)
      break

    case 'Int32Array':
      var dataSize = numValues * 4
      ptr = draco._malloc(dataSize)
      decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_INT32, dataSize, ptr)
      array = new Int32Array(draco.HEAP32.buffer, ptr, numValues).slice()
      draco._free(ptr)
      break

    case 'Uint8Array':
      ptr = draco._malloc(numValues)
      decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_UINT8, numValues, ptr)
      array = new Uint8Array(draco.HEAPU8.buffer, ptr, numValues).slice()
      draco._free(ptr)
      break

    case 'Uint16Array':
      var dataSize = numValues * 2
      ptr = draco._malloc(dataSize)
      decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_UINT16, dataSize, ptr)
      array = new Uint16Array(draco.HEAPU16.buffer, ptr, numValues).slice()
      draco._free(ptr)
      break

    case 'Uint32Array':
      var dataSize = numValues * 4
      ptr = draco._malloc(dataSize)
      decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, attribute, draco.DT_UINT32, dataSize, ptr)
      array = new Uint32Array(draco.HEAPU32.buffer, ptr, numValues).slice()
      draco._free(ptr)
      break

    default:
      throw new Error('THREE.DRACOLoader: Unexpected attribute type.')
  }

  return {
    name: attributeName,
    array: array,
    itemSize: numComponents,
  }
}
