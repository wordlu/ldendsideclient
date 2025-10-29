import store from '@/store'
import { errors } from './error'
import { setQuery } from './lib'
import ResultModel from './ResultModel'

class system extends ResultModel{
  constructor(props){
    super(props);
  }
  /**
   * @param { get , post , delete , patch  } 基础查询
   * @param { getRelated , postRelated , patchRelated , deleteRelated } 关联查询 relationship
   */
  //查询所有的客户端
  async findclient(module,params){
    return new Promise(async (resolve,rejecet)=>{
      module = setQuery(module,params)
      await store.dispatch(`system/get`,module)
      .then(res=>{
        let result = this.setFindAllResult(res);
        resolve(result)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  // 获取前端配置
  // @wodelu: TODO
  async findConfig(module,id,Related,roles){
    return new Promise(async (resolve,rejecet)=>{
      let option = Related?'system/get':`system/get`
      let RelatedUrl="";
      if(Related){
        for(let i=0;i<Related.length;i++){
          RelatedUrl+=`/${Related[i]}`
        }
      }
      await store.dispatch(option,Related?`${module}/${id}${RelatedUrl}?role_ids=${roles}`:`${module}/${id}?role_ids=${roles}`)
      .then(res=>{
        resolve(res._jv.json.data)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  // @wodelu: TODO 获取sso前端配置
  async findSSOConfig(module,id,Related,roles,client_name){
    console.log(module,id,Related,roles)
    // client 6aacd8288b2a4761bfff76107d418f6flabel ['micro_frontend_conf'] general
    return new Promise(async (resolve,rejecet)=>{
      let option = Related?'ssoSystem/get':`ssoSystem/get`
      let RelatedUrl="";
      if(Related){
        for(let i=0;i<Related.length;i++){
          RelatedUrl+=`/${Related[i]}`
        }
      }
      await store.dispatch(option,Related?`${module}${RelatedUrl}?roles=${roles}&client=${client_name}`:`${module}/${id}?roles=${roles}&client=${client_name}`)
      .then(res=>{
        resolve(res._jv.json.data)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  // 获取对应权限的信息
  async getRolePages(module,ego_roles,update_roles,client_id,Related){
    return new Promise(async (resolve,rejecet)=>{
      let option = Related?'system/get':`system/get`
      let RelatedUrl="";
      if(Related){
        for(let i=0;i<Related.length;i++){
          RelatedUrl+=`/${Related[i]}`
        }
      }
      await store.dispatch(option,`${module}/micro_frontend_conf_manage_compare${RelatedUrl}?role_ids=${ego_roles}&modify_role_id=${update_roles}&client_id=${client_id}`)
      .then(res=>{
        resolve(res._jv.json.data)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  // 设置对应权限信息
  async setRolePages(module,params){
    return new Promise(async (resolve,rejecet)=>{
      const url = {
        _jv: {
          type: module,
        },
      }
      for(let key in params){
        url[key] = params[key]
      }
      await store.dispatch(`system/post`,url)
      .then(res=>{
        resolve(res)
      }).catch(error=>{
        errors(error)
      })
    })
	}
  // 获取组件信息 显示隐藏 接口
  async getComponent(module,params){
    return new Promise(async (resolve,rejecet)=>{
      module = setQuery(module,params)
      await store.dispatch(`system/get`,module)
      .then(res=>{
        let result = this.setFindAllResult(res);
        resolve(result)
      }).catch(error=>{
        errors(error)
      })
    })
  }
}

const systemModules = new system();
export default systemModules;
