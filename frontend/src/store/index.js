/* eslint-disable no-unused-expressions */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    datasets: []
  },
  mutations: {
    addDataSet (state, newDataSet) {
      state.datasets.push(newDataSet)
    },
    removeDataSet (state, toBeRemoved) {
      state.datasets = state.datasets.filter((dataset) => { toBeRemoved._id !== dataset._id })
    }
  },
  actions: {
  },
  modules: {
  }
})
