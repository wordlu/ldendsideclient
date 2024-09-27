import * as THREE from 'three'
import { Buffer } from 'buffer'
import { PointCloud as LdPointCloud } from '@/basic_data/proto/point_cloud'
import { ArrowAxes } from '@/three_controls/basic_three/arrow_axes'
import { TinyEmitter } from 'tiny-emitter'
import { isBigEndian, getTypedArray, getBufferVal } from '@/utils/misc'
import { Lut } from 'three/examples/jsm/math/Lut'

// 当通过 protobuf 格式设置数据时, 对于同一个文件或者数据源, 其点云的字段信息应该总是一样的. 为了节省开销, 更新一次字段信息后, 便不会再解析字段信息, 而是直接根据之前的字段信息获取数据. 直到用户手动将字段信息置位无效为止.
interface PcFieldsInfo {
  pointStep: number
  sameEndian: boolean
  isBigEndian: boolean
  fieldsInfo: {
    [fieldName: string]: {
      offset: number
      type: 'u8' | 'i8' | 'u16' | 'i16' | 'u32' | 'i32' | 'f32'
      byteNum: number
    }
  }
}

interface PointInfo {
  x: number
  y: number
  z: number
  [fieldName: string]: any
}

interface EventMap {
  pcFieldsInfoUpdated: (pcFieldsInfo: PcFieldsInfo) => void
}

export class PointCloud extends THREE.Object3D {
  // 点云名称.
  public name: string
  // 点云大小.
  private _pointSize: number
  // 点云颜色属性. 如果不为固定颜色, 会在点云中找对应的属性进行赋色, 如果赋色失败会自动切换到固定颜色.
  private _colorProp: string
  // 是否为固定颜色
  public isFixColor: boolean
  // 策略为 fix 或者其他策略赋色失败时的颜色.
  private _color: any
  // 是否自动计算上色区间, 当策略不为 fix 时, 自动计算颜色的极值并自动赋色
  private _autoColorRange: boolean
  // 颜色的最小值. 颜色属性小于该值时, 颜色不再发生变化
  private _minColorPropVal: number
  // 颜色的最大值. 颜色属性大于该值时, 颜色不再发生变化
  private _maxColorPropVal: number
  // 预留的最大点数. 如果某一帧数据点数大于预留值, 则自动翻倍.
  // 预留值的改变会影响下面所有二进制数组的变化.
  public _reservePointNum: number
  // uint8 数组形式的位置缓冲区, 通过这个属性设置二进制位置信息.
  // 按照 _reservePointNum*12 预分配
  private _posUint8Buffer: Uint8Array
  // 场景中的点云类型
  private _threePc: THREE.Points
  // 如果 colorProp 不为 x,y,z, 则需要额外保存颜色属性. 颜色属性采用预分配模式.
  private _colorArrayBuffer: ArrayBuffer
  // 颜色属性的原始字节数组. 按照 _reservePointNum*4 预分配.
  // 设置时按照 Uint8Array 类型设置, 读取时根据类型读取.
  private _colorUint8Buffer: Uint8Array
  // 有效点数.
  private _pointNum: number
  // 是否显示坐标轴
  private _showAxes: boolean
  // 坐标轴长度
  private _axesLen: number
  // 坐标轴颜色
  private _axesColor: any
  // 默认 tf 参数
  private _defaultTf: {
    x: number
    y: number
    z: number
    roll: number
    pitch: number
    yaw: number
  }
  // tf 参数. 角度制
  private _tf: {
    x: number
    y: number
    z: number
    roll: number
    pitch: number
    yaw: number
  }
  // 场景中的坐标
  private _threeAxes?: ArrowAxes
  // 场景中物体的组. 目前改组中包含 threePc 和 threeAxes.
  private _myPcGroup: THREE.Group
  // 事件分发送器
  private _myEmitter: TinyEmitter
  // protobuf 设置信息时的字段信息
  private _pcFieldsInfo: PcFieldsInfo
  // protobuf 字段信息是否有效, 无效时下一次设置 protobuf 数据时更新字段信息
  public fieldsInfoIsValid: boolean
  // 保留原始的 protobuf 数据
  private _rawProto: LdPointCloud
  // 保留原始的点云颜色, 预分配懒更新模式. 只有用户更改了点云颜色才会保存旧的点云
  private _originColor: THREE.BufferAttribute | THREE.InterleavedBufferAttribute
  // 是否保存了原始的点云, 更新点云时该值置位 false
  private _hasSaveOriginColor: boolean
  // 保存每一个点的唯一标识符, 调用选择相关方法时返回该 id 的集合. id 也为懒创建模式, 如果用户在调用选择相关方法之前没有主动给每一个点设置 id, 则自动回根据点的索引生成 id. 更新点云时 id 自动失效.
  private _pointIds: null | Array<any>
  // _pointIds 可以方便的根据索引查找 id, 但是还需要一个 hash 表方便根据 id 查找索引
  private _pointIdIdxMap: { [id: string | number | symbol]: number } | null

