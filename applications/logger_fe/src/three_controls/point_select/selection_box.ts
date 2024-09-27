import { PerspectiveCamera, OrthographicCamera, Points, Frustum, Vector3 } from 'three'
import { PointCloud } from '../basic_three/point_cloud'

/**
 * 点云选择辅助工具, 需要配合 SelectionHelper 使用
 */
export default class PointCloudBoxSelection {
  public camera: PerspectiveCamera | OrthographicCamera
  public deep
  public pc: Points
  private frustum: Frustum
  private tmpPoint: Vector3
  private vecNear: Vector3
  private vecTopLeft: Vector3
  private vecTopRight: Vector3
  private vecDownRight: Vector3
  private vecDownLeft: Vector3
  private vectemp1: Vector3
  private vectemp2: Vector3
  private vectemp3: Vector3
  private vecFarTopLeft: Vector3
  private vecFarTopRight: Vector3
  private vecFarDownRight: Vector3
  private vecFarDownLeft: Vector3
  public startPoint: Vector3
  public endPoint: Vector3

  /**
   * 所有的参数都可以不传, 但是在使用前必须设置 camera 和 pc.
   * 最终选择的结果为对应点的 userData.originIdx.
   *
   * @param {THREE.camera} camera 相机.
   * @param {float} deep 最远选择距离, 默认为无穷大.
   * @param {MyPointCloud} pc 点云.
   */
  constructor(camera?: PerspectiveCamera, deep?: any, pc?: Points) {
    this.frustum = new Frustum()
    this.tmpPoint = new Vector3()
    this.vecNear = new Vector3()
    this.vecTopLeft = new Vector3()
    this.vecTopRight = new Vector3()
    this.vecDownRight = new Vector3()
    this.vecDownLeft = new Vector3()
    this.vectemp1 = new Vector3()
    this.vectemp2 = new Vector3()
    this.vectemp3 = new Vector3()
    this.vecFarTopLeft = new Vector3()
    this.vecFarTopRight = new Vector3()
    this.vecFarDownRight = new Vector3()
    this.vecFarDownLeft = new Vector3()

    this.camera = camera || null
    this.pc = pc || null
    this.startPoint = new Vector3()
    this.endPoint = new Vector3()
    this.deep = deep || Number.MAX_VALUE
  }

  // 设置相机
  setCamera(camera: PerspectiveCamera) {
    this.camera = camera
  }

  // 设置pointCloud
  setPc(pc: PointCloud) {
    this.pc = pc
  }

  // 根据起始点和结束点生成四棱椎
  generateFrustum(startPoint?: Vector3, endPoint?: Vector3) {
    startPoint = startPoint || this.startPoint
    endPoint = endPoint || this.endPoint

    // Avoid invalid frustum
    if (startPoint.x === endPoint.x) {
      endPoint.x += Number.EPSILON
    }
    if (startPoint.y === endPoint.y) {
      endPoint.y += Number.EPSILON
    }

    this.camera.updateProjectionMatrix()
    this.camera.updateMatrixWorld()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (this.camera.isPerspectiveCamera) {
      this.tmpPoint.copy(startPoint)
      this.tmpPoint.x = Math.min(startPoint.x, endPoint.x)
      this.tmpPoint.y = Math.max(startPoint.y, endPoint.y)
      endPoint.x = Math.max(startPoint.x, endPoint.x)
      endPoint.y = Math.min(startPoint.y, endPoint.y)

      this.vecNear.setFromMatrixPosition(this.camera.matrixWorld)
      this.vecTopLeft.copy(this.tmpPoint)
      this.vecTopRight.set(endPoint.x, this.tmpPoint.y, 0)
      this.vecDownRight.copy(endPoint)
      this.vecDownLeft.set(this.tmpPoint.x, endPoint.y, 0)

      this.vecTopLeft.unproject(this.camera)
      this.vecTopRight.unproject(this.camera)
      this.vecDownRight.unproject(this.camera)
      this.vecDownLeft.unproject(this.camera)

      this.vectemp1.copy(this.vecTopLeft).sub(this.vecNear)
      this.vectemp2.copy(this.vecTopRight).sub(this.vecNear)
      this.vectemp3.copy(this.vecDownRight).sub(this.vecNear)
      this.vectemp1.normalize()
      this.vectemp2.normalize()
      this.vectemp3.normalize()

      this.vectemp1.multiplyScalar(this.deep)
      this.vectemp2.multiplyScalar(this.deep)
      this.vectemp3.multiplyScalar(this.deep)
      this.vectemp1.add(this.vecNear)
      this.vectemp2.add(this.vecNear)
      this.vectemp3.add(this.vecNear)

      const planes = this.frustum.planes

      planes[0].setFromCoplanarPoints(this.vecNear, this.vecTopLeft, this.vecTopRight)
      planes[1].setFromCoplanarPoints(this.vecNear, this.vecTopRight, this.vecDownRight)
      planes[2].setFromCoplanarPoints(this.vecDownRight, this.vecDownLeft, this.vecNear)
      planes[3].setFromCoplanarPoints(this.vecDownLeft, this.vecTopLeft, this.vecNear)
      planes[4].setFromCoplanarPoints(this.vecTopRight, this.vecDownRight, this.vecDownLeft)
      planes[5].setFromCoplanarPoints(this.vectemp3, this.vectemp2, this.vectemp1)
      planes[5].normal.multiplyScalar(-1)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } else if (this.camera.isOrthographicCamera) {
      const left = Math.min(startPoint.x, endPoint.x)
      const top = Math.max(startPoint.y, endPoint.y)
      const right = Math.max(startPoint.x, endPoint.x)
      const down = Math.min(startPoint.y, endPoint.y)

      this.vecTopLeft.set(left, top, -1)
      this.vecTopRight.set(right, top, -1)
      this.vecDownRight.set(right, down, -1)
      this.vecDownLeft.set(left, down, -1)

      this.vecFarTopLeft.set(left, top, 1)
      this.vecFarTopRight.set(right, top, 1)
      this.vecFarDownRight.set(right, down, 1)
      this.vecFarDownLeft.set(left, down, 1)

      this.vecTopLeft.unproject(this.camera)
      this.vecTopRight.unproject(this.camera)
      this.vecDownRight.unproject(this.camera)
      this.vecDownLeft.unproject(this.camera)

      this.vecFarTopLeft.unproject(this.camera)
      this.vecFarTopRight.unproject(this.camera)
      this.vecFarDownRight.unproject(this.camera)
      this.vecFarDownLeft.unproject(this.camera)

      const planes = this.frustum.planes

      planes[0].setFromCoplanarPoints(this.vecTopLeft, this.vecFarTopLeft, this.vecFarTopRight)
      planes[1].setFromCoplanarPoints(this.vecTopRight, this.vecFarTopRight, this.vecFarDownRight)
      planes[2].setFromCoplanarPoints(this.vecFarDownRight, this.vecFarDownLeft, this.vecDownLeft)
      planes[3].setFromCoplanarPoints(this.vecFarDownLeft, this.vecFarTopLeft, this.vecTopLeft)
      planes[4].setFromCoplanarPoints(this.vecTopRight, this.vecDownRight, this.vecDownLeft)
      planes[5].setFromCoplanarPoints(this.vecFarDownRight, this.vecFarTopRight, this.vecFarTopLeft)
      planes[5].normal.multiplyScalar(-1)
    } else {
      console.error('THREE.SelectionBox: Unsupported camera type.')
    }
    return this.frustum
  }
}
