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
  ObjectDetection = 1,
  // 后续可以扩展更多类型
}

export interface CanSignalData {
  signals: CanSignal[];
}

export interface CanSignal {
  messageName: string;
  nodeName: string;
  signalName: string;
  value: number;
}

export interface ObjectDetectionData {
  objects: any[];
  stamp: number;
}

export interface TopicData {
  raw_str?: RawStrData;
  can_signals?: CanSignalData;
  object_detection?: ObjectDetectionData;
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
      console.log('=== FlatBuffersParser.parseMessage 开始 ===');
      console.log('输入buffer大小:', buffer.byteLength);
      
      const uint8Array = new Uint8Array(buffer);
      console.log('转换为Uint8Array，长度:', uint8Array.length);
      
      let result = this.parseSimpleMessage(uint8Array);
      console.log('parseSimpleMessage结果:', result ? '成功' : '失败');
      
      if (!result) {
        console.log('尝试parseAlternativeFormats');
        result = this.parseAlternativeFormats(uint8Array);
        console.log('parseAlternativeFormats结果:', result ? '成功' : '失败');
      }
      
      if (!result) {
        console.log('尝试parseAsText');
        result = this.parseAsText(uint8Array);
        console.log('parseAsText结果:', result ? '成功' : '失败');
      }
      
