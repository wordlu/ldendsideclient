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
          <el-table-column prop="id" label="ID" />
          <!-- <el-table-column prop="name" label="Name"/> -->
          <el-table-column prop="name" label="Name">
            <template #default="scope">
              <el-input type="text" v-model="scope.row.name" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="x" label="X">
            <template #default="scope">
              <el-input type="number" step="0.01" v-model.number="scope.row.x" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="y" label="Y">
            <template #default="scope">
              <el-input type="number" step="0.01" v-model.number="scope.row.y" size="small" />
            </template>
          </el-table-column>
          <el-table-column prop="z" label="Z">
            <template #default="scope">
              <el-input type="number" step="0.01" v-model.number="scope.row.z" size="small" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 右侧 -->
    <div class="right-panel" ref="rightPanelRef">
      <div class="vehicle-area">
        <div class="vertical-ruler" :style="{ height: imageSize.height + 'px', width: '32px' }">
          <div v-for="tick in rulerTicks" :key="tick.value" class="ruler-tick" :style="{ top: tick.top + 'px' }">
            <span v-if="tick.label" class="ruler-label left-label" :class="{ 'zero-tick': tick.value === '0.00', 'edge-tick': tick.isEdge }">{{ tick.label }}</span>
            <div class="ruler-line" :class="{ 'major-tick-line': tick.isMajor, 'edge-tick-line': tick.isEdge }"></div>
          </div>
        </div>
        <div class="vehicle-main">
          <div class="horizontal-ruler" :style="{ width: imageSize.width + 'px', height: '32px' }">
            <div v-for="tick in horizontalRulerTicks" :key="tick.value" class="ruler-tick-horizontal" :style="{ left: tick.left + 'px' }">
              <span v-if="tick.label" class="ruler-label-horizontal" :class="{ 'zero-tick': tick.value === '0.00', 'edge-tick': tick.isEdge }">{{ tick.label }}</span>
              <div class="ruler-line-horizontal" :class="{ 'major-tick-line': tick.isMajor, 'edge-tick-line': tick.isEdge }"></div>
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
              <span class="sensor-label">{{ sensor.name || index + 1 }}</span>
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
  x: number
  y: number
  z: number
}

const sensorData: SensorPoint[] = reactive([
  { id: 1, name: 'p1', x: -1.05, y: 0.65, z: 0 },
  { id: 2, name: 'p2', x: 1.05, y: 0.65, z: 0 },
  { id: 3, name: 'p3', x: 0.7, y: 1.95, z: 0 },
  { id: 4, name: 'p4', x: -0.7, y: 1.95, z: 0 },
  { id: 5, name: 'p5', x: 0.85, y: -1.95, z: 0 },
  { id: 6, name: 'p6', x: -0.85, y: -1.95, z: 0 },
  { id: 7, name: 'p7', x: 0, y: 2.15, z: 0 },
  { id: 8, name: 'p8', x: 0, y: -2.15, z: 0 },
  { id: 9, name: 'p9', x: -0.85, y:1.33, z: 0 },
  { id: 10, name: 'p10', x: 0.85, y: 1.33, z: 0 },
  { id: 11, name: 'p11', x: 0.94, y: -1.14, z: 0 },
  { id: 12, name: 'p12', x: -0.94, y: -1.14, z: 0 },
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

function getIconStyle(sensor) {
  // 以图片中心为(0,0)
  if (!imageSize.value.width || !imageSize.value.height || !width.value || !length.value) return {};
  const pxPerMeterX = imageSize.value.width / width.value;
  const pxPerMeterY = imageSize.value.height / length.value;
  const centerX = imageSize.value.width / 2;
  const centerY = imageSize.value.height / 2;
  // x: 右为正，左为负；y: 下为正，上为负
  const left = centerX + (sensor.x || 0) * pxPerMeterX;
  const top = centerY - (sensor.y || 0) * pxPerMeterY;
  return {
    left: `${left}px`,
    top: `${top}px`,
    transform: 'translate(-50%, -50%)'
  };
}

const getPhysicalValue = (param: string) => {
  const item = physicalData.find(d => d.param === param)
  return item ? Number(item.value.replace(/[^\d.]/g, '')) : 0
}

const length = computed(() => getPhysicalValue('Length'))
const width = computed(() => getPhysicalValue('Width'))
const height = computed(() => getPhysicalValue('Height'))

const TICK_SEGMENTS = 3; // 分三段
const rulerTicks = computed(() => {
  if (!imageSize.value.height || length.value === 0) return [];
  const ticks = [];
  const total = length.value;
  const half = total / 2;
  const step = half / TICK_SEGMENTS;
  const pxPerMeter = imageSize.value.height / total;
  const center = imageSize.value.height / 2;
  for (let i = -TICK_SEGMENTS; i <= TICK_SEGMENTS; i++) {
    const value = Math.abs(i * step);
    const top = center - i * step * pxPerMeter;
    const isMajor = i === 0 || Math.abs(i) === TICK_SEGMENTS;
    ticks.push({
      value: value.toFixed(2),
      label: isMajor ? value.toFixed(2) : '',
      top,
      isMajor,
      isZero: i === 0
    });
  }
  return ticks;
});

const horizontalRulerTicks = computed(() => {
  if (!imageSize.value.width || width.value === 0) return [];
  const ticks = [];
  const total = width.value;
  const half = total / 2;
  const step = half / TICK_SEGMENTS;
  const pxPerMeter = imageSize.value.width / total;
  const center = imageSize.value.width / 2;
  for (let i = -TICK_SEGMENTS; i <= TICK_SEGMENTS; i++) {
    const value = Math.abs(i * step);
    const left = center + i * step * pxPerMeter;
    const isMajor = i === 0 || Math.abs(i) === TICK_SEGMENTS;
    ticks.push({
      value: value.toFixed(2),
      label: isMajor ? value.toFixed(2) : '',
      left,
      isMajor,
      isZero: i === 0
    });
  }
  return ticks;
});

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
  width: 600px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  min-width: 60px;
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
  top: 32px;
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
.ruler-line {
  flex: 1;
  height: 1px;
  background: #888;
  width: 10px;
  margin-left: 0;
}
.ruler-line-horizontal {
  width: 1px;
  height: 10px;
  background: #888;
  margin-top: 0;
}
.major-tick-line {
  background: #1976d2 !important;
  width: 18px !important;
  height: 2px !important;
}
.ruler-line-horizontal.major-tick-line {
  height: 18px !important;
  width: 2px !important;
}
.edge-tick-line {
  background: #1976d2 !important;
  width: 22px !important;
  height: 3px !important;
}
.ruler-line-horizontal.edge-tick-line {
  height: 22px !important;
  width: 3px !important;
}
.ruler-label-horizontal, .ruler-label.left-label {
  font-size: 13px;
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
.edge-tick {
  color: #1976d2;
  font-weight: bold;
  font-size: 15px;
  background: #fff;
  border-radius: 4px;
  padding: 0 4px;
  box-shadow: 0 0 2px #1976d2;
}
</style>
