import Vue from 'vue'
import VueRouter from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import store from '../store/index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage
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
    path: '/liveanalysis',
    name: 'liveanalysis',
    component: () => import(/* webpackChunkName: "about" */ '../views/LiveAnalysis.vue')
  }
]

function authRequired (to, from, next) {
  if (store.state.authenticated) {
    next()
  } else {
    // Store the desired URL in session storage for when
    // the user 'comes back' authenticated
    sessionStorage.setItem('intercepted', to.fullPath)
    next('/?authprevented')
  }
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