  constructor(
    name: string,
    params: {
      pointSize?: number
      colorProp?: string
      isFixColor: boolean
      color?: any
      autoColorRange?: boolean
      minColorPropVal?: number
      maxColorPropVal?: number
      reservePointNum?: number
      showAxes?: boolean
      axesLen?: number
      axesColor?: any
      tf?: {
        x?: number
        y?: number
        z?: number
        roll?: number
        pitch?: number
        yaw?: number
      }
    }
  ) {
    super()
    // 保存设置选项
    this.name = name
    this._pointSize = params.pointSize !== undefined ? params.pointSize : 0.005
    this._colorProp = params.colorProp !== undefined ? params.colorProp : 'fix'
    this.isFixColor = params.isFixColor !== undefined ? params.isFixColor : true
    this._color = params.color !== undefined ? params.color : '#ff0000'
    this._autoColorRange = params.autoColorRange !== undefined ? params.autoColorRange : true
    this._minColorPropVal = params.minColorPropVal !== undefined ? params.minColorPropVal : 0
    this._maxColorPropVal = params.maxColorPropVal !== undefined ? params.maxColorPropVal : 100
    this._reservePointNum = params.reservePointNum !== undefined ? params.reservePointNum : 5e5
    this._showAxes = params.showAxes !== undefined ? params.showAxes : false
    this._axesLen = params.axesLen !== undefined ? params.axesLen : 2
    this._axesColor = params.axesColor !== undefined ? params.axesColor : this._color
    this._defaultTf = { x: 0, y: 0, z: 0, roll: 0, pitch: 0, yaw: 0 }
    const tf = params.tf !== undefined ? { ...this._defaultTf, ...params.tf } : this._defaultTf
    // 事实上有些私有属性在 _preallocate() 中初始化了, 但是不在构造函数中初始化的话, typyscript 检查会报错
    this._posUint8Buffer = new Uint8Array()
    this._colorArrayBuffer = new ArrayBuffer(1)
    this._colorUint8Buffer = new Uint8Array(this._colorArrayBuffer)
    this._pointNum = 0
    this._hasSaveOriginColor = false
    this._pointIds = null
    this._pointIdIdxMap = null
    // 生成场景点云
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.PointsMaterial({
      size: this._pointSize,
      vertexColors: true,
    })
    this._threePc = new THREE.Points(geometry, material)
    // 预分配场景中点的位置, 颜色
    this._preallocate()
    // 创建组, 并将点云添加到组中
    this._myPcGroup = new THREE.Group()
    this._myPcGroup.add(this._threePc)
    // 如果显示坐标轴, 则创建并添加到组中
    this.showAxes = this._showAxes

    this.add(this._myPcGroup)

    // 定义响应式的 tf 参数
    const self = this // eslint-disable-line
    this._tf = new Proxy(tf, {
      get(target, p): number {
        return target[p as keyof typeof target]
      },
      set(target, p, newValue: number): boolean {
        target[p as keyof typeof target] = newValue
        self._applyTf(target)
        return true
      },
    })

    // 事件分发器
    this._myEmitter = new TinyEmitter()
    // 初始化 protobuf 相关字段
    this._pcFieldsInfo = {
      pointStep: 0,
      sameEndian: false,
      isBigEndian: false,
      fieldsInfo: {},
    }
    this.fieldsInfoIsValid = false
    this._rawProto = {
      name: '',
      timestamp: 0n,
      fields: '',
      types: '',
      shape: '',
      isBigendian: false,
      data: new Uint8Array(),
    }
    this._applyTf(this._tf)
  }

