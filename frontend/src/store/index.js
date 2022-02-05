import Vue from 'vue'
import Vuex from 'vuex'
import createPersist from 'vuex-localstorage'
import { apibaseurl, demoUserEmail } from '@/config/variables.js'
import router from '../router'

Vue.use(Vuex)

function getTime (timestamp) {
  const date = new Date(timestamp)
  const hours = date.getHours()
  const min = '0' + date.getMinutes()
  const sec = '0' + date.getSeconds()
  return hours + ':' + min.substr(-2) + ':' + sec.substr(-2)
}

// time range of life analysis visualizations (i.e. number of displayed and cached data points)
const LIVETIMERANGE = 60

export default new Vuex.Store({
  state: {
    setups: [],
    tiles: [],
    live_tiles: [],
    authenticated: false,
    demomode: false,
    nrOfAnalysedDatasets: [],
    nrOfConnections: 0,
    socketData: {}
  },
  mutations: {
    // handle new incoming data from websocket
    SOCKET_newData (state, data) {
      let newData = null
      // populate socketData state with separate data for each miner type
      switch (data.miner) {
        case 'ByteCount':
          newData = state.socketData.ByteCount
          if (state.socketData.ByteCount.labels.length > LIVETIMERANGE) {
            newData.labels.shift()
            newData.datasets[0].data.shift()
            Vue.set(this.state.socketData.ByteCount.datasets, newData)
          }
          newData.labels.push(getTime(data.timestampBeforeMiningFirstFlowPacket))
          newData.datasets[0].data.push(data.aggData)
          Object.assign(state.socketData.ByteCount, newData)
          break
        case 'PacketCount':
          newData = state.socketData.PacketCount
          if (state.socketData.PacketCount.labels.length > LIVETIMERANGE) {
            newData.labels.shift()
            newData.datasets[0].data.shift()
            Vue.set(this.state.socketData.PacketCount.datasets, newData)
          }
          newData.labels.push(getTime(data.timestampBeforeMiningFirstFlowPacket))
          newData.datasets[0].data.push(data.aggData)
          Object.assign(state.socketData.PacketCount, newData)
          break
        case 'TCPFlagCount':
          newData = state.socketData.TCPFlagCount
          if (state.socketData.TCPFlagCount.labels.length > LIVETIMERANGE) {
            newData.labels.shift()
            newData.datasets[0].data.shift()
            Vue.set(this.state.socketData.TCPFlagCount.datasets, newData)
          }
          newData.labels.push(getTime(data.timestampBeforeMiningFirstFlowPacket))
          newData.datasets[0].data.push(data.aggData)
          Object.assign(state.socketData.TCPFlagCount, newData)
          break
        default:
          console.error('unknown miner!')
      }
    },
    // reset socketData state to initial state
    clear_socketData (state) {
      Object.assign(state.socketData, {
        ByteCount: {
          labels: [],
          datasets: [
            {
              label: 'total in bytes',
              backgroundColor: '#f87979',
              data: []
            }],
          options: {}
        },
        PacketCount: {
          labels: [],
          datasets: [
            {
              label: 'total in packets',
              backgroundColor: '#13f31c',
              data: []
            }],
          options: {}
        },
        TCPFlagCount: {
          labels: [],
          datasets: [
            {
              label: 'total in packets',
              backgroundColor: '#1d47d7',
              data: []
            }],
          options: {}
        }
      })
    },
    updateNrOfAnalysedSetups (state, newnr) {
      if (newnr > state.nrOfAnalysedDatasets) {
        var msg = '✓ New dataset available!'
        if (!('Notification' in window)) {
          return null
        } else if (Notification.permission === 'granted') {
          // This will create an ESLint error since the Notification API only
          // requires the constructor to be invoked (variable unused).
          var notification = new Notification(msg, { // eslint-disable-line
            icon: './img/icons/android-chrome-512x512.png',
            body: 'You can now open this dataset for visualization. Click this notification to overview your datasets.'
          })
          notification.onclick = function () {
            router.push('datasets')
          }
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(function (permission) {
            if (permission === 'granted') {
              var notification = new Notification(msg, { icon: './img/icons/android-chrome-512x512.png' })
              console.log(notification)
            }
          })
        }
      }
      state.nrOfAnalysedDatasets = newnr
    },
    updateAuthState (state, authenticated = false) {
      state.authenticated = authenticated
    },
    updateConstrainedMode (state, constrained = false) {
      state.demomode = constrained
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
    addConnection (state) {
      if (state.nrOfConnections <= 0) {
        state.nrOfConnections = 0
      }
      state.nrOfConnections++
    },
    removeConnection (state) {
      state.nrOfConnections--
      if (state.nrOfConnections < 0) {
        state.nrOfConnections = 0
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
    },
    addLiveTile (state, newTile) {
      if (Object.prototype.hasOwnProperty.call(newTile, 'port')) {
        let found = state.live_tiles.find(existingVisualisation => newTile.miner === existingVisualisation.miner)
        if (!found) {
          newTile.x = 0
          newTile.y = state.live_tiles.length
          newTile.h = 1
          newTile.w = 1
          newTile.key = newTile.miner
          newTile.i = newTile.miner
          newTile.show = true
          state.live_tiles.push(newTile)
        }
      }
    },
    removeLiveTile (state, toBeRemoved) {
      if (Object.prototype.hasOwnProperty.call(toBeRemoved, 'port')) {
        state.live_tiles = state.live_tiles.filter(visualization => visualization.port !== toBeRemoved.port)
      }
    },
    setLiveTiles (state, newLiveTiles) {
      state.live_tiles = newLiveTiles
    }
  },
  actions: {
    async pollAnalyses ({ commit }) {
      try {
        var res = await fetch(`${apibaseurl}/analysis`, { credentials: 'include' })
        var json = await res.json()
        this.datasets = json
        this.hasLoaded = true
        var nrOfAnalysedSetups = this.datasets.filter(d => {
          return d.status === 'analysed'
        }).length
        commit('updateNrOfAnalysedSetups', nrOfAnalysedSetups)
      } catch (e) {
        console.log(e)
      }
    },
    async determineAuthState ({ commit }) {
      try {
        var res = await fetch(`${apibaseurl}/auth/info`, {
          credentials: 'include'
        })
        var info = await res.json()
        this.authenticated = info.authenticated
        commit('updateAuthState', info.authenticated)
        // Forward user to the initial URL and clear from session storage
        if (this.authenticated && sessionStorage.getItem('intercepted')) {
          router.push(sessionStorage.getItem('intercepted'))
          sessionStorage.removeItem('intercepted')
        }
        // check if the user is logged in with the demo account
        var constrained = info.email === demoUserEmail
        commit('updateConstrainedMode', constrained)
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
