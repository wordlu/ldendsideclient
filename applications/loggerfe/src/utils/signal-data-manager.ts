// 信号数据管理器
import { RosTopicMessage } from './flatbuffers-parser';

export interface SignalDataPoint {
  timestamp: number;  // 时间戳（毫秒）
  value: number;      // 信号值
  rawValue?: any;     // 原始值
}

export interface SignalData {
  signalName: string;           // 信号名称
  signalId?: string;           // 信号ID
  dataPoints: SignalDataPoint[]; // 数据点数组
  maxDataPoints: number;       // 最大数据点数量
  lastUpdateTime: number;      // 最后更新时间
}

export class SignalDataManager {
  private signals: Map<string, SignalData> = new Map();
  private maxDataPoints: number = 100; // 默认最大数据点数量
  private dataUpdateCallbacks: Map<string, (data: SignalData) => void> = new Map();

  constructor(maxDataPoints: number = 100) {
    this.maxDataPoints = maxDataPoints;
  }

  /**
   * 设置最大数据点数量
   */
  public setMaxDataPoints(maxPoints: number): void {
    this.maxDataPoints = maxPoints;
    // 更新所有现有信号的数据点数量
    this.signals.forEach(signal => {
      signal.maxDataPoints = maxPoints;
      this.trimDataPoints(signal);
    });
  }

  /**
   * 添加或更新信号数据
   */
  public addSignalData(signalName: string, value: number, timestamp?: number, signalId?: string): void {
    const now = timestamp || Date.now();
    
    if (!this.signals.has(signalName)) {
      // 创建新的信号数据
      const signalData: SignalData = {
        signalName,
        signalId,
        dataPoints: [],
        maxDataPoints: this.maxDataPoints,
        lastUpdateTime: now
      };
      this.signals.set(signalName, signalData);
    }

    const signal = this.signals.get(signalName)!;
    
    // 添加新的数据点
    const dataPoint: SignalDataPoint = {
      timestamp: now,
      value: value,
      rawValue: value
    };
    
    signal.dataPoints.push(dataPoint);
    signal.lastUpdateTime = now;
    
    // 限制数据点数量
    this.trimDataPoints(signal);
    
    // 通知监听器
    this.notifyDataUpdate(signalName, signal);
  }

  /**
   * 从 ROS 消息中提取信号数据
   */
  public processRosMessage(message: RosTopicMessage): void {
    try {
      if (message.data.raw_str && message.data.raw_str.raw_data) {
        const rawData = message.data.raw_str.raw_data;
        
        // 尝试解析信号数据
        this.parseSignalDataFromMessage(message.topic_name, rawData, message.timestamp);
      }
    } catch (error) {
      console.error('处理 ROS 消息失败:', error);
    }
  }