  /**
   * 根据 _reservePointNum 的值预分配数组.
   */
  private _preallocate() {
    // 预分配场景中点的位置
    const positionBuffer = new ArrayBuffer(this._reservePointNum * 3 * 4)
    this._posUint8Buffer = new Uint8Array(positionBuffer)
    const positions = new Float32Array(positionBuffer)
    this._threePc.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    // 预分配场景中的颜色
    const colors = new Float32Array(this._reservePointNum * 3)
    this._threePc.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    // 预分配场景中的原始颜色
    const originColors = new Float32Array(this._reservePointNum * 3)
    this._originColor = new THREE.BufferAttribute(originColors, 3)
    // 预分配颜色属性, 注意用来显示颜色的属性字段不能 4 字节以上.
    this._colorArrayBuffer = new ArrayBuffer(this._reservePointNum * 4)
    this._colorUint8Buffer = new Uint8Array(this._colorArrayBuffer)
  }

  /**
   * 根据指定的最小点数, 对预分配数组进行扩容. 每次扩张 2 倍, 直到满足需求为止.
   * 如果满足最小点数, 则不会进行任何操作.
   */
  expansionReservedData(pointNum: number) {
    if (this._reservePointNum >= pointNum) {
      return
    }
    if (this._reservePointNum < 1) {
      this._reservePointNum = 1
    }
    while (this._reservePointNum < pointNum) {
      this._reservePointNum *= 2
    }
    this._preallocate()
    console.log(
      `Reserved data expanded. reservePointNum: ${this._reservePointNum}, point num: ${pointNum}`
    )
  }

  get reservePointNum(): number {
    return this._reservePointNum
  }

  get pointSize(): number {
    return this._pointSize
  }
  set pointSize(newVal: number) {
    ;(this._threePc.material as THREE.PointsMaterial).size = newVal
    this._pointSize = newVal
  }

  get showAxes(): boolean {
    return this._showAxes
  }
  set showAxes(newVal: boolean) {
    this._showAxes = newVal
    if (this._showAxes) {
      this._threeAxes = new ArrowAxes(this._axesLen, this._axesColor)
      this._myPcGroup.add(this._threeAxes)
    } else if (this._threeAxes) {
      this._myPcGroup.remove(this._threeAxes)
    }
  }

  get axesColor() {
    return this._axesColor
  }
  set axesColor(newVal: any) {
    this._axesColor = newVal
    this.showAxes = this._showAxes
  }

  // 响应颜色属性
  get colorProp(): string {
    return this._colorProp
  }
  set colorProp(newVal: any) {
    if (newVal) {
      this._colorProp = newVal
      this.isFixColor = false
    } else {
      this._colorProp = ''
      this.isFixColor = true
    }
    this._colorProp = newVal
    this.updateColor()
  }

  // 响应固定颜色值
  get color(): string {
    return this._color
  }
  set color(newVal: string) {
    this._color = newVal
    this.updateColor()
  }

  // 响应颜色范围变化
  get minColorPropVal(): number {
    return this._minColorPropVal
  }
  set minColorPropVal(newVal: number) {
    this._minColorPropVal = newVal
    this.updateColor()
  }
  get maxColorPropVal(): number {
    return this._maxColorPropVal
  }
  set maxColorPropVal(newVal: number) {
    this._maxColorPropVal = newVal
    this.updateColor()
  }
  get autoColorRange(): boolean {
    return this._autoColorRange
  }
  set autoColorRange(newVal: boolean) {
    this._autoColorRange = newVal
    this.updateColor()
  }

  /**
   * 根据 tf 参数设置位置和旋转角度. 角度为角度制.
   */
  private _applyTf(tf: {
    x: number
    y: number
    z: number
    roll: number
    pitch: number
    yaw: number
  }) {
    this._myPcGroup.setRotationFromEuler(
      new THREE.Euler(
        THREE.MathUtils.degToRad(tf.roll),
        THREE.MathUtils.degToRad(tf.pitch),
        THREE.MathUtils.degToRad(tf.yaw)
      )
    )
    this._myPcGroup.position.copy(new THREE.Vector3(tf.x, tf.y, tf.z))
  }

  get tf() {
    return this._tf
  }
  set tf(
    tf: Partial<{
      x: number
      y: number
      z: number
      roll: number
      pitch: number
      yaw: number
    }>
  ) {
    const newTf = { ...this._defaultTf, ...tf }
    this._applyTf(newTf)
  }

  get pointIds() {
    return this._pointIds
  }
  set pointIds(newVal: null | Array<any>) {
    if (newVal !== null && newVal.length < this._pointNum) {
      console.error(`set point ids error. Ids length to short.`)
    }
    this._pointIds = newVal
    if (this._pointIds !== null) {
      this._pointIdIdxMap = {}
      this._pointIds.forEach((value, index) => {
        this._pointIdIdxMap![value] = index
      })
    } else {
      this._pointIdIdxMap = null
    }
  }

