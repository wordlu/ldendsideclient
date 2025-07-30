<template>
  <div class="car-sensor-config">
    <!-- 左侧 -->
    <div class="left-panel">
      
      <div style="display: flex; margin-bottom: 10px;">
        <el-button size="small" type="primary" @click="onImport">Import</el-button>
        <el-button size="small" type="primary" @click="onExport">Export</el-button>
      </div>
      <!-- 上半：物理尺寸 -->
      <el-card class="physical-card" shadow="never">
        <div class="card-title">Physical dimension</div>
        <el-table :data="physicalData" style="width: 100%" size="small" border>
          <el-table-column prop="param" label="Parameter" width="100" />
          <el-table-column prop="value" label="Value">
            <template #default="scope">
              <!-- <el-input v-model="scope.row.value" size="small" @input="onPhysicalChange" /> -->
              <el-input
                v-model="scope.row.value"
                size="small"
                @input="handleInput(scope.row, $event)"
                @blur="validateInput(scope.row)"
                :placeholder="`Enter ${scope.row.unit || ''}`"
                class="input-field"
              >
                <template #append>
                  <span class="unit-text">{{ scope.row.unit || '' }}</span>
                </template>
              </el-input>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 下半：传感器参数 -->
      <el-card class="sensor-card" shadow="never">
        <div class="card-title">Sensor points</div>
        <el-table 
          :data="sensorData" 
          size="small" 
          border 
          height="100%"
          :row-class-name="tableRowClassName"
          @row-click="handleTableRowClick"
          ref="sensorTableRef"
        >
          <el-table-column prop="id" label="ID"  width="50" />
          <!-- <el-table-column prop="name" label="Name"/> -->
          <el-table-column prop="name" label="Name">
            <template #default="scope">
              <el-input type="text" v-model="scope.row.name" size="small" @input="onPhysicalChange" />
            </template>
          </el-table-column>
          <el-table-column prop="x" label="X">
            <template #default="scope">
              <el-input type="number" step="0.01" v-model.number="scope.row.x" size="small" @input="onPhysicalChange" />
            </template>
          </el-table-column>
          <el-table-column prop="y" label="Y">
            <template #default="scope">
              <el-input type="number" step="0.01" v-model.number="scope.row.y" size="small" @input="onPhysicalChange" />
            </template>
          </el-table-column>
          <el-table-column prop="z" label="Z">
            <template #default="scope">
              <el-input type="number" step="0.01" v-model.number="scope.row.z" size="small" @input="onPhysicalChange" />
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 右侧 -->
    <div class="right-panel" ref="rightPanelRef">
      <div class="vehicle-area" style="display: flex; align-items: flex-start;">
        <div class="vertical-ruler" :style="{ height: imageSize.height + 'px', width: '32px' }">
          <div v-for="(tick, idx) in rulerSubTicks" :key="'sub-'+idx" class="ruler-subtick" :style="{ top: tick.top + 'px' }"></div>
          <div v-for="tick in rulerTicks" :key="tick.value" class="ruler-tick" :style="{ top: tick.top + 'px' }">
            <span v-if="tick.label" class="ruler-label left-label" :class="{ 'zero-tick': tick.value === '0.00' }">{{ tick.label }}</span>
            <div class="ruler-line" :class="{ 'major-tick-line': tick.isMajor }"></div>
          </div>
        </div>
        <div class="vehicle-main" style="display: flex; flex-direction: column;">
          <div class="horizontal-ruler" :style="{ width: imageSize.width + 'px', height: '32px' }">
            <div v-for="(tick, idx) in horizontalRulerSubTicks" :key="'hsub-'+idx" class="ruler-subtick-horizontal" :style="{ left: tick.left + 'px' }"></div>
            <div v-for="tick in horizontalRulerTicks" :key="tick.value" class="ruler-tick-horizontal" :style="{ left: tick.left + 'px' }">
              <span v-if="tick.label" class="ruler-label-horizontal" :class="{ 'zero-tick': tick.value === '0.00' }">{{ tick.label }}</span>
              <div class="ruler-line-horizontal" :class="{ 'major-tick-line': tick.isMajor }"></div>
            </div>
          </div>
          <div class="vehicle-container" :style="{ width: imageSize.width + 'px', height: imageSize.height + 'px' }">
            <div class="center-line-vertical" v-if="imageSize.height > 0" :style="{ height: imageSize.height + 'px', zIndex: 9, left: '50%', top: 0, position: 'absolute' }"></div>
            <div class="center-line-horizontal" v-if="imageSize.width > 0" :style="{ width: imageSize.width + 'px', zIndex: 9, top: getCenterDotTop() + 'px', left: 0, position: 'absolute' }"></div>
            <img class="vehicle-image" :src="vehicleImage" ref="imageRef" @load="updateImageSize"
              style="width:100%;height:100%;object-fit:contain;display:block;" />
            <div class="vehicle-center-dot"
              :style="{ 
                left: imageSize.width / 2 + 'px', 
                top: getCenterDotTop() + 'px', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 10, 
                pointerEvents: 'none', 
                position: 'absolute' 
              }"
            ></div>
            <div
              v-for="(sensor, index) in sensorData"
              :key="sensor.id"
              class="sensor-icon"
              :class="{ 'sensor-icon-active': selectedSensorId === sensor.id }" 
              :style="getIconStyle(sensor)"
              @click="handleSensorIconClick(sensor)"
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
import { ref, onMounted, onBeforeUnmount, reactive, computed, watch, nextTick } from 'vue'
import { findAll } from '@/api/jsonApi'
import { vehicle_anchor_patch, vehicle_anchor_get } from '@/api/api'
import gostore from '@/services/governance-store'
import { ElMessage } from 'element-plus'

