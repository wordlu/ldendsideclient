<template>
  <div class="simple-ecg-chart" :class="{ 'fullscreen-mode': isFullscreen }">
    <div class="chart-header" v-if="!isFullscreen">
      <h3>实时信号监控</h3>
      <div class="status-info">
        <el-tag :type="connectionStatus.type" size="small">
          {{ connectionStatus.text }}
        </el-tag>
        <el-tag type="info" size="small">
          信号数: {{ signalCount }}
        </el-tag>
      </div>
    </div>
    
    <div class="chart-container" :class="{ 'fullscreen-chart': isFullscreen }">
      <canvas 
        ref="chartCanvas" 
        class="chart-canvas"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { ElMessage } from 'element-plus';
import { WebSocketManager, RosTopicMessage } from '@/utils/websocket-manager';

interface SignalData {
  name: string;
  values: number[];
  color: string;
}

export default defineComponent({
  name: 'SimpleEcgChart',
  props: {
    selectedSignals: {
      type: Array,
      default: () => []
    },
    websocketConnected: {
      type: Boolean,
      default: false
    },
    signalData: {
      type: Object,
      default: () => ({})
    },
    signalColors: {
      type: Map,
      default: () => new Map()
    },
    isFullscreen: {
      type: Boolean,
      default: false
    },
    yAxisRange: {
      type: Object,
      default: () => null
    }
  },
  setup(props) {
    // 响应式数据
    const websocketManager = ref<WebSocketManager | null>(null);
    const chartCanvas = ref<HTMLCanvasElement | null>(null);
    const isConnected = ref(false);
    const signalCount = ref(0);
    
    // 信号数据存储
    const signals = ref<Map<string, SignalData>>(new Map());
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    
    let animationId: number | null = null;

    // 计算属性
    const connectionStatus = computed(() => ({
      type: props.websocketConnected ? 'success' : 'danger',
      text: props.websocketConnected ? '已连接' : '未连接'
    }));

    // 绘制图表
    const drawChart = () => {
      if (!chartCanvas.value) {
        console.log('Canvas元素不存在');
        return;
      }
      
      const ctx = chartCanvas.value.getContext('2d');
      if (!ctx) {
        console.log('无法获取Canvas上下文');
        return;
      }
      
      // 获取容器尺寸
      const container = chartCanvas.value.parentElement;
      if (!container) return;
      
      let containerWidth = container.clientWidth;
      let containerHeight = container.clientHeight;
      
      // 全屏模式下的特殊处理
      if (props.isFullscreen) {
        // 使用视口尺寸，确保完全填充
        containerWidth = window.innerWidth;
        containerHeight = window.innerHeight - 60; // 减去头部高度
        
        // 确保尺寸为正数
        if (containerWidth <= 0) containerWidth = window.innerWidth;
        if (containerHeight <= 0) containerHeight = window.innerHeight - 60;
        
        // 全屏模式下确保有足够的边距
        const margin = 20;
        containerWidth = Math.max(containerWidth - margin * 2, 800);
        containerHeight = Math.max(containerHeight - margin * 2, 600);
        
        console.log('全屏模式尺寸:', containerWidth, containerHeight);
      }
      
      // 设置Canvas实际尺寸
      chartCanvas.value.width = containerWidth;
      chartCanvas.value.height = containerHeight;
      
      // 清空画布
      ctx.clearRect(0, 0, containerWidth, containerHeight);
      
      // 设置背景
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, containerWidth, containerHeight);
      
      // 绘制网格
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.6;
      
      // 水平网格线
      const horizontalLines = 6;
      for (let i = 0; i <= horizontalLines; i++) {
        const y = (containerHeight / horizontalLines) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(containerWidth, y);
        ctx.stroke();
      }
      
      // 垂直网格线
      const verticalLines = 8;
      for (let i = 0; i <= verticalLines; i++) {
        const x = (containerWidth / verticalLines) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, containerHeight);
        ctx.stroke();
      }
      
      // 全屏模式下绘制中心线
      if (props.isFullscreen) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.moveTo(0, containerHeight / 2);
        ctx.lineTo(containerWidth, containerHeight / 2);
        ctx.stroke();
      }
      
      // 重置透明度
      ctx.globalAlpha = 1.0;
      
      // 计算信号数据的范围
      const calculateSignalRange = (signal: SignalData) => {
        if (signal.values.length === 0) return { min: 0, max: 0, range: 0 };
        
        const min = Math.min(...signal.values);
        const max = Math.max(...signal.values);
        const range = max - min;
        
        return { min, max, range };
      };

      // 计算所有信号的整体范围
      const calculateOverallRange = () => {
        // 如果提供了手动设置的Y轴范围，使用它
        if (props.yAxisRange && props.yAxisRange.min !== undefined && props.yAxisRange.max !== undefined) {
          return {
            min: props.yAxisRange.min,
            max: props.yAxisRange.max,
            range: props.yAxisRange.max - props.yAxisRange.min
          };
        }
        
        const signalArray = Array.from(signals.value.values());
        if (signalArray.length === 0) return { min: -100, max: 100, range: 200 };
        
        let globalMin = Infinity;
        let globalMax = -Infinity;
        
        signalArray.forEach(signal => {
          const range = calculateSignalRange(signal);
          globalMin = Math.min(globalMin, range.min);
          globalMax = Math.max(globalMax, range.max);
        });
        
        // 添加一些边距
        const margin = Math.max((globalMax - globalMin) * 0.1, 1);
        globalMin -= margin;
        globalMax += margin;
        
        // 确保范围不为0
        if (globalMax === globalMin) {
          globalMin -= 1;
          globalMax += 1;
        }
        
        return {
          min: globalMin,
          max: globalMax,
          range: globalMax - globalMin
        };
      };

      // 绘制信号
      const signalArray = Array.from(signals.value.values());
      const overallRange = calculateOverallRange();
      
      // 全屏模式下显示范围信息
      if (props.isFullscreen) {
        console.log('数据范围:', overallRange);
        console.log('信号数量:', signalArray.length);
        
        // 绘制Y轴标签
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        // 最大值标签
        ctx.fillText(`Max: ${overallRange.max.toFixed(2)}`, 10, 20);
        // 最小值标签
        ctx.fillText(`Min: ${overallRange.min.toFixed(2)}`, 10, containerHeight - 10);
        // 中心值标签
        const centerValue = (overallRange.max + overallRange.min) / 2;
        ctx.fillText(`Center: ${centerValue.toFixed(2)}`, 10, containerHeight / 2);
      }
      
      signalArray.forEach((signal) => {
        if (signal.values.length < 2) return;
        
        ctx.strokeStyle = signal.color;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = signal.color;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        
        const stepX = containerWidth / signal.values.length;
        const centerY = containerHeight / 2;
        const scaleY = containerHeight * 0.8; // 使用容器高度的80%作为缩放范围
        
        signal.values.forEach((value, i) => {
          const x = i * stepX;
          // 将值映射到0-1范围，然后映射到Y坐标
          const normalizedValue = (value - overallRange.min) / overallRange.range;
          const y = centerY - (normalizedValue - 0.5) * scaleY;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
        
        // 重置阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });
      
      // 绘制图例
      let fontSize = 12; // 默认字体大小
      if (props.isFullscreen) {
        fontSize = 18; // 全屏模式下使用更大的字体
      } else {
        fontSize = Math.max(10, containerHeight / 20); // 根据容器高度调整字体大小
      }
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = '#fff';
      
      signalArray.forEach((signal, index) => {
        let x = 15; // 左边距
        let y = 30 + index * (fontSize + 12); // 行间距和顶部边距
        
        // 全屏模式下的特殊调整
        if (props.isFullscreen) {
          x = 30; // 全屏模式下增加左边距
          y = 50 + index * (fontSize + 20); // 全屏模式下增加行间距和顶部边距
        }
        
        // 检查文本是否会超出Canvas边界
        const textY = y;
        const textHeight = fontSize;
        const bottomMargin = props.isFullscreen ? 40 : 20; // 全屏模式下增加底部边距
        
        if (textY + textHeight > containerHeight - bottomMargin) {
          console.log(`信号 ${signal.name} 的文本位置超出边界，跳过绘制`);
          return; // 跳过超出边界的文本
        }
        
        // 绘制颜色块
        ctx.fillStyle = signal.color;
        ctx.fillRect(x, y - fontSize + 2, 15, 3);
        
        // 绘制信号名称
        ctx.fillStyle = '#fff';
        const displayValue = signal.values[signal.values.length - 1]?.toFixed(6) || '0.000000';
        const text = `${signal.name}: ${displayValue}`;
        ctx.fillText(text, x + 20, y);
        
        // 全屏模式下添加调试信息
        if (props.isFullscreen) {
          console.log(`绘制信号文本: ${text}, 位置: (${x + 20}, ${y}), 容器尺寸: ${containerWidth}x${containerHeight}`);
        }
      });
    };

    // 动画循环
    const animate = () => {
      drawChart();
      animationId = requestAnimationFrame(animate);
    };

    // 处理信号数据更新
    const processSignalData = (signalData: any) => {
      console.log('SimpleEcgChart 接收到数据:', signalData);
      
      // 处理数组格式的数据
      if (Array.isArray(signalData)) {
        signalData.forEach(data => {
          if (data && data.signalName && typeof data.value === 'number') {
            processSingleSignal(data);
          }
        });
      } else if (signalData && signalData.signalName && typeof signalData.value === 'number') {
        // 处理单个信号数据
        processSingleSignal(signalData);
      }
    };
    
    // 处理单个信号数据
    const processSingleSignal = (signalData: any) => {
      const signalName = signalData.signalName;
      const value = signalData.value;
      
      // 获取当前勾选的信号名称列表
      const selectedSignalNames = props.selectedSignals.map((signal: any) => signal.label);
      
      // 只处理勾选的信号
      if (!selectedSignalNames.includes(signalName)) {
        console.log(`SimpleEcgChart 跳过未勾选信号: ${signalName}`);
        return;
      }
      
      console.log(`SimpleEcgChart 处理勾选信号: ${signalName} = ${value}`);
      
      if (!signals.value.has(signalName)) {
        // 优先使用父组件传递的颜色
        let signalColor = props.signalColors.get(signalName);
        
        // 如果没有传递颜色，使用默认颜色
        if (!signalColor) {
          const colorIndex = selectedSignalNames.indexOf(signalName);
          signalColor = colors[colorIndex % colors.length];
        }
        
        signals.value.set(signalName, {
          name: signalName,
          values: [],
          color: signalColor
        });
        console.log(`创建新信号: ${signalName}, 使用颜色: ${signalColor}`);
      }
      
      const signal = signals.value.get(signalName);
      if (!signal) return;
      
      signal.values.push(value);
      
      // 保持数据点数量限制
      if (signal.values.length > 100) {
        signal.values.shift();
      }
      
      signalCount.value = signals.value.size;
      console.log(`信号 ${signalName} 数据点数量: ${signal.values.length}, 总信号数: ${signalCount.value}`);
    };

    // 清理不再勾选的信号数据
    const cleanupUnselectedSignals = () => {
      const selectedSignalNames = props.selectedSignals.map((signal: any) => signal.label);
      const currentSignalNames = Array.from(signals.value.keys());
      
      currentSignalNames.forEach(signalName => {
        if (!selectedSignalNames.includes(signalName)) {
          console.log(`清理未勾选信号数据: ${signalName}`);
          signals.value.delete(signalName);
        }
      });
      
      signalCount.value = signals.value.size;
    };

    // 监听勾选信号变化
    watch(() => props.selectedSignals, () => {
      console.log('勾选信号发生变化:', props.selectedSignals);
      cleanupUnselectedSignals();
    }, { deep: true });

    // 监听信号数据变化
    watch(() => props.signalData, (newData) => {
      console.log('SimpleEcgChart 接收到新的信号数据:', newData);
      if (newData) {
        processSignalData(newData);
      }
    }, { deep: true });

    // 监听全屏模式变化
    watch(() => props.isFullscreen, (isFullscreen) => {
      console.log('全屏模式变化:', isFullscreen);
      if (isFullscreen) {
        // 全屏模式下，延迟一下再绘制，确保DOM已更新
        nextTick(() => {
          setTimeout(() => {
            console.log('全屏模式重绘图表');
            drawChart();
          }, 200);
        });
      }
    });

    // 初始化WebSocket
    const initWebSocket = () => {
      try {
        websocketManager.value = new WebSocketManager({
          url: 'ws://10.86.14.25:18011/ros_ws',
          reconnectInterval: 3000,
          maxReconnectAttempts: 10
        });

        websocketManager.value.addConnectionHandler((connected: boolean) => {
          isConnected.value = connected;
          if (connected) {
            ElMessage.success('WebSocket 连接已建立');
          } else {
            ElMessage.warning('WebSocket 连接已断开');
          }
        });

        // 不需要添加消息处理器，因为数据来自父组件

        websocketManager.value.connect().catch((error) => {
          console.error('WebSocket 连接失败:', error);
          ElMessage.error('WebSocket 连接失败');
        });

      } catch (error) {
        console.error('初始化 WebSocket 失败:', error);
        ElMessage.error('初始化 WebSocket 失败');
      }
    };


    // 窗口大小变化处理
    const handleResize = () => {
      // 重新绘制图表以适应新的容器大小
      if (chartCanvas.value) {
        drawChart();
      }
    };

    // 生命周期
    onMounted(() => {
      // 清空所有信号数据，确保没有测试数据残留
      signals.value.clear();
      signalCount.value = 0;
      console.log('SimpleEcgChart组件初始化，清空所有信号数据');
      
      // 不在这里初始化WebSocket，使用父组件的WebSocket连接
      // initWebSocket();
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
      
      // 开始动画
      animationId = requestAnimationFrame(animate);
      
      // 如果是全屏模式，延迟绘制确保尺寸正确
      if (props.isFullscreen) {
        nextTick(() => {
          setTimeout(() => {
            drawChart();
          }, 200);
        });
      }
    });

    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      // 清理事件监听器
      window.removeEventListener('resize', handleResize);
      // 不在这里销毁WebSocket，由父组件管理
      // if (websocketManager.value) {
      //   websocketManager.value.destroy();
      // }
    });

    return {
      chartCanvas,
      isConnected,
      signalCount,
      connectionStatus
    };
  }
});
</script>

<style scoped>
.simple-ecg-chart {
  padding: 10px;
  background: #1a1a1a;
  border-radius: 8px;
  color: white;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #333;
  flex-shrink: 0;
}

.chart-header h3 {
  margin: 0;
  color: #fff;
  font-size: 14px;
}

.status-info {
  display: flex;
  gap: 5px;
}

.chart-container {
  background: #1a1a1a;
  border-radius: 4px;
  flex: 1;
  min-height: 200px;
  position: relative;
  overflow: hidden;
}

.chart-canvas {
  display: block;
  background: #1a1a1a;
  width: 100%;
  height: 100%;
}

/* 全屏模式样式 */
.fullscreen-mode {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fullscreen-mode .chart-container.fullscreen-chart {
  height: 100%;
  width: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
}

.fullscreen-mode .chart-canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 100%;
  max-height: 100%;
}
</style>