  addListener<E extends keyof EventMap>(event: E, cb: EventMap[E]) {
    this._myEmitter.on(event, cb)
  }

  removeListener<E extends keyof EventMap>(event: E, cb: EventMap[E]) {
    this._myEmitter.off(event, cb)
  }

  get pcFieldsInfo(): PcFieldsInfo {
    return this._pcFieldsInfo
  }

  get pointNum(): number {
    return this._pointNum
  }

  /**
   * 根据 protobuf 类型点云设置数据.
   */
  setProtoPoints(pc: LdPointCloud) {
    // 保存原始数据
    this._rawProto = pc
    // 计算点的数量
    const shape = pc.shape.split(',').map(item => parseInt(item))
    this._pointNum = shape.reduce((a, b) => a * b, 1)
    // 判断是否需要扩容
    this.expansionReservedData(this._pointNum)
    if (!this.fieldsInfoIsValid) {
      // 需要更新点云字段信息
      this._updateFieldsInfo(pc)
    }
    // 设置位置
    this._setThreePosByProto(pc)
    // 更新颜色
    this.updateColor()

    this._threePc.geometry.setDrawRange(0, this._pointNum)
    this._threePc.geometry.computeBoundingBox()
    this._threePc.geometry.computeBoundingSphere()

    // 复位点云状态
    this._resetPcStatus()
  }

  /**
   * 更新点云的字段信息.
   */
  private _updateFieldsInfo(pc: LdPointCloud) {
    this._pcFieldsInfo.sameEndian = isBigEndian === pc.isBigendian
    this._pcFieldsInfo.isBigEndian = pc.isBigendian
    const fields = pc.fields.split(',')
    const types = pc.types.split(',')
    let offset = 0
    this._pcFieldsInfo.fieldsInfo = {}
    for (let i = 0; i < fields.length; ++i) {
      const curByteNum = parseInt(types[i].slice(1)) / 8
      this._pcFieldsInfo.fieldsInfo[fields[i]] = {
        offset: offset,
        type: types[i] as any,
        byteNum: curByteNum,
      }
      offset += curByteNum
    }
    this._pcFieldsInfo.pointStep = offset
    this.fieldsInfoIsValid = true
    // 如果没有找到 x,y,z 字段给出错误警告
    const validField = ['x', 'y', 'z'].every(ele => {
      return this._pcFieldsInfo.fieldsInfo[ele] !== undefined
    })
    if (!validField) {
      throw Error(`x,y,z field must exist. Current fields:\n ${this._pcFieldsInfo}`)
    }

    this._myEmitter.emit('pcFieldsInfoUpdated', this._pcFieldsInfo)
  }

  /**
   * 根据 protobuf 中的信息更新位置信息.
   */
  private _setThreePosByProto(pc: LdPointCloud) {
    let posArrIdx = 0
    const fi = this._pcFieldsInfo.fieldsInfo
    const ps = this._pcFieldsInfo.pointStep
    for (let i = 0; i < this._pointNum; ++i) {
      if (this._pcFieldsInfo.sameEndian) {
        // 相同大小端, 直接拷贝 x,y,z 数据
        // 拷贝 x 字节
        for (let j = 0; j < fi.x.byteNum; ++j) {
          this._posUint8Buffer[posArrIdx++] = pc.data[ps * i + fi.x.offset + j]
        }
        // 拷贝 y 字节
        for (let j = 0; j < fi.y.byteNum; ++j) {
          this._posUint8Buffer[posArrIdx++] = pc.data[ps * i + fi.y.offset + j]
        }
        // 拷贝 z 字节
        for (let j = 0; j < fi.z.byteNum; ++j) {
          this._posUint8Buffer[posArrIdx++] = pc.data[ps * i + fi.z.offset + j]
        }
      } else {
        // 不同大小端, x,y,z 需要做字节翻转
        // 拷贝 x 字节
        for (let j = fi.x.byteNum - 1; j >= 0; --j) {
          this._posUint8Buffer[posArrIdx++] = pc.data[ps * i + fi.x.offset + j]
        }
        // 拷贝 y 字节
        for (let j = fi.y.byteNum - 1; j >= 0; --j) {
          this._posUint8Buffer[posArrIdx++] = pc.data[ps * i + fi.y.offset + j]
        }
        // 拷贝 z 字节
        for (let j = fi.z.byteNum - 1; j >= 0; --j) {
          this._posUint8Buffer[posArrIdx++] = pc.data[ps * i + fi.z.offset + j]
        }
      }
    }
    this._threePc.geometry.attributes.position.needsUpdate = true
  }

