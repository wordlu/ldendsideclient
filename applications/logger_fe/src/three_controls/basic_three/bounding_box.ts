import * as THREE from 'three'

interface boxParamType {
  x: number
  y: number
  z: number
  lx: number
  ly: number
  lz: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  zMin: number
  zMax: number
}

const defaultBoxParams: boxParamType = {
  x: 2,
  y: 2,
  z: 2,
  lx: 2,
  ly: 2,
  lz: 2,
  // 上面六个值已经能够唯一确定一个 AABB, 下面的六个值只是为了方便进行计算
  xMin: 0,
  xMax: 0,
  yMin: 0,
  yMax: 0,
  zMin: 0,
  zMax: 0,
}

export class AxisAlignedBoundingBox extends THREE.Object3D {
  /**
   * 矩形框
   * @param {string} name 名称.
   * @param {object} boxParams 矩形框属性参数. 如果 id, label, velocity 对应的属性为 null, 则不进行显示.
   * @param {object} displayParams 矩形框显示参数.
   */
  public name: string
  public boxColor: string
  public opacity: number
  private _sceneBoundingBox
  private _myGroup
  private _boxParams: boxParamType
  constructor(
    name: string,
    displayParams?: {
      boxColor?: string
      opacity?: number
    },
    IBoxParams?: {
      x?: number
      y?: number
      z?: number
      lx?: number
      ly?: number
      lz?: number
    }
    // boxParams = {
    //   id: null,
    //   x: 0,
    //   y: 0,
    //   z: 0,
    //   dimX: 1,
    //   dimY: 1,
    //   dimZ: 1,
    //   quaX: 0,
    //   quaY: 0,
    //   quaZ: 0,
    //   quaW: 0,
    //   label: null,
    //   velocity: null,
    // },
  ) {
    // 根据 https://stackoverflow.com/questions/40933735/three-js-cube-geometry-how-to-update-parameters
    // 矩形的长宽高是不能修改的, 因此需要借助 scale.
    super()
    this.name = name
    this.boxColor = displayParams?.boxColor || '#0f0'
    this.opacity = displayParams?.opacity || 0.3
    const boxParams = { ...defaultBoxParams, ...IBoxParams }
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({
      color: this.boxColor,
      side: THREE.DoubleSide,
      opacity: this.opacity,
      transparent: true,
    })
    this._sceneBoundingBox = new THREE.Mesh(geometry, material)
    this._sceneBoundingBox.scale.set(boxParams.lx, boxParams.ly, boxParams.lz)
    this._sceneBoundingBox.position.copy(new THREE.Vector3(boxParams.x, boxParams.y, boxParams.z))
    // wireframe
    const geo = new THREE.EdgesGeometry(this._sceneBoundingBox.geometry)
    const mat = new THREE.LineBasicMaterial({ color: this.boxColor, linewidth: 4 })
    const wireframe = new THREE.LineSegments(geo, mat)
    wireframe.renderOrder = 1 // make sure wireframes are rendered 2nd
    this._sceneBoundingBox.add(wireframe)

    this._myGroup = new THREE.Group()
    this._myGroup.add(this._sceneBoundingBox)

    // 将组添加到本对象中
    this.add(this._myGroup)

    // 定义响应式的 boxParams 参数
    const self = this // eslint-disable-line
    this._boxParams = new Proxy(boxParams, {
      get(target, p): number {
        return target[p as keyof typeof target]
      },
      set(target, p, newValue: number): boolean {
        target[p as keyof typeof target] = newValue
        // 设置box位置
        if (['x', 'y', 'z'].indexOf(p.toString()) > -1) {
          self._setBoxPos(target)
          // 设置box尺寸
        } else if (['lx', 'ly', 'lz'].indexOf(p.toString()) > -1) {
          self._setBoxSize(target)
        }
        return true
      },
    })
  }

  get boxParams() {
    return this._boxParams
  }
  set boxParams(boxParams: boxParamType) {
    this._setBoxParams(boxParams)
  }

  _setBoxSize(boxParams: boxParamType) {
    this._sceneBoundingBox.scale.set(boxParams.lx, boxParams.ly, boxParams.lz)
  }

  _setBoxPos(boxParams: boxParamType) {
    this._sceneBoundingBox.position.copy(new THREE.Vector3(boxParams.x, boxParams.y, boxParams.z))
  }

  // 设置位置和尺寸(x,y,z&lx,ly,lz)
  _setBoxParams(boxParams: boxParamType) {
    this._sceneBoundingBox.scale.set(boxParams.lx, boxParams.ly, boxParams.lz)
    this._sceneBoundingBox.position.copy(new THREE.Vector3(boxParams.x, boxParams.y, boxParams.z))
  }

  setBoxColor(color: string) {
    this._sceneBoundingBox.material.color.set(color)
    this._sceneBoundingBox.children[0]?.material?.color.set(color)
  }

  // updateDisplay() {
  //   // 调整矩形框大小
  //   this._sceneBoundingBox.scale.set(this.boxParams.dimX, this.boxParams.dimY, this.boxParams.dimZ)
  //   // 根据位置参数调整组的位置和旋转参数
  //   this.objectGroup.setRotationFromQuaternion(
  //     new THREE.Quaternion(
  //       this.boxParams.quaX,
  //       this.boxParams.quaY,
  //       this.boxParams.quaZ,
  //       this.boxParams.quaW
  //     )
  //   )
  //   this.objectGroup.position.copy(
  //     new THREE.Vector3(this.boxParams.x, this.boxParams.y, this.boxParams.z)
  //   )
  //   // 设置文字精灵的内容
  //   const displayText = []
  //   const needDisplayElements = [this.boxParams.id, this.boxParams.label, this.boxParams.velocity]
  //   needDisplayElements.forEach((element) => {
  //     if (element !== null) {
  //       if (typeof element === 'number' && !Number.isInteger(element)) {
  //         displayText.push(element.toFixed(2))
  //       } else {
  //         displayText.push(element)
  //       }
  //     }
  //   })
  //   if (displayText.length !== 0) {
  //     const text = displayText.join(',')
  //     // 如果不重新创建文字精灵显示有一定概率出问题, 将来优化直接自己使用精灵, 不用第三方库
  //     this.textLabelSprite.removeFromParent()
  //     this.textLabelSprite = new SpriteText(
  //       '',
  //       this.displayParams.textHeight,
  //       this.displayParams.textColor
  //     )
  //     // 将文字精灵添加到组中
  //     this.objectGroup.add(this.textLabelSprite)
  //     this.textLabelSprite.text = `(${text})`
  //     // 将文字精灵放到框的上方
  //     this.textLabelSprite.position.set(
  //       0,
  //       0,
  //       (this.boxParams.dimZ * 2) / 3 + this.displayParams.textHeight
  //     )
  //   }
  //   // 如果需要显示 x arrow, 重新调整 arrow 的头部比例
  //   if (this.displayParams.showXArrow) {
  //     this.sceneBoundingBox.add(this.xArrow)
  //     // 第三个参数需要按比例调整, 前两个参数自动根据 group 参数修改
  //     this.xArrow.setLength(1, 0.3, this.boxParams.dimY * 0.1)
  //   } else {
  //     this.sceneBoundingBox.remove(this.xArrow)
  //   }
  // }
}
