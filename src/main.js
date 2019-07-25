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
// 引入table树状表格
import Treetable from 'vue-table-with-tree-grid'

// 引入过滤器
import moment from 'moment'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.config.productionTip = false
    // 注册table树状表格组件
Vue.component('tree-table', Treetable)
    // 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

// 过滤器
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
        router,
        render: h => h(App)
    }).$mount('#app') // el 的意思。