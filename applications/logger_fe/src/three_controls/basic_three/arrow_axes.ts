import * as THREE from 'three'

/**
 * 自定义坐标轴, 本坐标轴只包含正半轴且允许设置颜色.
 * 但是所有坐标轴的颜色都是一样的.
 */
export class ArrowAxes extends THREE.Object3D {
  // 坐标轴的长度
  readonly len: number
  // 坐标轴的颜色
  readonly color: string
  // 物体的组. 包含了各个子物体
  private _myAxisGroup: THREE.Group
  private _xAxis: THREE.ArrowHelper
  private _yAxis: THREE.ArrowHelper
  private _zAxis: THREE.ArrowHelper
  constructor(len: number, color: string) {
    super()
    this.len = len !== undefined ? len : 1
    this.color = color !== undefined ? color : '#ff0000'
    const origin = new THREE.Vector3(0, 0, 0)
    this._xAxis = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, this.len, this.color)
    this._yAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, this.len, this.color)
    this._zAxis = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, this.len, this.color)
    this._myAxisGroup = new THREE.Group()
    this._myAxisGroup.add(this._xAxis)
    this._myAxisGroup.add(this._yAxis)
    this._myAxisGroup.add(this._zAxis)
    this.add(this._myAxisGroup)
  }

  setColor(color: string) {
    this._xAxis.setColor(color)
    this._yAxis.setColor(color)
    this._zAxis.setColor(color)
  }
}
