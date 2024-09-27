// 设备配置&信息相关页面

export default [
  {
    // 设备注册页 - 已注册设备类型列表页
    path: '/device_registed',
    name: 'device_registed',
    component: () => import('@/views/devices/register/DeviceList.vue'),
  },
  {
    // 设备注册页 - 配置模板页面
    path: '/device_template',
    name: 'device_template',
    component: () => import('@/views/devices/register/Template.vue'),
  },
  {
    // 雷达首页
    path: '/lidar_index',
    name: 'lidar_index',
    component: () => import('@/views/devices/LidarIndex.vue'),
    meta: {
      // title: t('common.lidarCfg'),
    },
  },
  {
    // 雷达信息总览
    path: '/lidar_info',
    name: 'lidar_info',
    component: () => import('@/views/devices/LidarInfo.vue'),
  },
  {
    // 相机首页
    path: '/camera_index',
    name: 'camera_index',
    component: () => import('@/views/devices/CameraIndex.vue'),
  },
  {
    // 相机信息总览
    path: '/camera_info',
    name: 'camera_info',
    component: () => import('@/views/devices/CameraInfo.vue'),
  },
  {
    // can设备
    path: '/can_index',
    name: 'can_index',
    component: () => import('@/views/devices/CanIndex.vue'),
  },
  {
    // 相机信息总览
    path: '/can_info',
    name: 'can_info',
    component: () => import('@/views/devices/CanInfo.vue'),
  },
  {
    // com设备列表页
    path: '/com_index',
    name: 'com_index',
    component: () => import('@/views/devices/ComIndex.vue'),
  },
  {
    // 设备配置页面
    path: '/device_config',
    name: 'device_config',
    component: () => import('@/views/devices/DeviceConfig.vue'),
  },
]
