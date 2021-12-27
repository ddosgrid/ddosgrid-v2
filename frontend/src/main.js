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
  MdCheckbox,
  MdBadge,
  MdChips } from 'vue-material/dist/components'
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import { io } from 'socket.io-client'
import { apibaseurl } from './config/variables'
import VueSocketIO from 'vue-socket.io'

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
Vue.use(MdCheckbox)
Vue.use(MdBadge)
Vue.use(MdSwitch)
Vue.use(new VueSocketIO({
  debug: true,
  connection: io(apibaseurl, { autoConnect: true }),
  vuex: {
    store,
    actionPrefix: 'SOCKET_',
    mutationPrefix: 'SOCKET_'
  }
})
)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