  /**
   * 根据 protobuf 中的信息更新颜色.
   */
  private _setColorByProto(pc: LdPointCloud) {
    // 固定颜色无需进行任何处理
    if (this.isFixColor) {
      return
    }
    const isPosColor = ['x', 'y', 'z'].some(ele => {
      return this.colorProp === ele
    })
    // 根据位置参数赋色也无需进行任何处理
    if (isPosColor) {
      return
    }
    const colorPropInfo = this._pcFieldsInfo.fieldsInfo[this.colorProp]
    // 如果指定的颜色属性不存在, 也不进行任何处理
    if (colorPropInfo == undefined) {
      return
    }
    // 复制颜色属性到 _colorUint8Buffer
    let colorArrIdx = 0
    const ps = this._pcFieldsInfo.pointStep
    for (let i = 0; i < this._pointNum; ++i) {
      if (this._pcFieldsInfo.sameEndian) {
        // 相同大小端, 直接拷贝数据
        for (let j = 0; j < colorPropInfo.byteNum; ++j) {
          this._colorUint8Buffer[colorArrIdx++] = pc.data[ps * i + colorPropInfo.offset + j]
        }
      } else {
        // 不同大小端需要做字节翻转
        for (let j = colorPropInfo.byteNum - 1; j >= 0; --j) {
          this._colorUint8Buffer[colorArrIdx++] = pc.data[ps * i + colorPropInfo.offset + j]
        }
      }
    }
  }

  /**
   * 当点云更新后, 需要复位一些信息, 如原始点云颜色, 点云 id 等.
   */
  private _resetPcStatus() {
    this._hasSaveOriginColor = false
    this._pointIds = null
    this._pointIdIdxMap = null
  }

  /**
   * 根据颜色属性和策略更新点云颜色, 当用户修改颜色信息之后, 需要手动调用该函数更新颜色.
   * 调用后取消局部修改的操作.
   */
  public updateColor() {
    // 定义使用固定颜色函数
    const useFixColor = () => {
      const fixThreeColor = new THREE.Color(this._color)
      const geoColor = this._threePc.geometry.attributes.color
      for (let i = 0; i < this._pointNum; ++i) {
        geoColor.setXYZ(i, fixThreeColor.r, fixThreeColor.g, fixThreeColor.b)
      }
      geoColor.needsUpdate = true
    }
    // 固定颜色
    if (this.isFixColor) {
      useFixColor()
      return
    }
    // 如果指定的颜色属性不存在, 也使用固定颜色
    const colorPropInfo = this._pcFieldsInfo.fieldsInfo[this.colorProp]
    if (colorPropInfo === undefined) {
      console.warn(`Bad color policy. Property ${this.colorProp} doen not exist.`)
      useFixColor()
      return
    }
    // 如果自定义颜色值范围, 且最大值和最小值太近也使用固定颜色
    let colorMinVal = this._minColorPropVal
    let colorMaxVal = this._maxColorPropVal
    // 定义颜色区间是否有效函数, 无效时按固定颜色处理
    const isValidRange = (): boolean => {
      const isValid = colorMinVal < colorMaxVal - 0.01
      if (!isValid) {
        console.warn(`Bad color range: (${colorMinVal}, ${colorMaxVal}). Use fix color.`)
        useFixColor()
      }
      return isValid
    }
    if (!this._autoColorRange && !isValidRange()) {
      return
    }
    // 是否根据位置信息赋色
    let posOffset = -1
    const isPosColor = ['x', 'y', 'z'].some((val, idx) => {
      if (this.colorProp === val) {
        posOffset = idx
        return true
      }
      return false
    })
    const lut = new Lut('rainbow', 1024)
    const geoColor = this._threePc.geometry.attributes.color
    if (isPosColor) {
      const geoPos = this._threePc.geometry.attributes.position
      // 定义位置赋色函数
      const colorByPos = () => {
        lut.setMin(colorMinVal)
        lut.setMax(colorMaxVal)
        for (let i = 0; i < this._pointNum; ++i) {
          const curColor = lut.getColor(geoPos.array[3 * i + posOffset])
          curColor && geoColor.setXYZ(i, curColor.r, curColor.g, curColor.b)
        }
        geoColor.needsUpdate = true
      }
      if (!this._autoColorRange) {
        // 固定区间直接赋值颜色
        colorByPos()
        return
      }
      // 自动区间先获取最大值和最小值
      colorMinVal = Number.MAX_VALUE
      colorMaxVal = -Number.MAX_VALUE
      for (let i = 0; i < this._pointNum; ++i) {
        if (geoPos.array[3 * i + posOffset] < colorMinVal) {
          colorMinVal = geoPos.array[3 * i + posOffset]
        }
        if (geoPos.array[3 * i + posOffset] > colorMaxVal) {
          colorMaxVal = geoPos.array[3 * i + posOffset]
        }
      }
      // 赋值颜色
      if (isValidRange()) {
        colorByPos()
      }
      return
    }
    // 根据非位置属性赋值, 先将属性拷贝到颜色属性中
    this._setColorByProto(this._rawProto)
    const colorValArr = getTypedArray(this._colorArrayBuffer, colorPropInfo.type)
    // 定义非位置属性赋值函数
    const colorByOtherProp = () => {
      lut.setMin(colorMinVal)
      lut.setMax(colorMaxVal)
      for (let i = 0; i < this._pointNum; ++i) {
        const curColor = lut.getColor(colorValArr[i])
        geoColor.setXYZ(i, curColor.r, curColor.g, curColor.b)
      }
      geoColor.needsUpdate = true
    }
    if (!this._autoColorRange) {
      // 固定区间直接赋值颜色
      colorByOtherProp()
      return
    }
    // 自动区间先获取最大值和最小值
    colorMinVal = Number.MAX_VALUE
    colorMaxVal = -Number.MAX_VALUE
    for (let i = 0; i < this._pointNum; ++i) {
      if (colorValArr[i] < colorMinVal) {
        colorMinVal = colorValArr[i]
      }
      if (colorValArr[i] > colorMaxVal) {
        colorMaxVal = colorValArr[i]
      }
    }
    // 赋值颜色
    if (isValidRange()) {
      colorByOtherProp()
    }
  }

