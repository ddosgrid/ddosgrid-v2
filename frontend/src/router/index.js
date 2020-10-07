import Vue from 'vue'
import VueRouter from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import store from '../store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
    beforeEnter: checkIfInterceptedBefore
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/DashBoard.vue'),
    beforeEnter: authRequired
  },
  {
    path: '/datasets',
    name: 'datasets',
    component: () => import(/* webpackChunkName: "about" */ '../views/DataSets.vue'),
    beforeEnter: authRequired
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "about" */ '../views/Profile.vue'),
    beforeEnter: authRequired
  }
]

function checkIfInterceptedBefore (to, from, next) {
  if (store.state.authenticated && store.state.intercepted_page) {
    console.log('forw to inter page')
    next(store.state.intercepted_page)
    store.state.intercepted_page = undefined
  } else {
    console.log('nothing was intercepted')
    next()
  }
}

function authRequired (to, from, next) {
  window.st = store
  if (store.state.authenticated) {
    console.log('authenticated, nothing to intercept')
    next()
  } else {
    console.log('intercept!:', to.fullPath)
    store.state.intercepted_page = to.fullPath
    // TODO / page should hint about auth
    next('/?authprevented')
  }
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
