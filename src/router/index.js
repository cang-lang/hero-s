import Vue from 'vue'
import Router from 'vue-router'
import Login from '../views/login'
import Home from '../views/home'
import Welcome from '../views/home/welcome'
import Users from '../views/home/users'
import Rights from '../views/home/power/rights'
import Roles from '../views/home/power/roles'
import Categories from '../views/home/goods/categories'
import Params from '../views/home/goods/params'
import List from '../views/home/goods/list'
import Add from '../views/home/goods/add'
import Orders from '../views/home/orders'
import Reports from '../views/home/reports'

Vue.use(Router)

const router = new Router({
    // 定义路由规则
    routes: [
        // 定义根路径重定向
        { path: '/', redirect: '/login' },
        // 定义登陆路由规则
        { path: '/login', component: Login },
        // 定义hom路由规则
        {
            path: '/home',
            component: Home,
            redirect: '/welcome',
            children: [
                { path: '/welcome', component: Welcome },
                { path: '/users', component: Users },
                { path: '/rights', component: Rights },
                { path: '/roles', component: Roles },
                { path: '/categories', component: Categories },
                { path: '/params', component: Params },
                { path: '/goods', component: List },
                { path: '/goods/add', component: Add },
                { path: '/orders', component: Orders },
                { path: '/reports', component: Reports }
            ]
        }

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