const vehicleImage = 'http://localhost:8083/apps/systemanage/img/st_car.jpg'

const physicalData = reactive([
  { param: 'Length', value: '4.3', unit: 'm' },
  { param: 'Width', value: '2.1', unit: 'm' },
  { param: 'Height', value: '2.6', unit: 'm' },
  { param: 'Physical dimen', value: '0', unit: 'm' }
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
])

const imageRef = ref<HTMLImageElement | null>(null)
const rightPanelRef = ref<HTMLDivElement | null>(null)
const sensorTableRef = ref<any>(null) 
const imageSize = ref({ width: 0, height: 0 })
const scale = ref(1)
// 新增：用于存储当前选中的传感器 ID
const selectedSensorId = ref<number | null>(null)
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

// 处理输入事件
const handleInput = (row, value) => {
  // 只允许数字、小数点和负号
  let cleanedValue = value.replace(/[^0-9.-]/g, '')
  
  // 处理多个小数点的情况
  if (cleanedValue.split('.').length > 2) {
    const parts = cleanedValue.split('.')
    cleanedValue = parts[0] + '.' + parts.slice(1).join('')
  }
  
  // 限制小数位数（可以根据需要调整）
  if (cleanedValue.includes('.')) {
    const parts = cleanedValue.split('.')
    if (parts[1].length > 2) {
      cleanedValue = `${parts[0]}.${parts[1].slice(0, 2)}`
    }
  }
  
  // 更新值
  row.value = cleanedValue
  
  // 触发父组件的变更事件
  onPhysicalChange()
}

// 输入验证
const validateInput = (row) => {
  const value = parseFloat(row.value)
  
  // 检查是否为有效数字
  if (row.value && isNaN(value)) {
    row.value = ''
    return
  }
  
  // 检查范围限制
  if (row.min !== undefined && value < row.min) {
    row.value = row.min.toString()
  } else if (row.max !== undefined && value > row.max) {
    row.value = row.max.toString()
  }
}

// 父组件变更事件
const onPhysicalChange = async() => {
  await updataAnchors()
}

