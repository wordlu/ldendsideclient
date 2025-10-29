//设置查询参数
function setQuery(module,params){
  if(params){
    let matrix = Object.entries(params)
    //清除空属性
    matrix = filterArrayNull(matrix)
    //设置url
    matrix.forEach((item,index)=>{
      if(index == 0){
        module+=`?${filterQuery(item[0],item[1])}=${setValue(item[1],item[0])}`
      }else{
        module+=`&${filterQuery(item[0],item[1])}=${setValue(item[1],item[0])}`
      }
    })
  }
  return module;
}

//筛选查询类型 分页 or 搜索
function filterQuery(arg,value){
  if(arg.includes('limit') || arg.includes('page[limit]')){
    return 'page[limit]';
  }else if(arg.includes('offset') || arg.includes('page[offset]')){
    return 'page[offset]';
  }else if(arg.includes('sort') || arg.includes('include')){
    // 倒序 sort:'-created' 正序 sort:'created'
    return arg;
  }else if(arg.includes('date_max')){
    return `filter[date][max]`;
  }else if(arg.includes('date_min')){
    return `filter[date][min]`;
  }else if(arg.includes('fuzzyMatch')){
    return `filter[${value[0]}][fuzzy-match]`
  }else{
    if(arg.includes('filter')){
      return arg;
    }else{
      return `filter[${arg}]`;
    }
  }
}

function setValue(value,item){
  if(Array.isArray(value)){
    return value[1]
  }else{
    if(isNaN(value) && value.indexOf(',') !== -1){
      let params = value.split(',')
      let str;
      for(let i=0;i<params.length;i++){
        if(i==0){
          str=params[i]
        }else{
          str+=`&filter[${item}]=${params[i]}`
        }
      }
      return str;
    }else{
      return value;
    }
  }
}

//清除数组空属性
function filterArrayNull(arg){
  arg.forEach((item,index)=>{
    if(item[1] === '' || item[1] === null || item[1] === undefined){
      delete arg[index]
    }
  })
  return arg;
}

export { setQuery }