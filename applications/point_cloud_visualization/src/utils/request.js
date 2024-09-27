import axios from 'axios'
import jsCookie from "js-cookie"

const request = axios.create({
	timeout: 3600000,
	baseURL:'/api'
})

request.interceptors.request.use( config => {
  // let token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoxLCJzIjoiY2EiLCJleHAiOjE2OTc3ODQxNjEsImlwIjoiMTAuMjQ0LjUuMjMyIn0.bmBE8M-ZUJIVvPzm2l970mmp3fnvqvSswOVC6uKUiN4`;
  let token =  jsCookie.get('Token');

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