  private _generateDefaultPointIds() {
    //  如果没有 id 则先根据索引生成 id
    if (this._pointIds === null) {
      this._pointIds = [...Array(this._pointNum).keys()]
      this._pointIdIdxMap = {}
      this._pointIds.forEach((value, index) => {
        this._pointIdIdxMap![value] = index
      })
    }
  }

  /**
   * 根据四棱锥体获取所有在四棱锥体内的点的ids.
   */
  getFrustumPointIds(frus: THREE.Frustum): Set<any> {
    //  如果没有 id 则先根据索引生成 id
    this._generateDefaultPointIds()
    const ret = new Set()
    const geoPos = this._threePc.geometry.attributes.position
    const curPoint = new THREE.Vector3()
    for (let i = 0; i < this._pointNum; ++i) {
      curPoint.set(geoPos.getX(i), geoPos.getY(i), geoPos.getZ(i))
      curPoint.applyMatrix4(this._threePc.matrixWorld)
      if (frus.containsPoint(curPoint)) {
        ret.add(this._pointIds![i])
      }
    }
    return ret
  }

  /**
   * 根据点的 id 获取点的详细信息.
   * @param pointIds 点的 id 列表, 如果没有点云没有设置 id 会根据索引自动生成 id.
   */
  getPointsByIds(pointIds: Set<any>): Array<PointInfo> {
    //  如果没有 id 则先根据索引生成 id
    this._generateDefaultPointIds()
    const ret: Array<PointInfo> = []

    const { pointStep, fieldsInfo, isBigEndian } = this._pcFieldsInfo
    const buf = Buffer.from(this._rawProto.data)

    pointIds.forEach(value => {
      const pointInfo = {} as PointInfo
      // 根据 id 获取索引
      const pIdx = this._pointIdIdxMap![value]
      // 索引不存在则返回 null 否则获取对应的点信息
      if (pIdx === undefined) return null
      for (const [key, value] of Object.entries(fieldsInfo)) {
        pointInfo[key] = getBufferVal(buf, pIdx * pointStep + value.offset, value.type, isBigEndian)
      }

      if (pointInfo !== null) {
        ret.push(pointInfo)
      }
    })
    return ret
  }

  /**
   * 根据索引获取点的信息.
   * @param pointIdx 点的索引.
   * @returns 点的属性. 如果索引超出点数则返回 null.
   */
  getPointsByIdx(pointIdx: number): PointInfo | null {
    if (pointIdx >= this._pointNum) {
      return null
    }
    const pointStep = this._pcFieldsInfo.pointStep
    const ret = {} as PointInfo
    const buf = Buffer.from(this._rawProto.data)
    for (const [key, value] of Object.entries(this._pcFieldsInfo.fieldsInfo)) {
      ret[key] = getBufferVal(
        buf,
        pointIdx * pointStep + value.offset,
        value.type,
        this._pcFieldsInfo.isBigEndian
      )
    }
    return ret
  }

