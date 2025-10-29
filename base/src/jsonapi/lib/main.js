import { Utils } from './lib'
import store from './store'

const jsonApiConfig = ()=>{
  const utils = new Utils(store)
  const requests = utils.setRequest()
  return {
    requests:requests
  }
}

export default jsonApiConfig;