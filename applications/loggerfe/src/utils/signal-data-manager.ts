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
  private maxDataPoints = 100; // 默认最大数据点数量
  private dataUpdateCallbacks: Map<string, (data: SignalData) => void> = new Map();

  constructor(maxDataPoints = 100) {
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
    console.log(`=== 添加信号数据: ${signalName} = ${value} ===`);
    console.log('信号名称:', signalName);
    console.log('信号值:', value);
    console.log('时间戳:', timestamp);
    console.log('信号ID:', signalId);
    
    const now = timestamp || Date.now();
    console.log('使用的时间戳:', now);
    
    if (!this.signals.has(signalName)) {
      console.log('创建新的信号数据对象');
      // 创建新的信号数据
      const signalData: SignalData = {
        signalName,
        signalId,
        dataPoints: [],
        maxDataPoints: this.maxDataPoints,
        lastUpdateTime: now
      };
      this.signals.set(signalName, signalData);
      console.log('新信号数据已创建:', signalData);
    } else {
      console.log('使用现有信号数据');
    }

    const signal = this.signals.get(signalName)!;
    console.log('当前信号数据:', signal);
    console.log('当前数据点数量:', signal.dataPoints.length);
    
    // 添加新的数据点
    const dataPoint: SignalDataPoint = {
      timestamp: now,
      value: value,
      rawValue: value
    };
    
    console.log('添加新数据点:', dataPoint);
    signal.dataPoints.push(dataPoint);
    signal.lastUpdateTime = now;
    console.log('数据点添加后数量:', signal.dataPoints.length);
    
    // 限制数据点数量
    this.trimDataPoints(signal);
    console.log('数据点修剪后数量:', signal.dataPoints.length);
    
    // 通知监听器
    console.log('通知数据更新监听器...');
    this.notifyDataUpdate(signalName, signal);
    console.log('=== 信号数据添加完成 ===');
  }

  /**
   * 从 ROS 消息中提取信号数据
   */
  public processRosMessage(message: RosTopicMessage): void {
    console.log('=== 信号数据管理器处理 ROS 消息 ===');
    console.log('完整消息:', JSON.stringify(message, null, 2));
    
    try {
      // 直接处理CAN信号数据
      if (message.data.can_signals && message.data.can_signals.signals) {
        console.log('=== 处理CAN信号数据 ===');
        console.log('can_signals对象:', message.data.can_signals);
        console.log('信号数量:', message.data.can_signals.signals.length);
        
        message.data.can_signals.signals.forEach((signal: any, index: number) => {
          console.log(`信号 ${index + 1} 完整对象:`, signal);
          console.log(`信号 ${index + 1} 字段:`, {
            id: signal.id,
            messageName: signal.messageName,
            nodeName: signal.nodeName,
            signalName: signal.signalName,
            unit: signal.unit,
            value: signal.value
          });
          
          if (signal.signalName && typeof signal.value === 'number') {
            console.log(`添加信号数据: ${signal.signalName} = ${signal.value}`);
            this.addSignalData(signal.signalName, signal.value, message.timestamp / 1000000);
          }
        });
      } else if (message.data.raw_str && message.data.raw_str.raw_data) {
        console.log('=== 处理原始字符串数据 ===');
        console.log('raw_str对象:', message.data.raw_str);
        console.log('原始数据:', message.data.raw_str.raw_data);
        this.parseSignalDataFromMessage(message.topic_name, message.data.raw_str.raw_data, message.timestamp);
      } else {
        console.log('=== 其他格式数据 ===');
        console.log('data字段:', message.data);
        console.log('data字段类型:', typeof message.data);
        console.log('data字段键:', Object.keys(message.data || {}));
      }
    } catch (error) {
      console.error('处理 ROS 消息失败:', error);
      console.error('错误详情:', error);
    }
  }

  /**
   * 从消息中解析信号数据
   */
  private parseSignalDataFromMessage(topicName: string, rawData: string, timestamp: number): void {
    console.log('=== 解析信号数据开始 ===');
    console.log('话题名称:', topicName);
    console.log('原始数据:', rawData);
    console.log('时间戳:', timestamp);
    
    try {
      // 尝试解析为 JSON
      console.log('尝试解析为 JSON...');
      const data = JSON.parse(rawData);
      console.log('JSON 解析成功:', data);
      
      if (data.signals) {
        console.log('找到 signals 字段:', data.signals);
        // 如果有 signals 字段，遍历所有信号
        Object.keys(data.signals).forEach(signalName => {
          const value = data.signals[signalName];
          console.log(`处理信号 ${signalName}:`, value, '类型:', typeof value);
          if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            console.log(`添加信号数据: ${signalName} = ${numValue}`);
            this.addSignalData(signalName, numValue, timestamp / 1000000, topicName);
          } else {
            console.log(`信号 ${signalName} 的值不是数字，跳过:`, value);
          }
        });
      } else {
        console.log('没有 signals 字段，尝试从其他字段提取数值');
        // 尝试从其他字段中提取数值
        Object.keys(data).forEach(key => {
          const value = data[key];
          console.log(`检查字段 ${key}:`, value, '类型:', typeof value);
          if (typeof value === 'number' || !isNaN(parseFloat(value))) {
            const numValue = typeof value === 'number' ? value : parseFloat(value);
            console.log(`添加信号数据: ${key} = ${numValue}`);
            this.addSignalData(key, numValue, timestamp / 1000000, topicName);
          } else {
            console.log(`字段 ${key} 的值不是数字，跳过:`, value);
          }
        });
      }
    } catch (jsonError) {
      console.log('JSON 解析失败，尝试文本解析:', jsonError);
      // 如果不是 JSON，尝试其他解析方式
      this.parseTextSignalData(topicName, rawData, timestamp);
    }
    
    console.log('=== 解析信号数据结束 ===');
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
