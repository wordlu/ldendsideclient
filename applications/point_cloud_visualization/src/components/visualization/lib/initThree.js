import * as THREE from 'three'
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import DracoDecoderModule from './draco_decoder'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

let camera,controls;
let geometry = new THREE.BufferGeometry()//创建图形对象
let geometry_draco; // draco 图形对象
let vertices = new Float32Array()//创建图形的顶点对象
let attribue = new THREE.BufferAttribute(vertices, 3)//创建属性对象

let loadedFont = null; // 用于存储已加载的字体

//创建一个三维场景
const scene = new THREE.Scene()
//创建辅助坐标轴
const axesHelper = new THREE.AxesHelper(5)
scene.add(axesHelper)
//添加坐标轴文字
const createLabelSprite = (text, position, rotation = new THREE.Vector3(0, 0, 0), group) => {
  // 创建 canvas 并获取其上下文
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  // 设置 canvas 尺寸和样式
  canvas.width = 400;  // 调整宽度以适应文字内容
  canvas.height = 80;  // 高度较小即可
  context.font = '80px Arial';  // 设置字体样式
  context.fillStyle = 'white';   // 文字颜色
  context.textAlign = 'center';  // 水平居中对齐
  context.textBaseline = 'middle';  // 垂直居中对齐
  context.clearRect(0, 0, canvas.width, canvas.height);  // 清空画布

  // 在 canvas 上绘制文字
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // 创建纹理并使用 canvas 作为源
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // 创建精灵材质，使用纹理作为材质的 map
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);

  // 调整精灵大小
  sprite.scale.set(2, 0.5, 1);  // 根据需要调整比例

  // 设置精灵的位置和旋转
  sprite.position.copy(position);
  sprite.rotation.set(rotation.x, rotation.y, rotation.z);

  if (group) return sprite;
  // 将精灵添加到场景中
  scene.add(sprite);
};
// 添加 XYZ 文字精灵
createLabelSprite('X', new THREE.Vector3(5, 0, 0));  // X轴标识
createLabelSprite('Y', new THREE.Vector3(0, 5, 0));  // Y轴标识
createLabelSprite('Z', new THREE.Vector3(0, 0, 5));  // Z轴标识

// 渲染动画
const animate = () => {
  requestAnimationFrame(animate)
  if (!scene || !camera) return
  renderer?.render(scene, camera)
  controls?.update()
}

animate()

//创建一个WebGL渲染器
const renderer = new THREE.WebGLRenderer()

export { scene , renderer , controls , camera}

