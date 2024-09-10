class filterData {
  constructor(props) {
    this.tags = props.tags || []
  }

  // 筛选指定标签
  filterTag(id) {
    if (Array.isArray(id)) {
      return this.tags.filter(item => id.includes(item.id) )
    }
    return this.tags.find(item => item.id === id)
  }

  // 设置数据通用方法
  setData(flag, data) {
    this[flag] = data
  }

  // 通用筛选器
  filter(flag, id) {
    return this[flag].find(item => item.id === id)
  }
}

export default filterData