// WebSocket 连接管理器
import { FlatBuffersParser, RosTopicMessage } from './flatbuffers-parser';

export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export interface WebSocketMessage {
  type: 'message' | 'error' | 'close' | 'open';
  data?: unknown;
  error?: Error;
}

export type MessageHandler = (message: RosTopicMessage) => void;
export type ConnectionHandler = (connected: boolean) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: number | null = null;
  private messageHandlers: MessageHandler[] = [];
  private connectionHandlers: ConnectionHandler[] = [];
  private isConnecting = false;
  private isManualClose = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      ...config
    };
  }

  /**
   * 连接到 WebSocket 服务器
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('连接已在进行中'));
        return;
      }

      this.isConnecting = true;
      this.isManualClose = false;

      try {
        this.ws = new WebSocket(this.config.url, this.config.protocols);
        this.setupEventHandlers(resolve, reject);
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * 设置 WebSocket 事件处理器
   */
  private setupEventHandlers(resolve: () => void, reject: (error: Error) => void) {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.notifyConnectionHandlers(true);
      resolve();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onerror = () => {
      this.isConnecting = false;
      reject(new Error('WebSocket 连接失败'));
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.notifyConnectionHandlers(false);
      
      if (!this.isManualClose && this.reconnectAttempts < (this.config.maxReconnectAttempts || 10)) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * 将 Blob 转换为 ArrayBuffer
   */
  private convertBlobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result);
        } else {
          reject(new Error('FileReader 结果不是 ArrayBuffer'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('FileReader 读取失败'));
      };
      
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   * 创建默认的Blob消息（当解析失败时使用）
   */
  private createDefaultBlobMessage(arrayBuffer: ArrayBuffer): RosTopicMessage {
    const timestamp = Date.now() * 1000000;
    return {
      topic_name: 'unparsed_blob',
      topic_type: 0, // TopicDataType.RawStr
      timestamp: timestamp,
      data: {
        raw_str: {
          header: {
            stamp: timestamp,
            frame_id: 'unknown',
            seq: 0
          },
          raw_data: `Unparsed blob data (${arrayBuffer.byteLength} bytes)`,
          extra_data: `Failed to parse blob message. Size: ${arrayBuffer.byteLength} bytes`
        }
      },
      extra_data: `Blob parsing failed - ${arrayBuffer.byteLength} bytes`
    };
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent) {
    try {
      let message: RosTopicMessage | null = null;
      
      if (event.data instanceof ArrayBuffer) {
        message = FlatBuffersParser.parseMessage(event.data);
      } else if (event.data instanceof Blob) {
        this.convertBlobToArrayBuffer(event.data).then((arrayBuffer) => {
          const blobMessage = FlatBuffersParser.parseMessage(arrayBuffer);
          
          if (blobMessage) {
            this.notifyMessageHandlers(blobMessage);
          } else {
            const defaultMessage = this.createDefaultBlobMessage(arrayBuffer);
            this.notifyMessageHandlers(defaultMessage);
          }
        }).catch((error) => {
          console.error('Blob 转换失败:', error);
        });
        return;
      } else if (typeof event.data === 'string') {
        try {
          const jsonData = JSON.parse(event.data);
          message = FlatBuffersParser.convertJsonToMessage(jsonData);
        } catch (jsonError) {
          message = {
            topic_name: 'unknown',
            topic_type: 0,
            timestamp: Date.now() * 1000000,
            data: {
              raw_str: {
                header: {
                  stamp: Date.now() * 1000000,
                  frame_id: 'unknown',
                  seq: 0
                },
                raw_data: event.data,
                extra_data: ''
              }
            },
            extra_data: ''
          };
        }
      }

      if (message) {
        this.notifyMessageHandlers(message);
      }
    } catch (error) {
      console.error('处理 WebSocket 消息失败:', error);
    }
  }

  /**
   * 安排重连
   */
  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectInterval || 5000;
    
    this.reconnectTimer = setTimeout(() => {
      if (!this.isManualClose) {
        this.connect().catch(error => {
          console.error('重连失败:', error);
        });
      }
    }, delay);
  }

  /**
   * 发送消息
   */
  public send(data: string | ArrayBuffer | Blob): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  /**
   * 关闭连接
   */
  public disconnect() {
    this.isManualClose = true;
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, '用户主动断开');
      this.ws = null;
    }
  }

  /**
   * 获取连接状态
   */
  public getConnectionState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  /**
   * 检查是否已连接
   */
  public isConnected(): boolean {
    return !!(this.ws && this.ws.readyState === WebSocket.OPEN);
  }

  /**
   * 添加消息处理器
   */
  public addMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.push(handler);
  }

  /**
   * 移除消息处理器
   */
  public removeMessageHandler(handler: MessageHandler): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  /**
   * 添加连接状态处理器
   */
  public addConnectionHandler(handler: ConnectionHandler): void {
    this.connectionHandlers.push(handler);
  }

  /**
   * 移除连接状态处理器
   */
  public removeConnectionHandler(handler: ConnectionHandler): void {
    const index = this.connectionHandlers.indexOf(handler);
    if (index > -1) {
      this.connectionHandlers.splice(index, 1);
    }
  }

  /**
   * 通知消息处理器
   */
  private notifyMessageHandlers(message: RosTopicMessage): void {
    console.log('解析后的WebSocket数据:', message);
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (error) {
        console.error('消息处理器执行失败:', error);
      }
    });
  }

  /**
   * 通知连接状态处理器
   */
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected);
      } catch (error) {
        console.error('连接状态处理器执行失败:', error);
      }
    });
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    this.disconnect();
    this.messageHandlers = [];
    this.connectionHandlers = [];
  }
}
