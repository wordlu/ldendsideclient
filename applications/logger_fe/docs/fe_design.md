## 前端设计整体方案

- 使用 vue3.0 作为整体框架.
- 使用 typescript 作为编程语言.
- 使用 element-pluse 作为 UI 框架.
- 使用 pinia 作为全局状态管理.
- 使用 vue-router 作为路由管理.
- 使用 vue-i18n 作为国际化语言处理工具.
- 使用 eslint 作为代码检查工具.
- 使用 stylelint 作为样式检查工具.
- 使用 prettier 作为代码格式化工具.
- 使用 tailwindcss 作为 CSS 的补充.
- 使用 iconfiy 作为图标补充集.
- 使用 vite 作为构建工具.
- 对一些常用路径进行别名定义.
- 使用 scss 作为 css 语言拓展.
- 使用 mockjs 作为前端模拟数据请求的工具.

## 项目搭建

使用 vue3.0 框架,参考[vite](https://vitejs.dev/guide/#trying-vite-online)官方教程创建 vue-ts 项目,本项目直接使用公司维护的[前端模板](https://oubaituo1.coding.net/p/common/d/vue_template/git).

## 部署方案

采用 nginx 作为 web 服务器.
- 安装 nginx;
- whereis nginx 查看nginx安装目录;
- 新建 nginx.conf 文件, 放至安装目录下, 内容如下:
```
user  nginx;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
    client_max_body_size 100m;
}
```
- 新建 ld_logger.conf 配置文件, 内容如下: 
- 将 ld_logger.conf 文件放至 cond.d 目录下;
```
server {
  listen 8686;
  root /home/vecow/software/ld_logger/ld_logger_fe; // 静态资源部署目录
  location / {
    index index.html;
    try_files $uri $uri/ @rewrites;
  }
  location @rewrites {
    rewrite ^.*$ /index.html last;
  }
}
```
- 重启nginx: nginx reload

## 不同设备适配方案

- 适配方案: flex 布局 & 百分比尺寸 & rem 单位(结合 tailwindcss)
- 工控机显示屏: 适配谷歌浏览器
- pad: 谷歌开发工具的设备模拟器
- 如有特殊需求,使用媒体查询适配特定设备
- 触屏设备拖拽适配: 使用 vue-draggable 插件适配触屏端 touch&pc 端 drag.

## 国际化翻译

```
logger_fe/src/locales
├─en // 英文语言包,根据功能模块划分
│ common.ts // 通用
| collect.ts // 采集相关
| monitor.ts // 监控相关
| storage.ts // 存储配置相关
|
└─zh-CN // 中文语言包,根据功能模块划分
│ common.ts
| ... // 同英文目录下一一对应
```

## 全局基础对象

```
logger_fe/src/basic_data
| web_socket.ts // ws实例对象管理相关
| video.ts // 视频图像实例管理相关
| point_cloud.ts // 点云实例对象管理相关
| scene_data.ts // 场景实例对象管理相关
```

## 全局状态管理

使用 pinia 做全局状态管理

```
logger_fe/src/store
├─modules // 按照功能模块划分层级
│ collect.ts // 采集相关的全局状态
│ tag.ts // 标签相关的全局状态
| device.ts // 设备配置相关
| point.ts // 点云图像相关
| video.ts // 视频图像相关
| monitor.ts // 监控相关
```

## 模拟数据

为了不依赖与后端进度,前端可以独立模拟联调,用来前端模拟http接口请求.

```
logger_fe/src
├─mock
│   index.ts // 在文件中自定义模拟接口和返回数据
```

## 项目主要目录结构

```
logger_fe
| .env.development // 开发环境配置文件
| .env.production // 生产环境配置文件
| .eslintrc.cjs // eslint 校验规则配置文件
| .gitignore // git 忽略文件配置
| .prettierrc.cjs // 代码格式化配置文件
| index.html // 静态资源入口文件
| package.json // 项目配置文件
| vite.config.ts // vite 配置文件
| src // 开发代码存放目录

---

logger_fe/src
│ App.vue // 项目入口 vue 文件
│ main.ts // 项目入口 ts 文件
│
├─api // 项目 http 请求,根据接口模块(前缀)划分下级
│ ├─api_v2
│ └─api_v1
│ index.ts
│
├─assets // 存放项目全局静态资源
|
├─basic_data // 全局共享非响应式基础对象目录,例如点云对象,ws 对象等
│
├─components // 非路由式组件库目录,根据功能模块划分层级
| │  
| ├─collect // 采集相关组件
| │      PrepareInfo.vue // 采集准备中显示组件
| │      StorageCfg.vue // 存储配置弹窗组件
| │      TopOprt.vue // 页面主区域顶部采集相关操作组件
| │      
| ├─device // 设备及其配置相关组件
| │      DeviceIndex.vue // 设备首页列表通用组件
| │      DeviceInfo.vue // 设备信息总览页面通用组件
| │      RenderComp.vue // 设备模板根据字段不同的类型的渲染组件
| │      
| ├─layout // 布局相关组件
| │      AsideMenu.vue // 侧边栏菜单组件
| │      Header.vue // 布局顶部组件
| │      
| ├─monitor // 监控相关组件
| │      Index.vue // 监控按钮及相关弹窗显示组件
| │      MonitorDetail.vue // 监控详情组件
| │      
| ├─tags // 标签相关组件
| │  │  OperatingTags.vue // 本次作业标签区域显示组件
| │  │  TagGroup.vue // 标签组首页组件
| │  │  Tags.vue // 标签首页组件
| │  │  
| │  └─components // 标签相关子组件
| │          GroupConfig.vue // 标签组新增/修改配置弹窗
| │          MarkedTags.vue // 已打标签回显区域组件
| │          OprtTagConfig.vue // 当前作业标签新增弹窗组件
| │          TagConfig.vue // 标签新增/修改配置组件
| │          TagDragConfig.vue // 当前作业标签拖动编辑组件
| │          
| └─visualization // 可视化相关组件
|     │  ImageView.vue // 相机图像可视化组件
|     │  PointView.vue // 雷达点云可视化组件
|     │  
|     └─components // 可视化相关子组件
|             BasicScene.vue // 基础场景组件
|             DataSource.vue // 雷达点云数据源操作及控制组件
|             DisplayPanel.vue // 可视化操作面板组件
│
├─locales // 国际化翻译文件目录
│ └─langs // 加载语言入口文件
│   │ en.ts
│   │ zh-CN.ts
│   │
│   ├─en // 英文语言包,根据功能模块划分
│   │ common.ts
│   │
│   └─zh-CN // 中文语言包,根据功能模块划分
│   common.ts
│
├─router // 路由配置文件
│ | index.ts // 路由入口文件
| | devices.ts // 设备相关路由
│
├─store // 全局状态管理目录
│ │ index.ts // 全局状态入口
│ │
│ ├─modules // 全局响应式变量定义,根据功能模块划分
│ │ collect.ts
│ │ tags.ts
│ │
│ └─types // 全局状态类型定义
│ collect.ts
│ tags.ts
|
├─three_controls // 点云可视化相关基础对象目录
│
├─utils // 通用工具目录
│ └─http // http 通用方法封装
│     axios.ts
│     index.ts
│
└─views // 全局路由组件目录
Index.vue // 首页路由
Layout.vue // 布局父路由

```

## 页面&路由设计

```
router // 路由配置文件
  ├─index.ts // 路由入口文件
  | devices.ts // 设备相关路由
```

### 一级路由

#### 系统首页
- 路径: /
- 功能: 系统主页面
- 布局: 侧边栏菜单 & 系统功能页面

#### 服务协议
- 路径: /agreement
- 功能: 服务协议页面
- 布局: 系统服务协议内容显示区域

#### 模板预览
- 路径: /template_preview
- 功能: 注册设备类型, 配置自定义字段之后模板预览页面
- 布局: 模板显示区域

### 二级路由

#### 页面布局
- header: 展示 logo&软件标题&语言切换&设置.
- menu: 控制页面功能切换.
- content: 页面主要功能展示区域(子路由渲染区域).

#### 采集首页
- 路径: /index
- 功能: 采集主要功能页面
- 布局: 采集操作区域&采集准备状态反馈区域&作业标签区域

#### 可视化页面
- 路径: /visualization
- 功能: 雷达点云 & 相机图像 可视化页面
- 布局: 设备选择区域 & 可视化区域 & 点云或图像操作面板区域

#### 系统管理
- 路径: /systemManage
- 功能: 配置存储路径
- 布局: 配置操作&回显配置区域&配置弹窗

#### 关于本机
- 路径: /aboutnative
- 功能: 显示系统相关信息
- 布局: 系统名称&版本&软件服务协议显示区域

#### 标签配置
- 路径: /tag_index
- 功能: 系统标签及标签组增删改查维护
- 布局: 新增按钮 & 搜索查询区域 & 列表显示区域

#### 系统信息
- 路径: /system_info
- 功能: 跳转cockpit查看系统信息
- 布局: 跳转链接显示

#### 设备相关路由
- /src/router/device.ts

## protobuf 格式通信解析

- 借助 protobuf-ts 工具: npm install -D @protobuf-ts/plugin
- 生成 protots 文件: npx protoc --ts_out . --proto_path protos protos/my.proto