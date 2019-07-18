import Vue from 'vue'
// 导入axios
import axios from 'axios'
// 注册根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

axios.interceptors.request.use(config => {
  config.headers.Authorization = sessionStorage.getItem('token')
  return config
})

// 挂在axios在Vue全局
Vue.prototype.$http = axios
