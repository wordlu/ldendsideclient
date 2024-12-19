import axios from 'axios'
import jsCookie from "js-cookie"
import { BaseURL } from './../../../../../ld-dms/applications/calibrator_v3_fe/src/api_v1/camera_source';

const request = axios.create({
  headers: {
    'Content-Type':'application/vnd.api+json'
  },
	// baseURL:`${window.server.mecPrefix}/api/logger`,
  baseURL: `/api`,
	timeout: 3600000,
})

request.interceptors.request.use( config => {
  const token = `Bearer ${jsCookie.get('Token')}`;
  //set token and language
  if(token){
    // token
    config.headers.Authorization = token
  }
  return config
},
error => {
  // do something with request error
  console.log(error) // for debug
  return Promise.reject(error)
})

export default request;