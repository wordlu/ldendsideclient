import { getLocalStorage } from '@/utils'
import { PointCloud } from '@/three_controls/basic_three/point_cloud'
import { scene } from '@/basic_data/scene_data'
import { useVisualizeStoreWithout } from '@/store/modules/visualize'
import { useCollectStoreWithout } from '@/store/modules/collect'

const visualizeStore = useVisualizeStoreWithout()
const collectStore = useCollectStoreWithout()

// 场景中的点云数组
export let scenePcs: any[] = []

// 场景中每个点云的属性数组,用作统计的列头
export const scenePcFieldInfos: any = []

/**
 * 接收到图像,更新可视化图像
 * @param data
 */
export const setImageData = (data: { bin_data: Uint8Array; data: { device_name: string } }) => {
  // 如果是一帧空的图像不做处理
  if (data.bin_data.byteLength === 0) {
    return
  }
  // 匹配当前选中的摄像头,更新图片url
  if (data.data.device_name === visualizeStore.selCameras[0]) {
    // 创建blob对象,转换成url
    const bd: Uint8Array[] = []
    bd.push(data.bin_data)
    const url = window.URL.createObjectURL(new Blob(bd, { type: 'image/jpeg' }))
    visualizeStore.imageUrl = url
  }
}

// 接收到数据,更新场景中的点云
export const setScenePcDataByProto = (protoPc: any) => {
  // 匹配选中的雷达.如果未选中却有推送,不做处理
  if (visualizeStore.selLidars.indexOf(protoPc.name) < 0) {
    return
  }
  // 找到场景中和当前显示点云同名的点云
  const curPointIdx = scenePcs.findIndex(item => item.name === protoPc.name)
  let curPc
  if (curPointIdx < 0) {
    // 没找到说明是新的点云类型, 创建点云
    curPc = genePointCloud(protoPc)
  } else {
    curPc = scenePcs[curPointIdx]
  }
  curPc.setProtoPoints(protoPc)
}

// 创建点云对象
const genePointCloud = (protoPc: any) => {
  const pcParams = getPcParams()
  // 获取雷达的tf值并赋值给点云
  const tf = collectStore.lidars.find(i => i.name === protoPc.name)?.config?.tf || {}
  pcParams.tf = tf

  const curPc = new PointCloud(protoPc.name, pcParams)
  // 监听fieldsInfo更新事件
  curPc.addListener('pcFieldsInfoUpdated', (fields: any) => {
    scenePcFieldInfos.push({
      name: protoPc.name,
      fieldList: getFieldsInfo(fields.fieldsInfo),
    })
  })
  // 点云添加到点云数组&场景中,并设置点云选择器
  scenePcs.push(curPc)
  scene.add(curPc)
  return curPc
}

// 获取点云对象的属性
const getFieldsInfo = (fields: any) => {
  const fieldList: string[] = []
  for (const key in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, key)) {
      fieldList.push(key)
    }
  }
  return fieldList
}

// 从localStorage里获取点云的默认参数
const getPcParams = () => {
  const settings = getLocalStorage('user_settings')
  if (settings === null) return {}
  const pcParams: any = {}
  if (settings.pointSize !== undefined) pcParams.pointSize = settings.pointSize
  if (!settings.colorProp) {
    pcParams.isFixColor = true
    pcParams.color = settings.color || '#f00'
  } else {
    pcParams.isFixColor = false
    pcParams.colorProp = settings.colorProp
  }
  if (settings.minColorPropVal !== undefined) pcParams.minColorPropVal = settings.minColorPropVal
  if (settings.maxColorPropVal !== undefined) pcParams.maxColorPropVal = settings.maxColorPropVal
  if (settings.autoColorRange !== undefined) pcParams.autoColorRange = settings.autoColorRange
  return pcParams
}

// 删除指定雷达点云
export const deletePc = (name?: string) => {
  const point = scenePcs.find(i => i.name === name)
  scenePcs.find((i, index) => {
    if (i.name === name) {
      scenePcs.splice(index, 1)
      return true
    }
  })
  point && scene.remove(point)
}

// 清空页面中的点云图像
export const clearPcs = () => {
  scenePcs.forEach(point => {
    scene.remove(point)
  })
  scenePcs = []
}

// 删除指定的相机图像
export const deleteImage = (name: string) => {
  visualizeStore.selCameras.find((i, index) => {
    if (i === name) {
      visualizeStore.selCameras.splice(index, 1)
      return true
    }
  })
}

export const addPcToScene = (name?: string) => {
  const point = scenePcs.find(i => i.name === name)
  point && scene.add(point)
}

const updateProps = (target: any, params: any) => {
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      if (target[key] === undefined) continue
      target[key] = params[key]
    }
  }
}

// 改变点云属性
export const changeProps = (params: any, name?: string) => {
  if (name) {
    const target = scenePcs.find(i => i.name === name)
    updateProps(target, params)
  } else {
    scenePcs.forEach(item => {
      updateProps(item, params)
    })
  }
}
/**
 * 更新指定点云的tf参数
 * @param name 点云名称
 * @param prop tf属性
 * @param value tf属性值
 */
export const updatePcTf = (name: string, prop: string, value: number) => {
  const target = scenePcs.find(i => i.name === name)
  target && (target.tf[prop] = value)
}

export const updateColor = (name: string, color: string) => {
  const target = scenePcs.find(i => i.name === name)
  if (target) {
    target.isFixColor = true
    target.color = color
  }
}
