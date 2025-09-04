// FlatBuffers 解析工具
// 基于提供的 fbs 文件结构进行数据解析

export interface Header {
  stamp: number;      // 时间戳（纳秒）
  frame_id: string;   // 帧 ID
  seq: number;        // 序列号
}

export interface RawStrData {
  header: Header;     // 标准 ROS Header 信息
  raw_data: string;   // 原始数据字符串
  extra_data: string; // 额外数据字符串
}

export enum TopicDataType {
  RawStr = 0,
  // 后续可以扩展更多类型
}

export interface TopicData {
  raw_str?: RawStrData;
  // 后续可以扩展更多类型
}

export interface RosTopicMessage {
  topic_name: string;     // 话题名称
  topic_type: TopicDataType; // 话题数据类型
  timestamp: number;      // 时间戳（纳秒）
  data: TopicData;        // 话题数据
  extra_data: string;     // 额外数据
}

// 简化的 FlatBuffers 解析器
// 由于无法安装 flatbuffers 库，这里提供一个基础的解析实现
export class FlatBuffersParser {
  
  /**
   * 解析接收到的二进制数据
   * @param buffer 二进制数据
   * @returns 解析后的消息对象
   */
  static parseMessage(buffer: ArrayBuffer): RosTopicMessage | null {
    try {
      // 将 ArrayBuffer 转换为 Uint8Array
      const uint8Array = new Uint8Array(buffer);
      
      // 这里是一个简化的解析实现
      // 实际项目中应该使用真正的 FlatBuffers 库
      return this.parseSimpleMessage(uint8Array);
    } catch (error) {
      console.error('解析 FlatBuffers 消息失败:', error);
      return null;
    }
  }
  
  /**
   * 简化的消息解析（用于演示）
   * 实际项目中应该使用真正的 FlatBuffers 库
   */
  private static parseSimpleMessage(data: Uint8Array): RosTopicMessage | null {
    try {
      // 这里提供一个基础的解析逻辑
      // 实际应该根据 FlatBuffers 的二进制格式进行解析
      
      // 假设数据格式：前4字节是消息长度，然后是JSON格式的数据
      if (data.length < 4) return null;
      
      // 读取消息长度（前4字节）
      const messageLength = new DataView(data.buffer, data.byteOffset, 4).getUint32(0, true);
      
      if (data.length < messageLength + 4) return null;
      
      // 提取消息内容（跳过长度字段）
      const messageData = data.slice(4, 4 + messageLength);
      
      // 尝试解析为文本
      const textDecoder = new TextDecoder();
      const messageText = textDecoder.decode(messageData);
      
      // 尝试解析为JSON
      try {
        const jsonData = JSON.parse(messageText);
        return this.convertJsonToMessage(jsonData);
      } catch {
        // 如果不是JSON，尝试解析为其他格式
        return this.parseRawMessage(messageText);
      }
    } catch (error) {
      console.error('解析消息失败:', error);
      return null;
    }
  }
  
  /**
   * 将JSON数据转换为消息对象
   */
  private static convertJsonToMessage(jsonData: any): RosTopicMessage {
    return {
      topic_name: jsonData.topic_name || 'unknown',
      topic_type: jsonData.topic_type || TopicDataType.RawStr,
      timestamp: jsonData.timestamp || Date.now() * 1000000, // 转换为纳秒
      data: {
        raw_str: jsonData.data?.raw_str || {
          header: {
            stamp: jsonData.timestamp || Date.now() * 1000000,
            frame_id: jsonData.frame_id || 'unknown',
            seq: jsonData.seq || 0
          },
          raw_data: jsonData.data?.raw_data || jsonData.raw_data || '',
          extra_data: jsonData.data?.extra_data || jsonData.extra_data || ''
        }
      },
      extra_data: jsonData.extra_data || ''
    };
  }
  
  /**
   * 解析原始消息格式
   */
  private static parseRawMessage(messageText: string): RosTopicMessage {
    // 简单的文本解析，假设格式为：topic_name|data|timestamp
    const parts = messageText.split('|');
    
    return {
      topic_name: parts[0] || 'unknown',
      topic_type: TopicDataType.RawStr,
      timestamp: parts[2] ? parseInt(parts[2]) : Date.now() * 1000000,
      data: {
        raw_str: {
          header: {
            stamp: parts[2] ? parseInt(parts[2]) : Date.now() * 1000000,
            frame_id: 'unknown',
            seq: 0
          },
          raw_data: parts[1] || '',
          extra_data: ''
        }
      },
      extra_data: ''
    };
  }
  
  /**
   * 从消息中提取信号数据
   * @param message 解析后的消息
   * @param signalName 信号名称
   * @returns 信号值或null
   */
  static extractSignalValue(message: RosTopicMessage, signalName: string): any {
    try {
      if (message.data.raw_str) {
        const rawData = message.data.raw_str.raw_data;
        
        // 尝试解析原始数据
        if (rawData) {
          // 这里可以根据实际的信号数据格式进行解析
          // 例如：CAN信号、传感器数据等
          return this.parseSignalData(rawData, signalName);
        }
      }
      
      return null;
    } catch (error) {
      console.error('提取信号值失败:', error);
      return null;
    }
  }
  
  /**
   * 解析信号数据
   * @param rawData 原始数据
   * @param signalName 信号名称
   * @returns 信号值
   */
  private static parseSignalData(rawData: string, signalName: string): any {
    try {
      // 尝试解析为JSON
      const data = JSON.parse(rawData);
      
      // 查找信号值
      if (data.signals && data.signals[signalName]) {
        return data.signals[signalName];
      }
      
      if (data[signalName] !== undefined) {
        return data[signalName];
      }
      
      // 如果找不到，返回原始数据
      return rawData;
    } catch {
      // 如果不是JSON，尝试其他解析方式
      return this.parseTextSignalData(rawData, signalName);
    }
  }
  
  /**
   * 解析文本格式的信号数据
   */
  private static parseTextSignalData(rawData: string, signalName: string): any {
    // 简单的文本解析，假设格式为：signal_name=value
    const pattern = new RegExp(`${signalName}=([^\\s,]+)`, 'i');
    const match = rawData.match(pattern);
    
    if (match) {
      const value = match[1];
      // 尝试转换为数字
      const numValue = parseFloat(value);
      return isNaN(numValue) ? value : numValue;
    }
    
    return rawData;
  }
}
