import store from '@/store'
import { errors } from './error'
import { setQuery } from './lib'
import ResultModel from './ResultModel'

class api extends ResultModel{
  constructor(props){
    super(props);
  }
  /**
   * @param { get , post , delete , patch  } 基础查询
   * @param { getRelated , postRelated , patchRelated , deleteRelated } 关联查询 relationship
   */
  //通用查询
  async query(module,params){
    return new Promise(async (resolve,rejecet)=>{
      module = setQuery(module,params)
      await store.dispatch(`dms/get`,module)
      .then(res=>{
        let result = {
          data:res._jv.json.data,
          meta:res._jv.json.meta?res._jv.json.meta:{}
        }
        resolve(result)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  //查询列表
  async findAll(module,params){
    return new Promise(async (resolve,rejecet)=>{
      module = setQuery(module,params)
      await store.dispatch(`dms/get`,module)
      .then(res=>{
        let result = this.setFindAllResult(res);
        resolve(result)
      }).catch(error=>{
        console.log(error,'error')
        errors(error)
      })
    })
	}
  //单个新增API
  async addItem(module,params){
    return new Promise(async (resolve,rejecet)=>{
      const url = {
        _jv: {
          type: module
        }
      }
      for(let key in params){
        url[key] = params[key]
      }
      await store.dispatch(`dms/post`,url)
      .then(res=>{
        resolve(res)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  //精准查询
  async findItem(module,id,Related){
    return new Promise(async (resolve,rejecet)=>{
      let option = Related?'dms/get':`dms/get`
      let RelatedUrl="";
      if(Related){
        for(let i=0;i<Related.length;i++){
          RelatedUrl+=`/${Related[i]}`
        }
      }
      await store.dispatch(option,Related?`${module}/${id}${RelatedUrl}`:`${module}/${id}`)
      .then(res=>{
        resolve(res._jv.json.data)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  //删除
  /**
   * delete { 物理删除 }
   * status { 逻辑删除 }
   */
  async removeitems(module,params){
    return new Promise(async (resolve,rejecet)=>{
      await store.dispatch(`dms/delete`,[module,{params:params}])
      .then(res=>{
        resolve('delete')
      }).catch(error=>{
        if(error.includes('deleteRecord: Missing')){
          resolve('delete')
        }else{
          errors(error)
        }
      })
    })
  }
  async removeitem(module,id){
    return new Promise(async (resolve,rejecet)=>{
      const url = {
        _jv: {
          type: module,
          id:id
        }
      }
      await store.dispatch(`dms/delete`,url)
      .then(res=>{
        resolve('delete')
      }).catch(error=>{
        if(error.includes('deleteRecord: Missing')){
          resolve('delete')
        }else{
          errors(error)
        }
      })
    })
  }
  //更新数据
  async updateItem(module,id,params){
    return new Promise(async (resolve,rejecet)=>{
      const url = {
        _jv: {
          type: module,
          id:id
        },
      }
      for(let key in params){
        url[key] = params[key]
      }
      await store.dispatch(`dms/patch`,[url])
      .then(res=>{
        resolve(res)
      }).catch(error=>{
        errors(error)
      })
    })
  }
  // link 查询
  async link(link){
    await store.dispatch(`dms/get`,link.self)
    .then(res=>{
      resolve(res)
    }).catch(error=>{
      errors(error)
    })
  }
}

const apiModules = new api();
export default apiModules;
