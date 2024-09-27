import { Scene, WebGLRenderer, PerspectiveCamera } from 'three'
import { degToRad } from 'three/src/math/MathUtils'
import OrbitControls from '@/three_controls/orbit_controls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { TargetArrow } from '@/three_controls/basic_three'
import { debounce } from '@/utils'

const scene: Scene = new Scene() // 创建场景

const renderer: WebGLRenderer | null = new WebGLRenderer() // 渲染器

let camera: PerspectiveCamera | null = null // 相机

let controls: any = null // 轨道控制器

// 添加状态监视,显示画面渲染时间和帧数
const stats = new (Stats as any)()
stats.domElement.style.cssText = 'position: absolute;top:0px;left:0px'

// 添加观察点指示器
const targetArrow = new TargetArrow()
scene.add(targetArrow)

// 渲染动画
const animate = () => {
  requestAnimationFrame(animate)
  if (!camera) return
  renderer?.render(scene, camera)
  controls?.update()
  stats?.update()
}
animate()

// 导出共享场景对象
export { scene, renderer, camera, controls, stats }

export const setCamera = (width: number, height: number) => {
  camera = new PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(0, 0, 30)
  camera.lookAt(0, 0, 0)
  camera.up.set(0, 0, 1)
  // 在大多数属性发生改变之后，你将需要调用.updateProjectionMatrix来使得这些改变生效
  camera.updateProjectionMatrix()
  return camera
}

export const setControls = (camera: PerspectiveCamera) => {
  controls = new (OrbitControls as any)(camera, renderer?.domElement)
  controls.rotateSpeed = 1.0
  controls.zoomSpeed = 1.2
  controls.panSpeed = 0.8
  controls.target.set(0, 0, 0)
  controls.enabled = false
  controls.enableDamping = true
  controls.setAzimuthalAngle(-Math.PI / 2)
  controls.enabled = true

  // 发送方位角和极角更新事件
  controls.addEventListener(
    'change',
    debounce(() => {
      targetArrow.setOrigin(controls.target)
    }, 200)
  )
  return controls
}

// 设置控制器方位角和极角
export const setControlAngle = (type: string, angle: number) => {
  if (type === 'azimuthal') controls.setAzimuthalAngle(degToRad(angle))
  if (type === 'polar') controls.setPolarAngle(degToRad(angle))
}