  /**
   * 从消息中解析信号数据
   */
  private parseSignalDataFromMessage(topicName: string, rawData: string, timestamp: number): void {
    try {
      // 尝试解析为 JSON
      const data = JSON.parse(rawData);
      
      if (data.signals) {
        // 如果有 signals 字段，遍历所有信号
        Object.keys(data.signals).forEach(signalName => {
          const value = data.signals[signalName];
          if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            this.addSignalData(signalName, numValue, timestamp / 1000000, topicName);
          }
        });
      } else {
        // 尝试从其他字段中提取数值
        Object.keys(data).forEach(key => {
          const value = data[key];
          if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            this.addSignalData(key, numValue, timestamp / 1000000, topicName);
          }
        });
      }
    } catch {
      // 如果不是 JSON，尝试其他解析方式
      this.parseTextSignalData(topicName, rawData, timestamp);
    }
  }

  /**
   * 解析文本格式的信号数据
   */
  private parseTextSignalData(topicName: string, rawData: string, timestamp: number): void {
    // 尝试解析格式：signal_name=value
    const pattern = /(\w+)=([^,\s]+)/g;
    let match;
    
    while ((match = pattern.exec(rawData)) !== null) {
      const signalName = match[1];
      const valueStr = match[2];
      const value = parseFloat(valueStr);
      
      if (!isNaN(value)) {
        this.addSignalData(signalName, value, timestamp / 1000000, topicName);
      }
    }
  }

  /**
   * 限制数据点数量
   */
  private trimDataPoints(signal: SignalData): void {
    if (signal.dataPoints.length > signal.maxDataPoints) {
      signal.dataPoints = signal.dataPoints.slice(-signal.maxDataPoints);
    }
  }

  /**
   * 获取信号数据
   */
  public getSignalData(signalName: string): SignalData | undefined {
    return this.signals.get(signalName);
  }

  /**
   * 获取所有信号名称
   */
  public getAllSignalNames(): string[] {
    return Array.from(this.signals.keys());
  }

  /**
   * 获取信号的图表数据
   */
  public getChartData(signalName: string): { times: string[], values: number[] } | null {
    const signal = this.signals.get(signalName);
    if (!signal || signal.dataPoints.length === 0) {
      return null;
    }

    const times: string[] = [];
    const values: number[] = [];

    // 滚动图表：固定显示30个数据点，新数据从右边进入
    const maxPoints = 30; // 固定显示30个点
    const recentDataPoints = signal.dataPoints.slice(-maxPoints);

    // 如果数据点不足30个，用空值填充左边
    if (recentDataPoints.length < maxPoints) {
      const emptyCount = maxPoints - recentDataPoints.length;
      for (let i = 0; i < emptyCount; i++) {
        times.push('');
        values.push(0);
      }
    }

    // 添加实际数据点
    recentDataPoints.forEach(point => {
      const date = new Date(point.timestamp);
      
      // 格式化时间，显示精确到秒
      const timeString = date.toLocaleTimeString('zh-CN', { 
        hour12: false, 
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      times.push(timeString);
      values.push(point.value);
    });

    return { times, values };
  }

  /**
   * 获取信号的实时值
   */
  public getCurrentValue(signalName: string): number | null {
    const signal = this.signals.get(signalName);
    if (signal && signal.dataPoints.length > 0) {
      return signal.dataPoints[signal.dataPoints.length - 1].value;
    }
    return null;
  }

  /**
   * 获取信号的统计信息
   */
  public getSignalStats(signalName: string): { min: number, max: number, avg: number } | null {
    const signal = this.signals.get(signalName);
    if (!signal || signal.dataPoints.length === 0) {
      return null;
    }

    const values = signal.dataPoints.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;

    return { min, max, avg };
  }

  /**
   * 清除信号数据
   */
  public clearSignalData(signalName: string): void {
    this.signals.delete(signalName);
  }

  /**
   * 清除所有信号数据
   */
  public clearAllData(): void {
    this.signals.clear();
  }

  /**
   * 添加数据更新回调
   */
  public onDataUpdate(signalName: string, callback: (data: SignalData) => void): void {
    this.dataUpdateCallbacks.set(signalName, callback);
  }

  /**
   * 移除数据更新回调
   */
  public removeDataUpdateCallback(signalName: string): void {
    this.dataUpdateCallbacks.delete(signalName);
  }

  /**
   * 通知数据更新
   */
  private notifyDataUpdate(signalName: string, signal: SignalData): void {
    const callback = this.dataUpdateCallbacks.get(signalName);
    if (callback) {
      try {
        callback(signal);
      } catch (error) {
        console.error('数据更新回调执行失败:', error);
      }
    }
  }

  /**
   * 获取数据摘要
   */
  public getDataSummary(): { totalSignals: number, totalDataPoints: number } {
    let totalDataPoints = 0;
    this.signals.forEach(signal => {
      totalDataPoints += signal.dataPoints.length;
    });

    return {
      totalSignals: this.signals.size,
      totalDataPoints
    };
  }

  /**
   * 导出信号数据
   */
  public exportSignalData(signalName: string): string | null {
    const signal = this.signals.get(signalName);
    if (!signal) return null;

    const csvData = [
      ['Timestamp', 'Value'],
      ...signal.dataPoints.map(point => [
        new Date(point.timestamp).toISOString(),
        point.value.toString()
      ])
    ];

    return csvData.map(row => row.join(',')).join('\n');
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.signals.clear();
    this.dataUpdateCallbacks.clear();
  }
}