  /**
   * 保存原始的点云颜色信息.
   */
  private _saveOriginColors() {
    if (this._hasSaveOriginColor) return
    const geoColor = this._threePc.geometry.attributes.color
    for (let i = 0; i < this._pointNum; ++i) {
      this._originColor.setXYZ(i, geoColor.getX(i), geoColor.getY(i), geoColor.getZ(i))
    }
    this._hasSaveOriginColor = true
  }

  /**
   * 根据 id 集合对点云进行高亮.
   * @param pointIds 点的 id 集合.
   * @param value 将 HSL 模型中的 L 进行偏移的量. 取值 (-1,1).
   */
  highLightByIds(pointIds: Set<any>, offset = 0.4) {
    //  如果没有 id 则先根据索引生成 id
    this._generateDefaultPointIds()
    // 如果没有保存原始点云先保存原始点云
    this._saveOriginColors()
    const curColor = new THREE.Color()
    const geoColor = this._threePc.geometry.attributes.color
    pointIds.forEach(value => {
      const pIdx = this._pointIdIdxMap![value]
      if (pIdx !== undefined) {
        curColor.r = this._originColor.getX(pIdx)
        curColor.g = this._originColor.getY(pIdx)
        curColor.b = this._originColor.getZ(pIdx)
        curColor.offsetHSL(0, 0, offset)
        geoColor.setXYZ(pIdx, curColor.r, curColor.g, curColor.b)
      }
    })
    geoColor.needsUpdate = true
  }

  /**
   * 根据 id 集合对点云颜色进行修改.
   * @param pointIds 点的 id 集合.
   * @param newColor 设置的颜色.
   */
  setColorByIds(pointIds: Set<any>, newColor: THREE.ColorRepresentation) {
    //  如果没有 id 则先根据索引生成 id
    this._generateDefaultPointIds()
    // 如果没有保存原始点云先保存原始点云
    this._saveOriginColors()
    const curColor = new THREE.Color(newColor)
    const geoColor = this._threePc.geometry.attributes.color
    pointIds.forEach(value => {
      const pIdx = this._pointIdIdxMap![value]
      if (pIdx !== undefined) {
        geoColor.setXYZ(pIdx, curColor.r, curColor.g, curColor.b)
      }
    })
    geoColor.needsUpdate = true
  }

  /**
   * 根据指定点的 id 集合复位点的颜色.
   * @param pointIds 需要复位的点的 id 集合.
   * @param resetAll 是否需要全部复位. 全部复位时忽略 pointIds 参数.
   */
  resetColorByIds(pointIds: Set<any>, resetAll = false) {
    // 没有保存原始点云颜色说明之前并未进行任何颜色修改, 直接返回
    if (!this._hasSaveOriginColor) {
      return
    }
    //  如果没有 id 则先根据索引生成 id
    this._generateDefaultPointIds()
    const geoColor = this._threePc.geometry.attributes.color
    // 复位所有
    if (resetAll) {
      for (let i = 0; i < this._pointNum; ++i) {
        geoColor.setXYZ(
          i,
          this._originColor.getX(i),
          this._originColor.getY(i),
          this._originColor.getZ(i)
        )
      }
      geoColor.needsUpdate = true
      return
    }

    // 复位指定 id 集合
    pointIds.forEach(value => {
      const pIdx = this._pointIdIdxMap![value]
      if (pIdx !== undefined) {
        geoColor.setXYZ(
          pIdx,
          this._originColor.getX(pIdx),
          this._originColor.getY(pIdx),
          this._originColor.getZ(pIdx)
        )
      }
    })
    geoColor.needsUpdate = true
  }

  /**
   * 根据属性获取指定范围的点的ids
   * @param prop 属性名
   * @param minVal 最小值
   * @param maxVal 最大值
   */
  getPointIdsByPropRange(prop: string, minVal: number, maxVal: number): Set<any> {
    // prop not exist 如果属性不存在时,返回空集合
    if (this._pcFieldsInfo.fieldsInfo[prop] === undefined) return new Set()

    //  如果没有 id 则先根据索引生成 id
    this._generateDefaultPointIds()

    // positon prop: xyz 如果是xyz属性,使用position查找
    if (['x', 'y', 'z'].indexOf(prop) > -1) {
      return this.getPointIdsByPosRange(prop, minVal, maxVal)
    }
    // other prop
    const propVals = this.getPropValues(prop)
    const ret = new Set()
    for (let i = 0; i < this._pointNum; ++i) {
      if (propVals[i] >= minVal && propVals[i] <= maxVal) {
        ret.add(this._pointIds![i])
      }
    }
    return ret
  }