//创建相机
export const setCamera = (width, height) => {
  camera = new THREE.PerspectiveCamera(80, width / height, 0.1, 3000)
  // camera.position.set(0, 10, 20)
  // camera.lookAt(0, 0, 0)
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
  // setControlsEnable(false)
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
//设置od box框对象方法
export const renderODBox = (data,odAllGroup,frame) => {
  let group = new Array()
  data.forEach((item,index)=>{
    // 创建一个立方体几何体
    const geometry = new THREE.BoxGeometry(item.dimensions_x, item.dimensions_y, item.dimensions_z);
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
    mesh.position.set(item.position_x, item.position_y, item.position_z)
    line.position.set(item.position_x, item.position_y, item.position_z)

    // 使用四元数旋转
    const quaternion = new THREE.Quaternion(
      item.orientation_x,
      item.orientation_y,
      item.orientation_z,
      item.orientation_w
    );
    // 应用四元数到 Mesh 和 LineSegments
    mesh.quaternion.copy(quaternion);
    line.quaternion.copy(quaternion);

     // 创建 3D 文字
    //  const textGeometry = new TextGeometry(item.type || 'Label', {
    //   font: loadedFont,
    //   size: 0.5,
    //   height: 0.01,
    //   curveSegments: 12,
    //   bevelEnabled: false,
    // });
    // const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    // const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // textMesh.position.set(item.position_x, item.position_y + item.dimensions_y / 2 + 0.1, item.position_z);
    // textMesh.quaternion.copy(quaternion); // 让文字跟随旋转

    const textSprite = createLabelSprite(
      item.type || 'box',
      new THREE.Vector3(item.position_x, item.position_y + item.dimensions_y / 2 + 0.2, item.position_z),
      quaternion,
      true
    );

    const euler = new THREE.Euler();
    euler.setFromQuaternion(new THREE.Quaternion(item.orientation_x, item.orientation_y, item.orientation_z, item.orientation_w));
    const headingAngle = euler.y * (180 / Math.PI);  

    // 创建航向角箭头
    const arrowLength = 3;
    const direction = new THREE.Vector3(Math.cos(euler.y), 0, Math.sin(euler.y));
    const arrowHelper = new THREE.ArrowHelper(direction, mesh.position, arrowLength, 0xffffff);
    // scene.add(arrowHelper);

     // 创建航向角文字标签
    //  const textGeometry1 = new TextGeometry(`Heading: ${headingAngle.toFixed(2)}°`, {
    //   font: loadedFont,
    //   size: 0.5,
    //   height: 0.01,
    //   curveSegments: 12,
    //   bevelEnabled: false,
    // });
    // const textMaterial1 = new THREE.MeshBasicMaterial({ color: 0xffffff });
    // const arrowTextMesh = new THREE.Mesh(textGeometry1, textMaterial1);

    // arrowTextMesh.position.set(item.position_x, item.position_y + item.dimensions_y / 2 + 0.8, item.position_z);
    // arrowTextMesh.quaternion.copy(mesh.quaternion);

    // 把网格模型添加到场景中
    group.push({mesh: mesh,line: line,textSprite: textSprite, arrowHelper:arrowHelper })
  })
  odAllGroup.list[frame] = group
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


function getRandomHexColor() {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16); // 16777215 是 #ffffff 的十进制表示
  return `#${randomColor.padStart(6, '0')}`; // 确保颜色代码为6位
}

function initpoint(renderObject) {
  for (let key in renderObject) {
    let points = new THREE.Points(renderObject[key].geometry, renderObject[key].material)//将上述对象配置到点模型对象上
    renderObject[key].points = points
    points.frustumCulled = false; // 避免点云被裁剪
    scene.add(points)
  }
}

let renderObject = {}
export const setPointCloud = (lidarDevices, initDisplays) => {
  lidarDevices.forEach((item,index)=>{
    const display = initDisplays.find(it => it.ip === item)
    const colorvalue = display && display.color ? display.color : getRandomHexColor()
    const sizevalue = display && display.size ? display.size : 0.001
    renderObject[item] = {
      geometry: new THREE.BufferGeometry(),
      material:  new THREE.PointsMaterial({
        color: colorvalue,
        size: sizevalue,
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
  if(!attribute) return;
  let name = attribute.name
  let array = attribute.array
  let itemSize = attribute.itemSize

  if (type && renderObject[type]) {
    renderObject[type]['geometry'].setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  } else {
    geometry.setAttribute(name, new THREE.BufferAttribute(array, itemSize))
  }

  // 计算点云的包围盒
  // const boundingBox = new THREE.Box3().setFromObject(renderObject[type]['points']);

  // // 获取包围盒的尺寸
  // const size = boundingBox.getSize(new THREE.Vector3());
  // const width = size.x;  // X 轴上的长度
  // const height = size.y; // Y 轴上的高度
  // const length = size.z; // Z 轴上的长度

  // console.log(`点云${type}的宽度（X 轴）为: ${width} 米`);
  // console.log(`点云${type}的高度（Y 轴）为: ${height} 米`);
  // console.log(`点云${type}的长度（Z 轴）为: ${length} 米`);
}

export const clearGeometry = (type) => {
  if (type && renderObject[type]) {
    renderObject[type]['geometry'].setAttribute("position", new THREE.BufferAttribute(new Float32Array(0), 3))
  }
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
