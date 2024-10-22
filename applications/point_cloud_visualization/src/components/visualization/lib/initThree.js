import * as THREE from 'three'

import DracoDecoderModule from './draco_decoder'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let camera,controls;
let geometry = new THREE.BufferGeometry()//创建图形对象
let geometry2 = new THREE.BufferGeometry()//创建图形对象
let geometry_draco; // draco 图形对象
let vertices = new Float32Array()//创建图形的顶点对象
let attribue = new THREE.BufferAttribute(vertices, 3)//创建属性对象

//创建一个三维场景
const scene = new THREE.Scene()
//添加光源
const ambient = new THREE.AmbientLight(0x93BE2E, 0.5),
light1 = new THREE.PointLight(0x93BE2E, 0.4),
light2 = new THREE.PointLight(0x93BE2E, 0.4)

scene.add(ambient)
light1.position.set(1000,1000,1000)
scene.add(light1)
light2.position.set(-1000,-1000,-1000)
scene.add(light2)

//创建辅助坐标轴
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

/**
 * 配准---设置地面点
 * @param payload 接口请求回来的数据{centroid, norm, xLen, yLen}
 */
let groundPlane = null
export const setSceneGround = (payload) => {
  if (groundPlane !== null) {
    // 如果之前有地面, 则先删除
    scene.remove(groundPlane)
  }
  groundPlane = createPlane(
    new THREE.Vector3(...payload.centroid),
    new THREE.Vector3(...payload.norm),
    payload.xLen,
    payload.yLen
  )
  scene.add(groundPlane)
}

/**
 * 根据平面的点法式参数和其他参数构造一个可以显示的平面.
 * @param {THREE.Vector3} centroid 平面中心点.
 * @param {THREE.Vector3} norm 平面法向量.
 * @param {Number} xLen x 方向长度(未经过仿射变换前).
 * @param {Number} yLen y 方向长度(未经过仿射变换前).
 * @param {THREE.MeshBasicMaterialParameters} meshParam Mesh 参数.
 *
 * @returns {THREE.Mesh} 构造的可显示平面
 */
const createPlane = (centroid, norm, xLen, yLen, meshParam) => {
  const geometry = new THREE.PlaneGeometry(xLen, yLen, 32)
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    opacity: 0.5,
    transparent: true,
  })
  const plane = new THREE.Mesh(geometry, material)
  const matrix4 = new THREE.Matrix4().compose(
    centroid,
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), norm.normalize()),
    new THREE.Vector3(1, 1, 1)
  )
  plane.applyMatrix4(matrix4)
  return plane
}

/**
 * new_清除地面点
 */
export const clearPlane = () => {
  if (groundPlane !== null) {
    scene.remove(groundPlane)
    groundPlane = null
  }
}

// //创建一个WebGL渲染器
const renderer = new THREE.WebGLRenderer()

export { scene , renderer , controls , camera, points1, points2}

//创建相机
export const setCamera = (width, height) => {
  camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 3000)
  camera.position.set(0, 10, 20)
  camera.lookAt(0, 0, 0)
  camera.up.set(0, 0, 1)
  
  // 在大多数属性发生改变之后，你将需要调用.updateProjectionMatrix来使得这些改变生效
  camera.updateProjectionMatrix()
  return camera;
}

export const setControls = (camera) => {
  controls = new OrbitControls(camera, renderer.domElement)
  // controls.enableRotate = false; // 禁用旋转
  // controls.enableZoom = false; // 禁用缩放
  // controls.enablePan = false; // 禁用平移  
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

//设置obj box框对象的方法
export const renderObjBox = (data,allGroup) => {
  let group = new Array()
  data.forEach((item,index)=>{
    // 创建一个立方体几何体
    const geometry = new THREE.BoxGeometry(item.obj_dimension_x_dut, item.obj_dimension_y_dut, item.obj_dimension_z_dut);
    // 创建一个材质
    const material = new THREE.MeshBasicMaterial({
      color: 0x67C23A,
      transparent:true,
      opacity:0.6
    })

    // 利用几何体和材质生成网格模型
    const mesh = new THREE.Mesh(geometry, material);

    // 立方体几何体box作为EdgesGeometry参数创建一个新的几何体
    const edges = new THREE.EdgesGeometry(geometry);

    // 立方体线框，不显示中间的斜线
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0x67C23A
    })

    const line = new THREE.LineSegments(edges,edgesMaterial);

    // 网格模型和网格模型对应的轮廓线框插入到场景中

    mesh.position.x = item.obj_x_ref
    mesh.position.y = item.obj_y_ref
    mesh.position.z = item.obj_z_ref

    line.position.x = item.obj_x_ref
    line.position.y = item.obj_y_ref
    line.position.z = item.obj_z_ref

    //角度 = 弧度 * 180 / Math.PI
    let angle = item.obj_yaw_ref * 180 / Math.PI

    mesh.rotation.set(0, 0, item.obj_yaw_ref, "XZY");
    line.rotation.set(0, 0, item.obj_yaw_ref, "XZY");
    // 把网格模型添加到场景中
    scene.add(mesh,line);
    group.push({mesh:mesh,line:line})
  })
  allGroup.list.push(group)
  return allGroup;
}

