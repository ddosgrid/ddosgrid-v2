import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import {
  MdTabs,
  MdCard,
  MdButton,
  MdIcon,
  MdDivider,
  MdSnackbar,
  MdField,
  MdList,
  MdDialog,
  MdEmptyState,
  MdSpeedDial,
  MdTooltip,
  MdProgress,
  MdSwitch,
  MdChips } from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

Vue.use(MdTabs)
Vue.use(MdCard)
Vue.use(MdButton)
Vue.use(MdIcon)
Vue.use(MdDivider)
Vue.use(MdSnackbar)
Vue.use(MdField)
Vue.use(MdList)
Vue.use(MdDialog)
Vue.use(MdTooltip)
Vue.use(MdSpeedDial)
Vue.use(MdEmptyState)
Vue.use(MdProgress)
Vue.use(MdChips)
Vue.use(MdSwitch)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
