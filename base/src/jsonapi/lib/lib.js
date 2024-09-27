import axios from 'axios'
import store from '@/store'
import Cookies from 'js-cookie'

const Utils = class {
  constructor(props) {
    this.props = props;
    this.prefixs = props.prefixs;
  }
  setRequest(){
    let requests = []
    for(let i=0;i<this.prefixs.length;i++){
      requests.push({
        prefixs:this.prefixs,
        request:this.request(this.prefixs[i].prefix),
        alias:this.prefixs[i].alias
      })
    }
    return requests;
  }
  request(prefix){
    const isAbsoluted = prefix.substring(0,4) === 'http'
    const JsonApiService = axios.create({
      headers: {
        'Content-Type':'application/vnd.api+json'
      },
      baseURL:isAbsoluted ? prefix : `/api${prefix}`,
      withCredentials: false, // send cookies when cross-domain requests
      timeout: 5000 // request timeout
    })
    
    JsonApiService.interceptors.request.use( config => {
      let token = Cookies.get('Token');
      //set token and language
      if(token){
        // token
        config.headers.Authorization = token
        // Accept-Language
        config.headers['Accept-Language'] = store.getters.language =='zh'?'zh-hans':'en-us'
      }
      return config
    },
    error => {
      // do something with request error
      console.log(error) // for debug
      return Promise.reject(error)
    })

    return JsonApiService;
  }
}

export { Utils };