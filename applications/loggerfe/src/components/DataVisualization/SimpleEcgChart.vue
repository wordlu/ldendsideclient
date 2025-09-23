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
        width="300" 
        height="200"
        class="chart-canvas"
      ></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import { WebSocketManager, RosTopicMessage } from '@/utils/websocket-manager';

interface SignalData {
  name: string;
  values: number[];
  color: string;
}

export default defineComponent({
  name: 'SimpleEcgChart',
  setup() {
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
      type: isConnected.value ? 'success' : 'danger',
      text: isConnected.value ? '已连接' : '未连接'
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
      
      // 清空画布
      ctx.clearRect(0, 0, 300, 200);
      
      // 设置背景
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 300, 200);
      
      // 绘制网格
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      
      // 水平网格线
      for (let i = 0; i <= 4; i++) {
        const y = (200 / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(300, y);
        ctx.stroke();
      }
      
      // 垂直网格线
      for (let i = 0; i <= 6; i++) {
        const x = (300 / 6) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 200);
        ctx.stroke();
      }
      
      // 绘制信号
      const signalArray = Array.from(signals.value.values());
      signalArray.forEach((signal) => {
        if (signal.values.length < 2) return;
        
        ctx.strokeStyle = signal.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const stepX = 300 / signal.values.length;
        const centerY = 100;
        const scaleY = 80;
        
        signal.values.forEach((value, i) => {
          const x = i * stepX;
          const y = centerY - value * 2; // 简单的缩放
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
      });
      
      // 绘制图例
      ctx.font = '12px Arial';
      ctx.fillStyle = '#fff';
      
      signalArray.forEach((signal, index) => {
        const x = 10;
        const y = 20 + index * 20;
        
        // 绘制颜色块
        ctx.fillStyle = signal.color;
        ctx.fillRect(x, y - 10, 15, 3);
        
        // 绘制信号名称
        ctx.fillStyle = '#fff';
        ctx.fillText(`${signal.name}: ${signal.values[signal.values.length - 1]?.toFixed(2) || '0.00'}`, x + 20, y);
      });
    };

    // 动画循环
    const animate = () => {
      drawChart();
      animationId = requestAnimationFrame(animate);
    };

    // 处理WebSocket消息
    const processMessage = (message: RosTopicMessage) => {
      console.log('SimpleEcgChart 接收到消息:', message);
      
      // 检查CAN信号数据
      if (message.data.can_signals && message.data.can_signals.signals) {
        const canSignals = message.data.can_signals.signals;
        console.log('CAN信号数据:', canSignals);
        
        canSignals.forEach((signal: unknown, index: number) => {
          const signalInfo = signal as Record<string, unknown>;
          const signalName = signalInfo.signalName as string;
          const value = signalInfo.value as number;
          
          if (!signals.value.has(signalName)) {
            signals.value.set(signalName, {
              name: signalName,
              values: [],
              color: colors[index % colors.length]
            });
          }
          
          const signalData = signals.value.get(signalName);
          if (!signalData) return;
          
          signalData.values.push(value);
          
          // 保持数据点数量限制
          if (signalData.values.length > 100) {
            signalData.values.shift();
          }
        });
        
        signalCount.value = signals.value.size;
      }
    };

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


    // 生命周期
    onMounted(() => {
      // 清空所有信号数据，确保没有测试数据残留
      signals.value.clear();
      signalCount.value = 0;
      console.log('SimpleEcgChart组件初始化，清空所有信号数据');
      
      initWebSocket();
      
      // 开始动画
      animationId = requestAnimationFrame(animate);
    });

    onUnmounted(() => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (websocketManager.value) {
        websocketManager.value.destroy();
      }
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
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #333;
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
  overflow: hidden;
}

.chart-canvas {
  display: block;
  background: #1a1a1a;
}
</style>
