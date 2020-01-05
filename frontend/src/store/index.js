import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    datasets: []
  },
  mutations: {
    addDataSet (state, newDataSet) {
      // TODO: check if duplicate
      state.datasets.push(newDataSet)
    },
    removeDataSet (state, toBeRemoved) {
      state.datasets = state.datasets.filter(dataset => dataset._id !== toBeRemoved._id)
      console.log(state.datasets)
    }
  },
  actions: {
  },
  modules: {
  }
})
