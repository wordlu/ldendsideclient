<template>
  <div id="canvas-box" @click="canvasClick"></div>
</template>
<script setup lang="ts">
import { Axes, MyGrid } from '@/three_controls/basic_three'
import { ResizeObserver } from '@juggle/resize-observer' //polyfills the ResizeObserver API
import { onMounted } from 'vue'
import { scene, renderer, stats, setCamera, setControls, controls } from '@/basic_data/scene_data'

// 初始化场景
const initScene = async () => {
  const canvasBox: HTMLDivElement | null = document.querySelector('#canvas-box')

  // const { scene, renderer, stats } = sceneData // 场景&渲染器

  if (!canvasBox || !scene || !renderer) return
  const camera = setCamera(canvasBox.clientWidth, canvasBox.clientHeight) // 根据

  renderer.setSize(canvasBox.clientWidth, canvasBox.clientHeight) // 将渲染器的大小设置为窗口的大小
  canvasBox?.appendChild(renderer.domElement) // 将渲染器绑定到指定的DOM元素中

  // 设置轨道控制器
  setControls(camera)

  // 添加网格
  const gridHelper = new MyGrid()
  scene.add(gridHelper)

  // 添加坐标轴
  const axes = new Axes(50)
  scene.add(axes)

  // 添加状态监视,显示画面渲染时间和帧数
  stats?.dom && canvasBox.appendChild(stats?.dom)

  // 当窗口改变时, 重新计算渲染器和相机参数
  const ro = new ResizeObserver((entries: any[]) => {
    for (const entry of entries) {
      if (entry.target === canvasBox) {
        const width = entry.target.offsetWidth
        const height = entry.target.offsetHeight
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer?.setSize(width, height)
      }
    }
  })
  ro.observe(canvasBox)
}

// 绑定点击事件
const bindClickEvent = () => {
  const disableSel = document.querySelectorAll('.disable-selector')
  disableSel.forEach(item => {
    item.addEventListener('click', () => {
      if (controls.enableKeys) controls.enableKeys = false
    })
  })
}

// 记录是否按下ctrl建
let pressCtrl = false
const bindCtrlEvent = () => {
  // 当 control 按下时, 总是激活控制球, 并且暂时禁止选择工具
  document.addEventListener('keydown', e => {
    if (!pressCtrl && e.key === 'Control') {
      pressCtrl = true
      controls.enabled = true
    }
  })
}

onMounted(() => {
  initScene()
  bindClickEvent()
  bindCtrlEvent()
})

const canvasClick = () => {
  if (!controls.enableKeys) controls.enableKeys = true
}
</script>

<style lang="scss" scoped>
#canvas-box {
  height: 100%;
  position: relative;
  flex: 1;
}
</style>
