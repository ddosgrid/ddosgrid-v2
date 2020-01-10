import Vue from 'vue'
import Vuex from 'vuex'
import createPersist from 'vuex-localstorage'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    datasets: [],
    visualizations: [],
    setups: []
  },
  mutations: {
    storeSetup (state, name = `setup-${new Date().toJSON()}`) {
      state.setups.push({
        id: uuidv4(),
        name: name,
        visualizationsOpened: state.visualizations,
        datasetsOpened: state.datasets
      })
    },
    loadSetup (state, id) {
      try {
        var setUp = state.setups.find(setup => setup.id === id)
        state.datasets = setUp.datasetsOpened
        state.visualizations = setUp.visualizationsOpened
      } catch (e) {
        console.error(`Unable to load setup ${id}`)
      }
    },
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
  },
  plugins: [createPersist({
    namespace: 'ddosgrid-state-storage',
    initialState: {},
    // State expires in 6 months
    expires: 6 * 7 * 24 * 60 * 60 * 1e3
  })]
})

function uuidv4 () {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}
