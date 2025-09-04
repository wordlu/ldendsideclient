// 模拟 WebSocket 服务器
// 用于测试和演示，生成模拟的 ROS 话题数据

export class MockWebSocketServer {
  private interval: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * 开始生成模拟数据
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('开始生成模拟 WebSocket 数据...');
    
    // 每 100ms 生成一次数据
    this.interval = setInterval(() => {
      this.generateMockData();
    }, 100);
  }

  /**
   * 停止生成模拟数据
   */
  public stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('停止生成模拟 WebSocket 数据');
  }

  /**
   * 生成模拟的 ROS 话题数据
   */
  private generateMockData(): void {
    const mockData = this.createMockRosMessage();
    console.log('模拟服务器生成数据:', mockData);
    
    // 模拟发送数据到 WebSocket 客户端
    if (typeof window !== 'undefined' && window.mockWebSocketClient) {
      console.log('调用 mockWebSocketClient.receiveMessage');
      window.mockWebSocketClient.receiveMessage(mockData);
    } else {
      console.log('mockWebSocketClient 不存在');
    }
  }

  /**
   * 创建模拟的 ROS 消息
   */
  private createMockRosMessage(): any {
    const now = Date.now() * 1000000; // 转换为纳秒
    
    // 模拟不同的信号数据
    const signals = {
      'speed': Math.random() * 100 + 20, // 速度: 20-120 km/h
      'rpm': Math.random() * 2000 + 800, // 转速: 800-2800 rpm
      'temperature': Math.random() * 30 + 70, // 温度: 70-100 °C
      'voltage': Math.random() * 2 + 12, // 电压: 12-14 V
      'pressure': Math.random() * 50 + 200, // 压力: 200-250 kPa
      'acceleration': (Math.random() - 0.5) * 10, // 加速度: -5 到 5 m/s²
      'steering_angle': (Math.random() - 0.5) * 60, // 转向角: -30 到 30 度
      'brake_pressure': Math.random() * 100, // 制动压力: 0-100 kPa
    };

    return {
      topic_name: 'vehicle_signals',
      topic_type: 0, // RawStr
      timestamp: now,
      data: {
        raw_str: {
          header: {
            stamp: now,
            frame_id: 'vehicle_frame',
            seq: Math.floor(Math.random() * 10000)
          },
          raw_data: JSON.stringify(signals),
          extra_data: 'Mock data for testing'
        }
      },
      extra_data: ''
    };
  }

  /**
   * 检查是否正在运行
   */
  public isActive(): boolean {
    return this.isRunning;
  }
}

// 在浏览器环境中设置全局模拟客户端
if (typeof window !== 'undefined') {
  (window as any).mockWebSocketClient = {
    receiveMessage: (message: any) => {
      // 这里可以用于调试，查看生成的消息
      console.log('全局模拟客户端接收到消息:', message);
    }
  };
}

// 导出实例
export const mockWebSocketServer = new MockWebSocketServer();
