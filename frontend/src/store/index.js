import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    datasets: [],
    visualizations: []
  },
  mutations: {
    addDataSet (state, newDataSet) {
      // TODO: check if duplicate
      state.datasets.push(newDataSet)
    },
    removeDataSet (state, toBeRemoved) {
      state.datasets = state.datasets.filter(dataset => dataset._id !== toBeRemoved._id)
    },
    addVisualization (state, newVisualization) {
      // TODO: check if duplicate
      state.visualizations.push(newVisualization)
    },
    removeVisualization (state, toBeRemoved) {
      state.visualizations = state.visualizations.filter(visualization => visualization.file !== toBeRemoved.file)
    }
  },
  actions: {
  },
  modules: {
  }
})