  /**
   * 获取在矩形框内的点
   * @param aabbs 矩形框信息
   * @returns
   */
  getPointIdsByAabbs(
    aabbs: Array<{
      xMin: number
      xMax: number
      yMin: number
      yMax: number
      zMin: number
      zMax: number
      statistics: boolean
    }>
  ): Array<any> {
    //  如果没有 id 则先根据索引生成 id
    this._generateDefaultPointIds()
    const ret = new Set()
    const tempV3 = new THREE.Vector3()

    for (let i = 0; i < this._pointNum; ++i) {
      tempV3.fromBufferAttribute(this._threePc.geometry.attributes.position, i)
      tempV3.applyMatrix4(this.matrixWorld)
      aabbs.some(aabb => {
        let isInBox = false
        if (
          tempV3.x >= aabb.xMin &&
          tempV3.x <= aabb.xMax &&
          tempV3.y >= aabb.yMin &&
          tempV3.y <= aabb.yMax &&
          tempV3.z >= aabb.zMin &&
          tempV3.z <= aabb.zMax
        ) {
          isInBox = true
        }
        if (isInBox) {
          if (aabb.statistics) {
            ret.add(this._pointIds![i])
          }
          return true
        }
      })
    }
    // return ret
    return this.getPointsByIds(ret)
  }

  /**
   * 根据属性获取全部属性值
   * @param prop 属性名称
   * @returns 属性值集合
   */
  getPropValues(prop: string): Array<number> | null {
    const propTarget = this._pcFieldsInfo.fieldsInfo[prop]
    if (!propTarget) return null
    const pointStep = this._pcFieldsInfo.pointStep
    const ret = []
    const buf = Buffer.from(this._rawProto.data)
    const { offset, type } = propTarget
    for (let i = 0; i < this._pointNum; ++i) {
      ret.push(getBufferVal(buf, i * pointStep + offset, type, this._pcFieldsInfo.isBigEndian))
    }
    return ret
  }

  /**
   * 根据位置属性 xyz 的范围获取点的ids.
   * @param {Number} minVal z 最小值.
   * @param {Number} maxVal z 最大值.
   */
  getPointIdsByPosRange(prop: string, minVal: number, maxVal: number) {
    const newSelSet: Set<number> = new Set()
    const tempV3 = new THREE.Vector3()
    for (let index = 0; index < this._pointNum; index++) {
      tempV3.fromBufferAttribute(this._threePc.geometry.attributes.position, index)
      tempV3.applyMatrix4(this._threePc.matrixWorld)
      if (
        tempV3[prop as keyof typeof tempV3] >= minVal &&
        tempV3[prop as keyof typeof tempV3] <= maxVal
      ) {
        newSelSet.add(index)
      }
    }
    return newSelSet
  }

  /**
   * 获取当前点的xyz值
   */
  getPointXYZ(pointIdx: number) {
    const x = this._threePc.geometry.attributes.position.getX(pointIdx)
    const y = this._threePc.geometry.attributes.position.getY(pointIdx)
    const z = this._threePc.geometry.attributes.position.getZ(pointIdx)
    return { x, y, z }
  }

  /**
   * 获取 x,y,z,intensity 形式的点云数据. 如果没有强度, 返回强度值为0. 如果未设置数据返回 null.
   */
  getPointData(): null | Array<Array<number>> {
    if (this.pointNum == 0) {
      return null
    }
    const data: any[] = []
    const { fieldsInfo, pointStep, isBigEndian } = this._pcFieldsInfo
    if (!fieldsInfo) return null
    let ret = []
    const buf = Buffer.from(this._rawProto.data)
    let keys: string[] = []
    try {
      keys = Object.keys(fieldsInfo)
      data.push(keys)
    } catch (e) {
      console.log(e)
    }
    let offset = 0,
      type = null
    for (let i = 0; i < this._pointNum; ++i) {
      for (let j = 0; j < keys.length; j++) {
        offset = fieldsInfo[keys[j]].offset
        type = fieldsInfo[keys[j]].type
        ret.push(getBufferVal(buf, i * pointStep + offset, type, isBigEndian).toFixed(3) * 1)
      }
      data.push(ret)
      ret = []
    }
    return data
  }
}
