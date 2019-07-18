import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/login'
import Home from './views/home'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home }
  ]
})

// 挂载路由导航卫士
router.beforeEach((to, from, next) => {
  // to 将要访问的路劲,from代表从那个路径跳转过来，next是一个函数，表示放行，next()直接放行，next('/login)强制跳转到首页
  if (to.path === '/login') return next()
  const token = sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

// 暴露接口
export default router
