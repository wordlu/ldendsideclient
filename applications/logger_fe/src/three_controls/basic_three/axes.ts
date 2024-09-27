import {
  Object3D,
  BufferGeometry,
  Float32BufferAttribute,
  LineBasicMaterial,
  LineSegments,
} from 'three'
/**
 * x,y,z 坐标轴
 */
export default class Axes extends Object3D {
  size: number
  /**
   * @param size 坐标轴的长度.
   */
  constructor(size: number) {
    super()
    this.size = size
    const vertices = [
      -size / 2,
      0,
      0,
      size / 2,
      0,
      0,
      0,
      -size / 2,
      0,
      0,
      size / 2,
      0,
      0,
      0,
      -size / 2,
      0,
      0,
      size / 2,
    ]
    const colors = [1, 0, 0, 1, 0.6, 0, 0, 1, 0, 0.6, 1, 0, 0, 0, 1, 0, 0.6, 1]
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
    const material = new LineBasicMaterial({ vertexColors: true, toneMapped: false })
    this.add(new LineSegments(geometry, material))
  }
}
