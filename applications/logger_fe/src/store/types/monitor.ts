export interface Monitor {
  showMonitor: boolean
  monitorStatus: string
  monitorDetail: MonitorType
  recordUserClicked: boolean
}

interface MonitorDevice {
  device_name: string
  category: string
  device_type: string
  device_status: string
  cur_capture_speed: string
  transmission_rate_wave: string
  cur_store_file_size: string
  award_time_accury: string | number
}

interface MonitorType {
  disk_log?: {
    free_space: {
      level: string
      value: any
    }
    log_level: string
    total_space: string
    used_space: string
  }
  timing_log?: {
    log_level: string
    message: string
    name: string
    ts_offset: {
      level: string
      value: any
    }
  }
  dir_speed_log?: MonitorDevice[]
}