      console.log('最终解析结果:', result);
      return result;
    } catch (error) {
      console.log('parseMessage出错:', error);
      return null;
    }
  }
  
  /**
   * 简化的消息解析（用于演示）
   * 实际项目中应该使用真正的 FlatBuffers 库
   */
  private static parseSimpleMessage(data: Uint8Array): RosTopicMessage | null {
    try {
      // 首先尝试解析十六进制编辑器显示的格式：二进制头部 + 路径 + JSON
      const result = this.parseHexEditorFormat(data);
      if (result) {
        return result;
      }
      
      // 如果失败，尝试解析混合格式：二进制头部 + JSON内容
      const mixedResult = this.parseMixedFormat(data);
      if (mixedResult) {
        return mixedResult;
      }
      
      // 如果混合格式解析失败，尝试原始格式
      if (data.length < 4) {
        return null;
      }
      
      const messageLength = new DataView(data.buffer, data.byteOffset, 4).getUint32(0, true);
      
      if (data.length < messageLength + 4) {
        return null;
      }
      
      const messageData = data.slice(4, 4 + messageLength);
      const textDecoder = new TextDecoder();
      const messageText = textDecoder.decode(messageData);
      
      try {
        const jsonData = JSON.parse(messageText);
        return this.convertJsonToMessage(jsonData);
      } catch (jsonError) {
        return this.parseRawMessage(messageText);
      }
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 解析混合格式：二进制头部 + JSON内容
   */
  private static parseMixedFormat(data: Uint8Array): RosTopicMessage | null {
    try {
      // 查找JSON内容的开始位置
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const fullText = textDecoder.decode(data);
      
      // 查找JSON对象的开始位置
      const jsonStart = fullText.indexOf('{');
      if (jsonStart === -1) {
        return null;
      }
      
      // 提取JSON部分
      const jsonText = fullText.substring(jsonStart);
      
      // 尝试解析JSON
      try {
        const jsonData = JSON.parse(jsonText);
        
        // 检查是否是对象检测数据
        if (jsonData.objects && Array.isArray(jsonData.objects)) {
          return this.createObjectDetectionMessage(jsonData);
        }
        
        // 检查是否是CAN信号数据
        if (jsonData.signals && Array.isArray(jsonData.signals)) {
          return this.createCanSignalMessage(jsonData);
        }
        
        // 其他JSON格式
        return this.convertJsonToMessage(jsonData);
      } catch (jsonError) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * 解析十六进制编辑器显示的格式：二进制头部 + 路径 + JSON
   */
  private static parseHexEditorFormat(data: Uint8Array): RosTopicMessage | null {
    try {
      console.log('=== 开始解析FlatBuffers数据 ===');
      console.log('原始数据长度:', data.length);
      console.log('原始数据前100字节:', Array.from(data.slice(0, 100)));
      
      // 查找路径标识符（如 /can_signals）
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const fullText = textDecoder.decode(data);
      
      console.log('解码后的文本:', fullText);
      console.log('文本长度:', fullText.length);
      
      // 查找路径模式：/开头的路径
      const pathMatch = fullText.match(/\/([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (!pathMatch) {
        console.log('未找到路径标识符');
        return null;
      }
      
      const topicPath = pathMatch[0]; // 例如 "/can_signals"
      console.log('找到路径:', topicPath);
      
      // 查找JSON对象的开始位置
      const jsonStart = fullText.indexOf('{');
      if (jsonStart === -1) {
        console.log('未找到JSON开始位置');
        return null;
      }
      
      console.log('JSON开始位置:', jsonStart);
      
      // 提取JSON部分
      let jsonText = fullText.substring(jsonStart);
      console.log('提取的JSON文本:', jsonText);
      
      // 找到完整的JSON对象
      let braceCount = 0;
      let jsonEnd = -1;
      for (let i = 0; i < jsonText.length; i++) {
        if (jsonText[i] === '{') {
          braceCount++;
        } else if (jsonText[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }
      
      if (jsonEnd !== -1) {
        jsonText = jsonText.substring(0, jsonEnd + 1);
        console.log('清理后的JSON文本:', jsonText);
      } else {
        console.log('未找到完整的JSON对象');
        return null;
      }
      
      // 尝试解析JSON
      try {
        const jsonData = JSON.parse(jsonText);
        console.log('解析的JSON数据:', jsonData);
        
        // 根据路径和内容创建消息
        if (topicPath === '/can_signals' && jsonData.signals) {
          console.log('创建CAN信号消息');
          return this.createCanSignalMessage(jsonData, topicPath);
        } else {
          console.log('创建通用JSON消息');
          return this.createGenericJsonMessage(jsonData, topicPath);
        }
      } catch (jsonError) {
        console.log('JSON解析失败:', jsonError);
        return null;
      }
    } catch (error) {
      console.log('解析过程出错:', error);
      return null;
    }
  }
  
  /**
   * 创建对象检测消息
   */
  private static createObjectDetectionMessage(jsonData: unknown): RosTopicMessage {
    const data = jsonData as Record<string, unknown>;
    const timestamp = (data.stamp as number) || Date.now() * 1000000;
    
    return {
      topic_name: '/object_detection',
      topic_type: TopicDataType.ObjectDetection,
      timestamp: timestamp,
      data: {
        object_detection: {
          objects: (data.objects as any[]) || [],
          stamp: timestamp
        }
      },
      extra_data: `Detected ${(data.objects as any[])?.length || 0} objects`
    };
  }
  
  /**
   * 创建CAN信号消息
   */
  private static createCanSignalMessage(jsonData: unknown, topicPath = '/can_signals'): RosTopicMessage {
    const data = jsonData as Record<string, unknown>;
    const timestamp = Date.now() * 1000000;
    
    return {
      topic_name: topicPath,
      topic_type: TopicDataType.RawStr,
      timestamp: timestamp,
      data: {
        can_signals: {
          signals: (data.signals as any[]) || []
        }
      },
      extra_data: `CAN signals: ${(data.signals as any[])?.length || 0} signals`
    };
  }

  /**
   * 创建通用JSON消息
   */
  private static createGenericJsonMessage(jsonData: unknown, topicPath: string): RosTopicMessage {
    const timestamp = Date.now() * 1000000;
    
    return {
      topic_name: topicPath,
      topic_type: TopicDataType.RawStr,
      timestamp: timestamp,
      data: {
        raw_str: {
          header: {
            stamp: timestamp,
            frame_id: 'unknown',
            seq: 0
          },
          raw_data: JSON.stringify(jsonData),
          extra_data: `JSON data from ${topicPath}`
        }
      },
      extra_data: `Generic JSON message from ${topicPath}`
    };
  }

  /**
   * 尝试其他格式的解析
   */
  private static parseAlternativeFormats(data: Uint8Array): RosTopicMessage | null {
    try {
      const textDecoder = new TextDecoder();
      const messageText = textDecoder.decode(data);
      
      try {
        const jsonData = JSON.parse(messageText);
        return this.convertJsonToMessage(jsonData);
      } catch {
        // JSON解析失败，继续其他尝试
      }
      
      if (this.isBinaryData(data)) {
        return this.createDefaultMessage(data);
      }
      
      return this.parseRawMessage(messageText);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 直接解析为文本
   */
  private static parseAsText(data: Uint8Array): RosTopicMessage | null {
    try {
      const textDecoder = new TextDecoder();
      const messageText = textDecoder.decode(data);
      return this.parseRawMessage(messageText);
    } catch (error) {
      return null;
    }
  }
  
  /**
   * 检查是否是二进制数据
   */
  private static isBinaryData(data: Uint8Array): boolean {
    // 检查是否包含不可打印字符
    for (let i = 0; i < Math.min(100, data.length); i++) {
      const byte = data[i];
      if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
        return true;
      }
    }
    return false;
  }
  
  /**
   * 创建默认消息
   */
  private static createDefaultMessage(data: Uint8Array): RosTopicMessage {
    const timestamp = Date.now() * 1000000;
    return {
      topic_name: 'binary_data',
      topic_type: TopicDataType.RawStr,
      timestamp: timestamp,
      data: {
        raw_str: {
          header: {
            stamp: timestamp,
            frame_id: 'unknown',
            seq: 0
          },
          raw_data: `Binary data (${data.length} bytes)`,
          extra_data: `Data size: ${data.length} bytes`
        }
      },
      extra_data: `Binary message with ${data.length} bytes`
    };
  }
  
  /**
   * 将JSON数据转换为消息对象
   */
  public static convertJsonToMessage(jsonData: unknown): RosTopicMessage {
    const data = jsonData as Record<string, unknown>;
    return {
      topic_name: (data.topic_name as string) || 'unknown',
      topic_type: (data.topic_type as TopicDataType) || TopicDataType.RawStr,
      timestamp: (data.timestamp as number) || Date.now() * 1000000,
      data: {
        raw_str: ((data.data as Record<string, unknown>)?.raw_str as RawStrData) || {
          header: {
            stamp: (data.timestamp as number) || Date.now() * 1000000,
            frame_id: (data.frame_id as string) || 'unknown',
            seq: (data.seq as number) || 0
          },
          raw_data: (data.data as Record<string, unknown>)?.raw_data || (data.raw_data as string) || '',
          extra_data: (data.data as Record<string, unknown>)?.extra_data || (data.extra_data as string) || ''
        }
      },
      extra_data: (data.extra_data as string) || ''
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
  static extractSignalValue(message: RosTopicMessage, signalName: string): unknown {
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
  private static parseSignalData(rawData: string, signalName: string): unknown {
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
  private static parseTextSignalData(rawData: string, signalName: string): unknown {
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
