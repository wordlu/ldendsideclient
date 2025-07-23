<template>
  <div class="car-sensor-config">
    <!-- 左侧 -->
    <div class="left-panel">
      <!-- 上半：物理尺寸 -->
      <el-card class="physical-card" shadow="never">
        <div class="card-title">Physical dimension</div>
        <el-table :data="physicalData" style="width: 100%" size="small" border>
          <el-table-column prop="param" label="Parameter" width="100" />
          <el-table-column prop="value" label="Value">
            <template #default="scope">
              <el-input v-model="scope.row.value" size="small" @input="onPhysicalChange" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 下半：传感器参数 -->
      <el-card class="sensor-card" shadow="never">
        <div class="card-title">Sensor points</div>
        <el-table :data="sensorData" size="small" border height="100%">
          <el-table-column prop="id" label="#" width="40" />
          <el-table-column prop="name" label="Name" width="60" />
          <el-table-column prop="forward" label="Forw" width="60" />
          <el-table-column prop="right" label="Right" width="60" />
          <el-table-column prop="heading" label="Heading" width="80" />
          <el-table-column prop="fov1" label="Field 1" width="80" />
          <el-table-column prop="fov2" label="Field 2" width="80" />
        </el-table>
      </el-card>
    </div>

    <!-- 右侧 -->
    <div class="right-panel" ref="rightPanelRef">
      <div class="vehicle-area">
        <div class="vertical-ruler" :style="{ height: imageSize.height + 'px', width: '32px' }">
          <div v-for="tick in rulerTicks" :key="tick.value" class="ruler-tick" :style="{ top: tick.top + 'px' }">
            <span class="ruler-label left-label" :class="{ 'zero-tick': tick.isZero }">{{ tick.label }}</span>
            <div class="ruler-line" :class="{ 'zero-tick-line': tick.isZero }"></div>
          </div>
        </div>
        <div class="vehicle-main">
          <div class="horizontal-ruler" :style="{ width: imageSize.width + 'px', height: '32px' }">
            <div v-for="tick in horizontalRulerTicks" :key="tick.value" class="ruler-tick-horizontal" :style="{ left: tick.left + 'px' }">
              <span class="ruler-label-horizontal" :class="{ 'zero-tick': tick.isZero }">{{ tick.label }}</span>
              <div class="ruler-line-horizontal" :class="{ 'zero-tick-line': tick.isZero }"></div>
            </div>
          </div>
          <div class="vehicle-container"
            :style="{ width: imageSize.width + 'px', height: imageSize.height + 'px' }">
            <div class="center-line-vertical" v-if="imageSize.height > 0" :style="{ height: imageSize.height + 'px', zIndex: 9, left: '50%', top: 0, position: 'absolute' }"></div>
            <div class="center-line-horizontal" v-if="imageSize.width > 0" :style="{ width: imageSize.width + 'px', zIndex: 9, top: '50%', left: 0, position: 'absolute' }"></div>
            <img class="vehicle-image" :src="vehicleImage" ref="imageRef" @load="updateImageSize"
              style="width:100%;height:100%;object-fit:contain;display:block;" />
            <div class="vehicle-center-dot"
              :style="{ left: imageSize.width / 2 + 'px', top: imageSize.height / 2 + 'px', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none', position: 'absolute' }"
            ></div>
            <div
              v-for="(sensor, index) in sensorData"
              :key="sensor.id"
              class="sensor-icon"
              :style="getIconStyle(sensor)"
            >
              <span class="sensor-label">{{ index + 1 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive, computed, watch } from 'vue'

const vehicleImage = 'http://localhost:8083/apps/systemanage/img/st_car.jpg'

const physicalData = reactive([
  { param: 'Length', value: '4.3 m' },
  { param: 'Width', value: '2.1 m' },
  { param: 'Height', value: '2.6 m' }
])

interface SensorPoint {
  id: number
  name: string
  forward: number
  right: number
  heading: number
  fov1: number
  fov2: number
}

const sensorData: SensorPoint[] = reactive([
  { id: 1, name: 'SEN1', forward: 0.5, right: 1.0, heading: 0, fov1: 45, fov2: 2 },
  { id: 2, name: 'SEN2', forward: 1.0, right: 0.0, heading: 0, fov1: 45, fov2: 2 },
  // 添加更多锚点数据...
])

const imageRef = ref<HTMLImageElement | null>(null)
const rightPanelRef = ref<HTMLDivElement | null>(null)
const imageSize = ref({ width: 0, height: 0 })
const scale = ref(1)

const updateImageSize = () => {
  const container = rightPanelRef.value
  const img = imageRef.value
  if (container && img && img.naturalWidth && img.naturalHeight) {
    const maxH = container.clientHeight - 64
    const imgW = img.naturalWidth
    const imgH = img.naturalHeight
    const scale = maxH / imgH
    imageSize.value.height = maxH
    imageSize.value.width = imgW * scale
  }
}

const onPhysicalChange = () => {
  updateImageSize()
}

const getIconStyle = (sensor: SensorPoint) => {
  const offsetX = sensor.right * 100 * scale.value
  const offsetY = sensor.forward * 100 * scale.value
  return {
    left: `calc(50% + ${offsetX}px)`,
    top: `calc(50% - ${offsetY}px)`,
    transform: 'translate(-50%, -50%) scale(' + scale.value.toFixed(2) + ')'
  }
}

const getPhysicalValue = (param: string) => {
  const item = physicalData.find(d => d.param === param)
  return item ? Number(item.value.replace(/[^\d.]/g, '')) : 0
}

const length = computed(() => getPhysicalValue('Length'))
const width = computed(() => getPhysicalValue('Width'))
const height = computed(() => getPhysicalValue('Height'))

// 保证 rulerTicks/horizontalRulerTicks 计算用 imageSize.height/width
// 横向主刻度
const horizontalRulerTicks = computed(() => {
  if (!imageSize.value.width || width.value === 0) return []
  const ticks = []
  const pxPerMeter = imageSize.value.width / width.value
  const center = imageSize.value.width / 2
  const half = Math.floor(width.value / 2)
  for (let i = -half; i <= half; i++) {
    const left = center + i * pxPerMeter
    ticks.push({
      value: i,
      label: `${i}m`,
      left,
      isZero: i === 0
    })
  }
  if (half === 0) {
    ticks.push({ value: 0, label: '0m', left: center, isZero: true })
  }
  return ticks
})
// 纵向主刻度
const rulerTicks = computed(() => {
  if (!imageSize.value.height || length.value === 0) return []
  const ticks = []
  const pxPerMeter = imageSize.value.height / length.value
  const center = imageSize.value.height / 2
  const half = Math.floor(length.value / 2)
  for (let i = -half; i <= half; i++) {
    const top = center - i * pxPerMeter
    ticks.push({
      value: i,
      label: `${i}m`,
      top,
      isZero: i === 0
    })
  }
  if (half === 0) {
    ticks.push({ value: 0, label: '0m', top: center, isZero: true })
  }
  return ticks
})

onMounted(() => {
  window.addEventListener('resize', updateImageSize)
  if (imageRef.value) {
    imageRef.value.onload = updateImageSize
  }
  setTimeout(updateImageSize, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateImageSize)
})

// 保证图片切换时 updateImageSize 正确绑定
watch(() => vehicleImage, () => {
  if (imageRef.value) {
    imageRef.value.onload = updateImageSize
  }
})
</script>

<style scoped>
.car-sensor-config {
  display: flex;
  height: 100%;
  width: 100%;
}

.left-panel {
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  min-width: 300px;
}

.physical-card,
.sensor-card {
  flex: 1;
  overflow: auto;
}

.card-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.right-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.vehicle-area {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
}
.vehicle-main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.vehicle-container {
  position: relative;
  display: block;
  background: #fff;
}
.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.vehicle-center-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 18px;
  background: #fff;
  border: 3px solid #1976d2;
  border-radius: 50%;
  box-shadow: 0 0 4px #1976d2;
  transform: translate(-50%, -50%);
  z-index: 3;
}

