import { Object3D, Vector3, ArrowHelper, Group } from 'three'

/**
 * 由6个和坐标轴平行的箭头组成. 可以用来表示当前相机所看的位置.
 * 轨迹球缩放的位置也都是相对于这个位置.
 */
export default class TargetArrow extends Object3D {
  x: ArrowHelper
  y: ArrowHelper
  z: ArrowHelper
  nx: ArrowHelper
  ny: ArrowHelper
  nz: ArrowHelper
  targetArrow: Group
  /**
   * 构建一个由6个箭头组成的物体.
   * @param {Vector3} origin 原点.
   * @param {number} length 长度.
   * @param {number} hexColor 颜色.
   * @param {number} headLength 箭头长度.
   * @param {number} headWidth 箭头宽度.
   */
  constructor(
    origin = new Vector3(0, 0, 0),
    length = 1,
    hexColor = 0xffff00,
    headLength = length * 0.2,
    headWidth = headLength * 0.2
  ) {
    super()
    this.x = new ArrowHelper(
      new Vector3(1, 0, 0),
      new Vector3(0, 0, 0),
      length,
      hexColor,
      headLength,
      headWidth
    )
    this.y = new ArrowHelper(
      new Vector3(0, 1, 0),
      new Vector3(0, 0, 0),
      length,
      hexColor,
      headLength,
      headWidth
    )
    this.z = new ArrowHelper(
      new Vector3(0, 0, 1),
      new Vector3(0, 0, 0),
      length,
      hexColor,
      headLength,
      headWidth
    )
    this.nx = new ArrowHelper(
      new Vector3(-1, 0, 0),
      new Vector3(0, 0, 0),
      length,
      hexColor,
      headLength,
      headWidth
    )
    this.ny = new ArrowHelper(
      new Vector3(0, -1, 0),
      new Vector3(0, 0, 0),
      length,
      hexColor,
      headLength,
      headWidth
    )
    this.nz = new ArrowHelper(
      new Vector3(0, 0, -1),
      new Vector3(0, 0, 0),
      length,
      hexColor,
      headLength,
      headWidth
    )

    this.targetArrow = new Group()
    this.targetArrow.name = 'targetArrow'
    this.targetArrow.add(this.x)
    this.targetArrow.add(this.y)
    this.targetArrow.add(this.z)
    this.targetArrow.add(this.nx)
    this.targetArrow.add(this.ny)
    this.targetArrow.add(this.nz)
    this.targetArrow.position.copy(origin)

    this.add(this.targetArrow)
  }

  setOrigin(origin: Vector3) {
    this.targetArrow.position.copy(origin)
  }
}
