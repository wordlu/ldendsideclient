import { PerspectiveCamera, WebGLRenderer } from 'three'
import emitter from 'tiny-emitter/instance'
import SelectionHelper from './selection_helper'
import PointCloudBoxSelection from './selection_box'
import { PointCloud } from '../basic_three/point_cloud'

interface EventMap {
  selectChange: () => void
}

/**
 * 对点云选择类的最终封装. 选中的点云会进行颜色高亮(提高饱和度).
 * 因此原始点云的颜色最好不要太亮, 否则选择出来不太明显.
 */
export class PointCloudSelector {
  // 基础场景相关对象
  public camera: PerspectiveCamera
  public renderer: WebGLRenderer
  public mainCanvas: HTMLElement
  public pc: PointCloud
  // css类名,为了设置样式
  public cssText: string
  // 选择模式:交集并集减去
  public selMode: string
  // 当前选择的点的索引
  public selIdx: Set<any>

  private pcBoxSel
  private helper
  private enabled
  private emitter

  private boundClickDown
  // private boundPointerMove
  private boundPointerUp

  /**
   * 框选后返回被选择点的索引. pc 初始化时可以设置为空. 但是在使用前必须设置.
   *
   * @param {THREE.camera} camera 相机
   * @param {THREE.Renderer} renderer 渲染器
   * @param {HTMLElement} mainCanvas 主画布.鼠标的移动和点击时获取的坐标都是相对于这个元素.
   * @param {MyPointCloud} pc 待选取的点云.
   * @param {string} cssText 选择框的 CSS 样式
   */
  constructor(
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    mainCanvas: HTMLElement,
    pc?: PointCloud | null,
    cssText?: string
  ) {
    this.camera = camera
    this.renderer = renderer
    this.mainCanvas = mainCanvas
    pc && (this.pc = pc)
    this.cssText = cssText || ''
    this.selMode = 'union' // 模型选择模式为并集模式
    this.selIdx = new Set() // 当前选择的点的索引
    this.pcBoxSel = new PointCloudBoxSelection(this.camera, null)
    this.helper = new SelectionHelper(this, this.renderer, this.cssText)

    // 下面这个绑定参考: https://stackoverflow.com/questions/30446622/es6-class-access-to-this-with-addeventlistener-applied-on-method
    this.boundClickDown = (event: PointerEvent) => this.clickDown(event)
    // this.boundPointerMove = (event: Event) => this.pointerMove(event)
    this.boundPointerUp = (event: PointerEvent) => this.pointerUp(event)

    this.mainCanvas.addEventListener('pointerdown', this.boundClickDown)
    // this.mainCanvas.addEventListener('pointermove', this.boundPointerMove)
    this.mainCanvas.addEventListener('pointerup', this.boundPointerUp)
    this.enabled = true

    // 事件分发器, 当选择有更新时, 会触发 selectChange 事件.
    this.emitter = emitter
  }

  addListener<E extends keyof EventMap>(event: E, cb: EventMap[E]) {
    this.emitter.on(event, cb)
  }

  removeListener<E extends keyof EventMap>(event: E, cb: EventMap[E]) {
    this.emitter.off(event, cb)
  }

  setPc(pc: PointCloud) {
    this.selIdx = new Set()
    this.pc = pc
    this.pcBoxSel.setPc(pc)
  }

  /**
   * 设置失能或使能选区工具.
   * @param {bool} newVal 新状态值.
   */
  setEnable(newVal: boolean) {
    if (newVal) {
      this.mainCanvas.addEventListener('pointerdown', this.boundClickDown)
      // this.mainCanvas.addEventListener('pointermove', this.boundPointerMove)
      this.mainCanvas.addEventListener('pointerup', this.boundPointerUp)
      this.enabled = true
    } else {
      this.mainCanvas.removeEventListener('pointerdown', this.boundClickDown)
      // this.mainCanvas.removeEventListener('pointermove', this.boundPointerMove)
      this.mainCanvas.removeEventListener('pointerup', this.boundPointerUp)
      this.enabled = false
    }
  }

  /**
   * 反转选区
   */
  invertSelection(): Set<any> | null {
    if (!this.pc) return null
    const newSelSet = new Set()
    for (let i = 0; i < this.pc.pointNum; i++) {
      if (!this.selIdx.has(i)) {
        newSelSet.add(i)
      }
    }
    this.pc.resetColorByIds(this.selIdx)
    this.selIdx = newSelSet
    this.updateColor()
    return newSelSet
  }

  /** 清空选区 */
  clearSelection() {
    if (!this.pc) return
    this.selIdx = new Set()
    this.pc.resetColorByIds(new Set(), true)
  }