const updataAnchors = async () => {
  const anchors = {
    physicalDimension: physicalData,
    sensorPoints: sensorData
  }
  const v_id = currentViewport.value.id
  vehicle_anchor_patch(anchors).then(() => {
    updateImageSize()
  }).catch((err) => {
    console.log(err, 'err')
  })
}

// 坐标转换函数：将固定坐标系转换为基于移动中心点的坐标系
const convertToCenterBasedCoordinates = (sensor) => {
  if (!length.value || !physicalDimen.value) return sensor;
  
  // 计算中心点相对于图片中心的偏移量（以米为单位）
  const centerOffsetInMeters = (length.value / 2) - physicalDimen.value;
  
  // 转换Y坐标：从固定坐标系转换为基于中心点的坐标系
  // 在固定坐标系中，图片中心是0，现在横轴位置是0
  // 注意：Y轴方向是上正下负
  const convertedY = sensor.y - centerOffsetInMeters;
  
  return {
    ...sensor,
    y: convertedY
  };
};

function getIconStyle(sensor) {
  // 以移动的中心点为(0,0)
  if (!imageSize.value.width || !imageSize.value.height || !width.value || !length.value) return {};
  const pxPerMeterX = imageSize.value.width / width.value;
  const pxPerMeterY = imageSize.value.height / length.value;
  const centerX = imageSize.value.width / 2;
  const centerY = getCenterDotTop(); // 使用移动的中心点作为0,0点
  
  // 转换传感器坐标
  const convertedSensor = convertToCenterBasedCoordinates(sensor);
  
  // x: 右为正，左为负；y: 上为正，下为负
  const left = centerX + (convertedSensor.x || 0) * pxPerMeterX;
  const top = centerY - (convertedSensor.y || 0) * pxPerMeterY; // 上正下负
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
const physicalDimen = computed(() => getPhysicalValue('Physical dimen'))

const TICK_SEGMENTS = 3; // 分三段
const rulerTicks = computed(() => {
  if (!imageSize.value.height || length.value === 0) return [];
  const ticks = [];
  const total = length.value;
  const half = total / 2;
  const step = half / TICK_SEGMENTS;
  const pxPerMeter = imageSize.value.height / total;
  const center = imageSize.value.height / 2; // 标尺位置固定
  
  for (let i = -TICK_SEGMENTS; i <= TICK_SEGMENTS; i++) {
    const top = center - i * step * pxPerMeter; // 标尺位置固定
    const isMajor = i === 0 || Math.abs(i) === TICK_SEGMENTS;
    
    // 计算基于横轴位置的数值，上正下负
    // 根据length值动态计算坐标范围
    let displayValue;
    if (i === 0) {
      // 中心点（横轴位置）显示0
      displayValue = 0;
    } else if (i < 0) {
      // 上方区域：显示负值 0 到 -length/2
      const maxNegative = length.value / 2; // 最大负值
      const negativeStep = maxNegative / TICK_SEGMENTS;
      displayValue = -(Math.abs(i) * negativeStep);
    } else {
      // 下方区域：显示正值 0 到 length/2
      const maxPositive = length.value / 2; // 最大正值
      const positiveStep = maxPositive / TICK_SEGMENTS;
      displayValue = i * positiveStep;
    }
    
    ticks.push({
      value: displayValue.toFixed(2),
      label: isMajor ? displayValue.toFixed(2) : '',
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
  const center = imageSize.value.width / 2; // 水平标尺中心固定
  for (let i = -TICK_SEGMENTS; i <= TICK_SEGMENTS; i++) {
    const value = -i * (width.value / 2 / TICK_SEGMENTS); // 左正右负：根据width值动态计算
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

// 纵向标尺小格子
const rulerSubTicks = computed(() => {
  if (!imageSize.value.height || length.value === 0) return [];
  const ticks = [];
  const total = length.value;
  const half = total / 2;
  const N = TICK_SEGMENTS;
  const step = half / N;
  const pxPerMeter = imageSize.value.height / total;
  const center = imageSize.value.height / 2; // 标尺位置固定
  for (let i = -N; i < N; i++) {
    const start = center - i * step * pxPerMeter;
    const end = center - (i + 1) * step * pxPerMeter;
    for (let j = 1; j < 10; j++) {
      const t = j / 10;
      const top = start + (end - start) * t;
      ticks.push({ top });
    }
  }
  return ticks;
});
// 横向标尺小格子
const horizontalRulerSubTicks = computed(() => {
  if (!imageSize.value.width || width.value === 0) return [];
  const ticks = [];
  const total = width.value;
  const half = total / 2;
  const N = TICK_SEGMENTS;
  const step = half / N;
  const pxPerMeter = imageSize.value.width / total;
  const center = imageSize.value.width / 2;
  for (let i = -N; i < N; i++) {
    const start = center + i * step * pxPerMeter;
    const end = center + (i + 1) * step * pxPerMeter;
    for (let j = 1; j < 10; j++) {
      const t = j / 10;
      const left = start + (end - start) * t;
      ticks.push({ left });
    }
  }
  return ticks;
});

// 新增：处理表格行点击事件
const handleTableRowClick = (row: SensorPoint) => {
  selectedSensorId.value = row.id;
  scrollToSensorIcon(row.id);
};

// 新增：处理传感器图标点击事件
const handleSensorIconClick = (sensor: SensorPoint) => {
  selectedSensorId.value = sensor.id;
  highlightTableRow(sensor.id);
};

// 新增：为表格行添加类名
const tableRowClassName = ({ row }: { row: SensorPoint }) => {
  return row.id === selectedSensorId.value ? 'selected-row' : '';
};

// 新增：高亮表格行
const highlightTableRow = (sensorId: number) => {
  // Element Plus 的 el-table 没有直接的 API 来高亮行，
  // 但可以通过设置当前行来实现类似效果（如果需要选中行功能，可以使用 selection）
  // 或者通过 CSS 类名 (已在 tableRowClassName 中实现)
  // 这里我们主要依赖 tableRowClassName 和 selectedSensorId
};

// 新增：滚动到传感器图标（可选增强功能）
const scrollToSensorIcon = (sensorId: number) => {
  nextTick(() => {
     // 查找对应的图标元素
    const iconElement = document.querySelector(`.sensor-icon[data-sensor-id="${sensorId}"]`);
    if (iconElement) {
      // 获取 .vehicle-container 容器
      const container = document.querySelector('.vehicle-container');
      if (container) {
        // 计算图标相对于容器的位置
        const containerRect = container.getBoundingClientRect();
        const iconRect = iconElement.getBoundingClientRect();

        // 计算滚动偏移量，使图标居中
        const scrollLeft = iconRect.left - containerRect.left - container.clientWidth / 2 + iconRect.width / 2;
        const scrollTop = iconRect.top - containerRect.top - container.clientHeight / 2 + iconRect.height / 2;

        // 执行滚动
        container.scrollBy({
          left: scrollLeft,
          top: scrollTop,
          behavior: 'smooth' // 平滑滚动
        });
      }
    }
  });
};

const currentViewport = ref<any>(null)
const queryCurrentDrivers = () => {
  try {
    findAll('/models/viewports', {'filter[using]': true}).then((res: any) => {
      gostore.reset()
      gostore.sync(res.data)
      const datavalue = gostore.findAll('viewports')
      if(datavalue.length > 0) {
        currentViewport.value = datavalue[0]
      }
    }).catch((err: any) => {
      console.log(err, 'err')
    })
  } catch (error) {
    console.error(error)
  }
}

const queryVehicleAnchor = () => {
  vehicle_anchor_get().then((res: any) => {
   if (res.data) {
    if (res.data.physicalDimension) {
      physicalData.splice(0, physicalData.length, ...res.data.physicalDimension)
    }
    if (res.data.sensorPoints) {
      // 清空原数组并添加新数据
      sensorData.splice(0, sensorData.length, ...res.data.sensorPoints)
    }
   }
  }).catch((err: any) => {
    console.log(err, 'err')
  })
}

// 导出
function onExport() {
  const vehicle_anchor = {
    physicalDimension: physicalData,
    sensorPoints: sensorData
  }
  const dataStr = JSON.stringify(vehicle_anchor, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vehicle_anchor.json';
  a.click();
  URL.revokeObjectURL(url);
}

// 导入
function onImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event: any) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && data.physicalDimension && data.sensorPoints) {
          physicalData.splice(0, physicalData.length, ...data.physicalDimension)
          sensorData.splice(0, sensorData.length, ...data.sensorPoints);
          const vehicle_anchor = {
            physicalDimension: physicalData,
            sensorPoints: sensorData
          }
          vehicle_anchor_patch(vehicle_anchor).then(() => {
            updateImageSize()
            ElMessage.success('Import success')
          }).catch((err) => {
            console.log(err, 'err')
          })
        } else {
          ElMessage.error('Import format error')
        }
      } catch (err) {
        alert('Import error' + err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

onMounted(() => {
  queryCurrentDrivers()
  queryVehicleAnchor()
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

// 新增：计算中心点 Y 轴位置
const getCenterDotTop = () => {
  if (!imageSize.value.height || !length.value || !physicalDimen.value) return imageSize.value.height / 2;
  
  // 计算中心点位置：从图片底部向上 physicalDimen 的距离
  const pxPerMeter = imageSize.value.height / length.value;
  const centerY = imageSize.value.height - (physicalDimen.value * pxPerMeter);
  
  return centerY;
};
</script>

<style lang="scss" scoped>
.car-sensor-config {
  display: flex;
  height: 100%;
  width: 100%;
}

.left-panel {
  width: 600px;
  display: flex;
  flex-direction: column;
  // gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  background: #f9f9f9;
  border-right: 1px solid #ddd;
  min-width: 60px;
  min-height: 0;
}

.physical-card {
  height: 270px; 
  overflow: auto;
  margin-bottom: 10px; 
}

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
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #fff;
}
.vehicle-area {
  display: flex;
  align-items: flex-start;
}
.vehicle-main {
  display: flex;
  flex-direction: column;
}
.vehicle-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 50;
}
.vehicle-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;    
  border: 2px solid #000;
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
  /* pointer-events: none; */
  transition: transform 0.2s ease;
  cursor: pointer; /* 添加鼠标指针 */
  z-index: 20; /* 提高 z-index 确保在标尺之上 */
}

/* 新增：传感器图标高亮样式 */
.sensor-icon.sensor-icon-active {
  background-color: orange; /* 或者其他你喜欢的高亮颜色 */
  transform: translate(-50%, -50%) scale(1.2); /* 稍微放大 */
  box-shadow: 0 0 8px rgba(255, 165, 0, 0.8); /* 添加发光效果 */
  z-index: 21; /* 确保高亮的图标在最上层 */
}

.horizontal-ruler {
  position: relative;
  width: 100%;
  height: 32px;
  z-index: 100;
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
  /* width: 3px !important;
  height: 3px !important; */
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

/* 新增：表格行高亮样式 */
:deep(.selected-row) {
  background-color: #e6f7ff !important; /* Element Plus 主题色的浅蓝色 */
  font-weight: bold;
}
:deep(.selected-row:hover) {
  background-color: #d1e7ff !important; /* 悬停时的颜色 */
}
.ruler-subtick {
  position: absolute;
  left: 0;
  width: 8px;
  height: 1px;
  background: #bbb;
  z-index: 90;
}
.ruler-subtick-horizontal {
  position: absolute;
  top: 0;
  width: 1px;
  height: 8px;
  background: #bbb;
  z-index: 90;
}
</style>