.sensor-icon {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: red;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 30px;
  font-size: 14px;
  font-weight: bold;
  pointer-events: none;
  transition: transform 0.2s ease;
}

.horizontal-ruler {
  position: relative;
  width: 100%;
  height: 32px;
  z-index: 100;
  pointer-events: none;
}
.vertical-ruler {
  position: relative;
  width: 32px;
  height: 100%;
  z-index: 100;
  pointer-events: none;
}
.ruler-tick-horizontal {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.ruler-tick {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  display: flex;
  align-items: center;
}
.ruler-label-horizontal {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: #333;
  font-weight: bold;
  background: #fff;
  border-radius: 4px;
  padding: 0 4px;
  box-shadow: 0 0 2px #1976d2;
  z-index: 101;
}
.ruler-label.left-label {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #333;
  font-weight: bold;
  background: #fff;
  border-radius: 4px;
  padding: 0 4px;
  box-shadow: 0 0 2px #1976d2;
  z-index: 101;
}
.zero-tick {
  color: #1976d2;
  font-weight: bold;
  font-size: 16px;
  background: #fff;
  border-radius: 4px;
  padding: 0 4px;
  box-shadow: 0 0 2px #1976d2;
}
.ruler-line.zero-tick-line,
.ruler-line-horizontal.zero-tick-line {
  background: #1976d2;
  height: 32px !important;
  width: 3px !important;
}
.ruler-line,
.ruler-line-horizontal {
  background: #888;
  height: 18px;
  width: 2px;
}
.center-line-vertical {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  background: #1976d2;
  z-index: 2;
  transform: translateX(-50%);
}

.center-line-horizontal {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: #1976d2;
  z-index: 2;
  transform: translateY(-50%);
}

.left-label {
  position: absolute;
  left: -38px;
  top: 50%;
  transform: translateY(-50%);
  text-align: right;
}
.top-label {
  position: absolute;
  top: -18px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

/* 中心线样式加粗，与0刻度线宽度一致 */
.center-line-vertical, .center-line-horizontal {
  background: #1976d2;
  z-index: 99;
  width: 3px !important;
  height: 3px !important;
}
</style>
