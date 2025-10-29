# WebSocket 信号数据监控功能

## 功能概述

本功能实现了通过 WebSocket 连接接收后端发送的 ROS 话题数据，并将数据解析后显示在动态折线图中。当用户选择左侧信号树中的信号节点时，系统会从接收到的数据中提取对应信号的数据并实时更新图表。

## 主要特性

1. **WebSocket 连接管理**: 自动连接到指定的 WebSocket 服务器
2. **FlatBuffers 数据解析**: 支持解析 ROS 话题消息格式
3. **实时信号监控**: 动态显示选中信号的实时数据
4. **自动重连机制**: 连接断开时自动重连
5. **模拟模式**: 当无法连接真实服务器时，自动启动模拟数据模式
6. **动态折线图**: 使用 Canvas 绘制实时更新的折线图

## 文件结构

```
src/utils/
├── flatbuffers-parser.ts      # FlatBuffers 数据解析器
├── websocket-manager.ts       # WebSocket 连接管理器
├── signal-data-manager.ts     # 信号数据管理器
└── mock-websocket-server.ts   # 模拟 WebSocket 服务器
```

## 使用方法

### 1. 基本使用

功能会在组件加载时自动初始化，无需手动操作。系统会：

1. 尝试连接到 `ws://10.86.14.25:8001/ros_ws`
2. 如果连接失败，自动启动模拟模式
3. 显示连接状态和实时数据

### 2. 选择信号

1. 在左侧信号树中选择一个信号节点
2. 系统会自动开始监控该信号的数据
3. 右侧图表区域会显示该信号的实时折线图

### 3. 查看数据

- **WebSocket 状态**: 显示连接状态（已连接/未连接/模拟模式）
- **信号信息**: 显示信号名称、ID、数据大小等基本信息
- **实时数据**: 显示当前值、更新时间、数据点数等实时信息
- **动态图表**: 显示信号的实时变化趋势

## 数据格式

### ROS 话题消息格式

```typescript
interface RosTopicMessage {
  topic_name: string;           // 话题名称
  topic_type: TopicDataType;    // 话题数据类型
  timestamp: number;            // 时间戳（纳秒）
  data: TopicData;              // 话题数据
  extra_data: string;           // 额外数据
}
```

### 信号数据格式

```typescript
interface SignalData {
  signalName: string;           // 信号名称
  signalId?: string;           // 信号ID
  dataPoints: SignalDataPoint[]; // 数据点数组
  maxDataPoints: number;       // 最大数据点数量
  lastUpdateTime: number;      // 最后更新时间
}
```

## 配置选项

### WebSocket 配置

```typescript
const config = {
  url: 'ws://10.86.14.25:8001/ros_ws',    // WebSocket 服务器地址
  reconnectInterval: 5000,                  // 重连间隔（毫秒）
  maxReconnectAttempts: 3                   // 最大重连次数
};
```

### 信号数据配置

```typescript
const signalConfig = {
  maxDataPoints: 100,  // 每个信号最大保存的数据点数量
};
```

## 模拟模式

当无法连接到真实的 WebSocket 服务器时，系统会自动启动模拟模式：

1. 生成模拟的车辆信号数据（速度、转速、温度等）
2. 每 100ms 更新一次数据
3. 在界面上显示"模拟模式"状态

### 模拟数据示例

```json
{
  "speed": 85.6,           // 速度 (km/h)
  "rpm": 2200,             // 转速 (rpm)
  "temperature": 85.2,      // 温度 (°C)
  "voltage": 13.8,         // 电压 (V)
  "pressure": 225.4,       // 压力 (kPa)
  "acceleration": 2.1,     // 加速度 (m/s²)
  "steering_angle": 15.3,  // 转向角 (度)
  "brake_pressure": 45.7   // 制动压力 (kPa)
}
```

## 错误处理

### 连接错误

- 自动重连机制
- 失败后启动模拟模式
- 用户友好的错误提示

### 数据解析错误

- 容错处理
- 日志记录
- 降级到文本模式

## 性能优化

1. **数据点限制**: 每个信号最多保存 100 个数据点
2. **图表更新**: 只在数据变化时更新图表
3. **内存管理**: 及时清理不需要的数据
4. **连接管理**: 智能重连和资源清理

## 扩展功能

### 添加新的信号类型

1. 在 `TopicDataType` 枚举中添加新类型
2. 在 `TopicData` 联合体中添加对应字段
3. 创建新的数据结构定义
4. 在解析器中添加相应的处理逻辑

### 自定义图表样式

1. 修改 `updateChart` 函数中的绘制逻辑
2. 调整颜色、字体、网格等样式
3. 添加新的图表类型（柱状图、饼图等）

## 故障排除

### 常见问题

1. **WebSocket 连接失败**
   - 检查服务器地址是否正确
   - 确认服务器是否运行
   - 查看浏览器控制台错误信息

2. **数据不显示**
   - 确认信号名称匹配
   - 检查数据格式是否正确
   - 查看信号数据管理器的日志

3. **图表不更新**
   - 确认 WebSocket 连接状态
   - 检查数据更新回调是否正确设置
   - 查看图表更新函数的执行情况

### 调试方法

1. 打开浏览器开发者工具
2. 查看 Console 日志
3. 检查 Network 面板中的 WebSocket 连接
4. 使用 Vue DevTools 查看组件状态

## 技术栈

- **Vue 3**: 前端框架
- **TypeScript**: 类型安全
- **WebSocket**: 实时通信
- **Canvas API**: 图表绘制
- **FlatBuffers**: 数据序列化（模拟实现）

## 注意事项

1. 确保 WebSocket 服务器支持跨域访问
2. 在生产环境中使用真实的 FlatBuffers 库
3. 根据实际需求调整数据更新频率
4. 注意内存使用，避免数据点过多导致性能问题
