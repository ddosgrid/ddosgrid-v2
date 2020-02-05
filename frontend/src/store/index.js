import Vue from 'vue'
import Vuex from 'vuex'
import createPersist from 'vuex-localstorage'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    datasets: [],
    visualizations: [],
    setups: [],
    tiles: []
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
      var existing = state.datasets.find(dataset => dataset.md5 === newDataSet.md5)
      if (!existing) {
        state.datasets.push(newDataSet)
        console.log(newDataSet)
      }
    },
    removeDataSet (state, toBeRemoved) {
      state.datasets = state.datasets.filter(dataset => dataset._id !== toBeRemoved._id)
    },
    addVisualization (state, newVisualization) {
      var found = state.visualizations.find(existingVisualisation => newVisualization.file === existingVisualisation.file)
      if (!found) {
        state.visualizations.push(newVisualization)
        console.log(newVisualization)
      }
    },
    removeVisualization (state, toBeRemoved) {
      state.visualizations = state.visualizations.filter(visualization => visualization.file !== toBeRemoved.file)
    },
    addTile (state, newTile) {
      if (Object.prototype.hasOwnProperty.call(newTile, 'file')) {
        var found = state.tiles.find(existingVisualisation => newTile.file === existingVisualisation.file)
        if (!found) {
          state.tiles.push(newTile)
          console.log(newTile)
        }
      } else if (Object.prototype.hasOwnProperty.call(newTile, 'md5')) {
        var existing = state.tiles.find(dataset => dataset.md5 === newTile.md5)
        if (!existing) {
          state.datasets.push(newTile)
          console.log(newTile)
        }
      }
    },
    removeTile (state, toBeRemoved) {
      if (Object.prototype.hasOwnProperty.call(toBeRemoved, 'file')) {
        state.tiles = state.tiles.filter(visualization => visualization.file !== toBeRemoved.file)
      } else if (Object.prototype.hasOwnProperty.call(toBeRemoved, 'md5')) {
        state.tiles = state.tiles.filter(dataset => dataset._id !== toBeRemoved._id)
      }
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
