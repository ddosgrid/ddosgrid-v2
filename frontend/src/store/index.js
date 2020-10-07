import Vue from 'vue'
import Vuex from 'vuex'
import createPersist from 'vuex-localstorage'
import { apibaseurl } from '@/config/variables.js'
import router from '../router'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    setups: [],
    tiles: [],
    authenticated: false
  },
  mutations: {
    updateAuthState (state, authenticated = false) {
      state.authenticated = authenticated
    },
    storeSetup (state, name = `setup-${new Date().toJSON()}`) {
      state.setups.push({
        id: uuidv4(),
        name: name,
        tilesOpened: state.tiles
      })
    },
    loadSetup (state, id) {
      try {
        var setUp = state.setups.find(setup => setup.id === id)
        state.tiles = setUp.tilesOpened
      } catch (e) {
        console.error(`Unable to load setup ${id}`)
      }
    },
    addTile (state, newTile) {
      if (Object.prototype.hasOwnProperty.call(newTile, 'file')) {
        var found = state.tiles.find(existingVisualisation => newTile.file === existingVisualisation.file)
        if (!found) {
          newTile.x = 0
          newTile.y = 0
          newTile.h = 1
          newTile.w = 1
          newTile.key = newTile.file
          newTile.i = newTile.file
          newTile.show = true
          state.tiles.push(newTile)
        }
      } else if (Object.prototype.hasOwnProperty.call(newTile, 'md5')) {
        var existing = state.tiles.find(dataset => dataset.md5 === newTile.md5)
        if (!existing) {
          newTile.x = 0
          newTile.y = 0
          newTile.h = 1
          newTile.w = 1
          newTile.key = newTile.md5
          newTile.i = newTile.md5
          newTile.show = true
          state.tiles.push(newTile)
        }
      }
    },
    removeTile (state, toBeRemoved) {
      if (Object.prototype.hasOwnProperty.call(toBeRemoved, 'file')) {
        state.tiles = state.tiles.filter(visualization => visualization.file !== toBeRemoved.file)
      } else if (Object.prototype.hasOwnProperty.call(toBeRemoved, 'md5')) {
        state.tiles = state.tiles.filter(dataset => dataset._id !== toBeRemoved._id)
      }
    },
    setTiles (state, newTiles) {
      state.tiles = newTiles
    }
  },
  actions: {
    async determineAuthState ({ commit }) {
      try {
        var res = await fetch(`${apibaseurl}/auth/info`, {
          credentials: 'include'
        })
        var info = await res.json()
        this.authenticated = info.authenticated
        commit('updateAuthState', info.authenticated)
        // Forward user to the initial URL and clear from session storage
        if (this.authenticated) {
          router.push(sessionStorage.getItem('intercepted'))
          sessionStorage.removeItem('intercepted')
        }
      } catch (e) {
        commit('updateAuthState', false)
      }
    }
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
