<template>
  <div class="simple-ecg-chart">
    <div class="chart-header">
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
    
    <div class="chart-container">
      <canvas 
        ref="chartCanvas" 
        class="chart-canvas"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted, watch } from 'vue';
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
      
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
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
      
      // 重置透明度
      ctx.globalAlpha = 1.0;
      
      // 绘制信号
      const signalArray = Array.from(signals.value.values());
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
        const scaleY = containerHeight * 0.4; // 使用容器高度的40%作为缩放
        
        signal.values.forEach((value, i) => {
          const x = i * stepX;
          const y = centerY - (value * scaleY / 100); // 改进的缩放算法
          
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
      const fontSize = Math.max(10, containerHeight / 20); // 根据容器高度调整字体大小
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = '#fff';
      
      signalArray.forEach((signal, index) => {
        const x = 10;
        const y = 20 + index * (fontSize + 8);
        
        // 绘制颜色块
        ctx.fillStyle = signal.color;
        ctx.fillRect(x, y - fontSize/2, 15, 3);
        
        // 绘制信号名称
        ctx.fillStyle = '#fff';
        const displayValue = signal.values[signal.values.length - 1]?.toFixed(6) || '0.000000';
        ctx.fillText(`${signal.name}: ${displayValue}`, x + 20, y);
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

        websocketManager.value.addMessageHandler(processMessage);

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
</style>