  /**
   * @param {string}} mode 选择的模式,取值可以为 union(并集), intersection(交集), difference(补集)
   */
  setMode(mode: string) {
    this.selMode = mode
  }

  /* 鼠标按下, 私有函数 */
  clickDown(event: PointerEvent) {
    this.pcBoxSel.startPoint.set(
      (event.offsetX / this.mainCanvas.clientWidth) * 2 - 1,
      -(event.offsetY / this.mainCanvas.clientHeight) * 2 + 1,
      0.5
    )
  }

  /* 鼠标移动, 私有函数 */
  // pointerMove(event: Event) {
  //   if (this.helper.isDown) {
  //     // 如果框选时, 实时渲染的话, 太卡了.
  //     // this.pcBoxSel.endPoint.set((event.offsetX / this.mainCanvas.clientWidth) * 2 - 1,
  //     // -(event.offsetY / this.mainCanvas.clientHeight) * 2 + 1,
  //     // 0.5)
  //     // const newSelSet = this.pcBoxSel.select()
  //     // this.updateSelection(event)
  //   }
  // }

  /** 鼠标弹起, 私有函数 */
  pointerUp(event: PointerEvent) {
    if (!this.pc) return
    this.pcBoxSel.endPoint.set(
      (event.offsetX / this.mainCanvas.clientWidth) * 2 - 1,
      -(event.offsetY / this.mainCanvas.clientHeight) * 2 + 1,
      0.5
    )
    const frustum = this.pcBoxSel.generateFrustum()
    const selectPointIds = this.pc.getFrustumPointIds(frustum)
    this.updateSelection(selectPointIds)
  }

  /**
   * 根据位置属性 xyz 的范围更新选取.
   * @param {string} prop 属性名
   * @param {Number} minVal  最小值.
   * @param {Number} maxVal  最大值.
   */
  selectByPosRange(prop: string, minZ: number, maxZ: number) {
    if (!this.pc) return
    const newSelSet = this.pc.getPointIdsByPropRange(prop, minZ, maxZ)
    this.updateSelection(newSelSet)
  }

  /**
   * 获取选择点的 AABB 参数
   *
   * @return 如果没有选择任何点, 返回 null, 否则返回 {x,y,z,lx,ly,lz,xMin,xMax,yMin,yMax,zMin,zMax} 对象.
   */
  getSelectedAabb() {
    if (this.selIdx.size === 0 || !this.pc) {
      return null
    }
    let xMin = Number.MAX_VALUE
    let xMax = -Number.MAX_VALUE
    let yMin = Number.MAX_VALUE
    let yMax = -Number.MAX_VALUE
    let zMin = Number.MAX_VALUE
    let zMax = -Number.MAX_VALUE
    for (const item of this.selIdx) {
      // 如果确定点云本身没有任何旋转平移, 直接获取即可, 否则需要参考 selectByRangeZ() 函数修改代码
      const { x, y, z } = this.pc.getPointXYZ(item)
      if (x < xMin) {
        xMin = x
      }
      if (x > xMax) {
        xMax = x
      }
      if (y < yMin) {
        yMin = y
      }
      if (y > yMax) {
        yMax = y
      }
      if (z < zMin) {
        zMin = z
      }
      if (z > zMax) {
        zMax = z
      }
    }
    return {
      x: (xMax + xMin) / 2,
      y: (yMax + yMin) / 2,
      z: (zMax + zMin) / 2,
      lx: xMax - xMin,
      ly: yMax - yMin,
      lz: zMax - zMin,
      xMin,
      xMax,
      yMin,
      yMax,
      zMin,
      zMax,
    }
  }

  /**
   * 更新点云选区, 私有函数.
   */
  updateSelection(newSelSet: Set<number>) {
    if (!this.pc) return
    // 模式为并集时,所有的点全部高亮,没有需要消除高亮的点
    if (this.selMode === 'union') {
      this.selIdx = new Set([...this.selIdx, ...newSelSet])
      this.updateColor()
    } else if (this.selMode === 'intersection' || this.selMode === 'difference') {
      // 当模式为差集或交集时,分别保存需要高亮和需要消除高亮的点
      const intersection: Set<number> = new Set(),
        difference: Set<number> = new Set()
      this.selIdx.forEach(x => {
        if (newSelSet.has(x)) {
          intersection.add(x)
        } else {
          difference.add(x)
        }
      })
      if (this.selMode === 'intersection') {
        this.selIdx = difference
        this.pc.resetColorByIds(intersection)
      } else {
        this.selIdx = intersection
        this.pc.resetColorByIds(difference)
      }
    }
    this.emitter.emit('selectChange')
  }

  /** 更新点云颜色,私有函数 */
  updateColor() {
    if (!this.pc) return
    this.pc.highLightByIds(this.selIdx)
  }
}
