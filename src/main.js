import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 导入element
import './plugins/element.js'
// 导入全局样式
import './assets/css/base.less'
// 导入字体样式
import './assets/fonts/iconfont.css'
// 引入axios
import './api'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app') // el 的意思。