//设置obj box框对象的方法
export const renderDUTBox = (data,dutAllGroup) => {
  let group = new Array()
  data.forEach((item,index)=>{
    // 创建一个立方体几何体
    const geometry = new THREE.BoxGeometry(item.obj_dimension_x_dut, item.obj_dimension_y_dut, item.obj_dimension_z_dut);
    // 创建一个材质
    const material = new THREE.MeshBasicMaterial({
      color: 0x409EFF,
      transparent:true,
      opacity:0.6
    })

    // 利用几何体和材质生成网格模型
    const mesh = new THREE.Mesh(geometry, material);

    // 立方体几何体box作为EdgesGeometry参数创建一个新的几何体
    const edges = new THREE.EdgesGeometry(geometry);

    // 立方体线框，不显示中间的斜线
    const edgesMaterial = new THREE.LineBasicMaterial({
      color: 0x409EFF
    })

    const line = new THREE.LineSegments(edges,edgesMaterial);

    // 网格模型和网格模型对应的轮廓线框插入到场景中

    mesh.position.x = item.obj_x_dut
    mesh.position.y = item.obj_y_dut
    mesh.position.z = item.obj_z_dut

    line.position.x = item.obj_x_dut
    line.position.y = item.obj_y_dut
    line.position.z = item.obj_z_dut

    //角度 = 弧度 * 180 / Math.PI
    let angle = item.obj_yaw_dut * 180 / Math.PI

    mesh.rotation.set(0, 0, item.obj_yaw_dut, "XZY");
    line.rotation.set(0, 0, item.obj_yaw_dut, "XZY");
    // 把网格模型添加到场景中
    scene.add(mesh,line);
    group.push({mesh:mesh,line:line})
  })
  dutAllGroup.list.push(group)
  return dutAllGroup;
}

//设置od box框对象方法
export const renderODBox = (data,odAllGroup,frame) => {
  if(!odAllGroup.list[frame]){
    let group = new Array()
    data.forEach((item,index)=>{
      // 创建一个立方体几何体
      const geometry = new THREE.BoxGeometry(item.dimension_x, item.dimension_y, item.dimension_z);
      // 创建一个材质
      const material = new THREE.MeshBasicMaterial({
        color: 0xF47A20,
        transparent:true,
        opacity:0.6
      })

      // 利用几何体和材质生成网格模型
      const mesh = new THREE.Mesh(geometry, material);

      // 立方体几何体box作为EdgesGeometry参数创建一个新的几何体
      const edges = new THREE.EdgesGeometry(geometry);

      // 立方体线框，不显示中间的斜线
      const edgesMaterial = new THREE.LineBasicMaterial({
        color: 0xF47A20
      })

      const line = new THREE.LineSegments(edges,edgesMaterial);

      // 网格模型和网格模型对应的轮廓线框插入到场景中

      mesh.position.x = item.position_x
      mesh.position.y = item.position_y
      mesh.position.z = item.position_z

      line.position.x = item.position_x
      line.position.y = item.position_y
      line.position.z = item.position_z

      //角度 = 弧度 * 180 / Math.PI
      let angle = item.yaw * 180 / Math.PI

      mesh.rotation.set(0, 0, item.yaw, "XZY");
      line.rotation.set(0, 0, item.yaw, "XZY");
      // 把网格模型添加到场景中
      // scene.add(mesh,line);
      group.push({mesh:mesh,line:line})
    })
    // odAllGroup.list.push(group)
    odAllGroup.list[frame] = group
  }
  
  return odAllGroup;
}

export const getQueryString = (name) => {
  var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  var r = window.location.search.substr(1).match(reg);
  if (r != null) {
    return unescape(r[2]);
  }
  return null;
}
const cloudpointparams = getQueryString('cloudpointparams') ? JSON.parse(getQueryString('cloudpointparams')) : {}

let material1 = new THREE.PointsMaterial({
  color: `#${cloudpointparams.color}` || '#0cf36d',//模型颜色
  // size: Number(cloudpointparams.size) || 0.01 //模型大小
  size: 0.001, //模型大小
  // vertexColors: true // 支持每个点使用不同的颜色
});//配置模型的材质对象   

let material2 = new THREE.PointsMaterial({
  color: '#ff01f3',//模型颜色
  size: 0.01, //模型大小
  // vertexColors: true // 支持每个点使用不同的颜色
});//配置模型的材质对象 


// @wodelu:TODO: 修改点云颜色
// 选择框选的点并高亮
export const highlightSelectedPoints = (pointArray, num) => {
  console.log('修改点云颜色')
};


let points1 = new THREE.Points(geometry, material1)//将上述对象配置到点模型对象上
let points2 = new THREE.Points(geometry2, material2)//将上述对象配置到点模型对象上

function getRandomHexColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16); // 16777215 是 #ffffff 的十进制表示
  return `#${randomColor.padStart(6, '0')}`; // 确保颜色代码为6位
}

function initpoint(renderObject) {
  for (let key in renderObject) {
    let points = new THREE.Points(renderObject[key].geometry, renderObject[key].material)//将上述对象配置到点模型对象上
    scene.add(points)
  }
}

let renderObject = {}
export const setPointCloud = (lidarDevices) => {

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

export const setPointCloud2 = () => {
  // console.log(cloudpointparams)
         
  // function initpoint() {
  //   scene.add(points2)
  // }
  // initpoint() //  创建点云并添加到场景中
}

// 原始点云创建
export const DrawPoint = (arr) => {
  attribue = new THREE.BufferAttribute(new Float32Array(arr), 3);
  geometry.attributes.position = attribue;
  geometry.dispose()
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
  // 此方法上一帧的数据会被新的数据覆盖。这是因为Three.js的BufferAttribute对象是直接修改顶点数据的，而不是创建新的几何体
  // if (type === 2) {
  //   geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  // } else {
  //   geometry2.setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  // }
  renderObject[type]['geometry'].setAttribute(name, new THREE.BufferAttribute(array, itemSize))
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
