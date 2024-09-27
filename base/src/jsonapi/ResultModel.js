class ResultModel {
  constructor(){
    this.findAll_result={
      data:new Array(),
      count:Number,
      limit:Number,
      offset:Number,
      included:new Array()
    }
  }
  setFindAllResult(res){
    this.findAll_result.data = []
    function setData(data){
      let list = []
      for(let i=0;i<data.length;i++){
        if(data[i].id){
          data[i].attributes.id = data[i].id
        }
        if(data[i].relationships){
          data[i].attributes.relationships = data[i].relationships
        }
        list.push(data[i].attributes)
      }
      return list;
    }
    this.findAll_result.data = setData(res._jv.json.data?res._jv.json.data:[])
    this.findAll_result.included = setData(res._jv.json.included?res._jv.json.included:[])
    this.findAll_result["count"] = res._jv.json.meta.pagination?res._jv.json.meta.pagination.count:res._jv.json.meta.count?res._jv.json.meta.count:0;
    this.findAll_result["limit"] = res._jv.json.meta.pagination?res._jv.json.meta.pagination.limit:res._jv.json.meta.limit?res._jv.json.meta.limit:0;
    this.findAll_result["offset"] = res._jv.json.meta.pagination?res._jv.json.meta.pagination.offset:res._jv.json.meta.offset?res._jv.json.meta.offset:0;
    return this.findAll_result;
  }
}
export default ResultModel;