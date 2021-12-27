<template>
  <div class="live-analysis">
    <md-empty-state
      md-icon="grid_on"
      md-label="No live connections were added"
      md-description="You can add a tile for each dataset that you have uploaded on the datasets page"
      class="empty-notification"
      v-if="live_tiles.length === 0">
      <md-button class="md-primary md-raised" to="/datasets">Add a live connection</md-button>
    </md-empty-state>
    <grid-layout
      @layout-updated="layoutUpdatedEvent"
      :layout="layout"
      :is-draggable="true"
      :is-resizable="true"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[10, 10]"
      :use-css-transforms="true"
      :rowHeight="400"
      :responsive="true"
      :cols="{ lg: 2, md: 1, sm: 1, xs: 1, xxs: 1 }">

      <grid-item  v-for="live_tile in layout"
                  :key="live_tile.i"
                  :x="live_tile.x"
                  :y="live_tile.y"
                  :w="live_tile.w"
                  :h="live_tile.h"
                  :i="live_tile.i"
                  :minW="1"
                  :minH="1">
                  <div>
                    <LiveVisualizationTile :live_tile="live_tile"></LiveVisualizationTile>
                    <md-button @click="deleteConnection(live_tile.port)">Delete</md-button>
                  </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>

import VueGridLayout from 'vue-grid-layout'
import { apibaseurl } from '@/config/variables'
import LiveVisualizationTile from '../components/LiveVisualizationTile'

export default {
  name: 'LiveAnalysis',
  data: function () {
    return {
      connections: [],
      showLiveConnectionForm: false,
      hasLoaded: false,
      layout: []
    }
  },
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    LiveVisualizationTile: LiveVisualizationTile
  },
  computed: {
    live_tiles: {
      get () {
        return this.$store.state.live_tiles
      }
    }
  },
  methods: {
    layoutUpdatedEvent: function (newLayout) {
      const toBeCommited = JSON.parse(JSON.stringify(newLayout))
      this.$store.commit('setLiveTiles', toBeCommited)
    },
    deleteConnection: function (port) {
      let app = this
      this.$store.commit('removeLiveTile', { port: port })
      fetch(`${apibaseurl}/live-analysis/connection?PORT=${port}`, {
        method: 'DELETE',
        credentials: 'include'
      })
        .then(() => {
          app.$emit('deleted')
        })
        .catch(() => {
          console.error('Unable to delete connection')
        })
    }
  },
  created: function () {
    this.layout = JSON.parse(JSON.stringify(this.live_tiles))
  },
  watch: {
    live_tiles (val) {
      if (val) {
        this.layout = JSON.parse(JSON.stringify(this.live_tiles))
      }
    }
  }
}
</script>

<style scoped>
@media only screen and (max-device-width: 768px) {
  .card {
    flex-basis: 100%;
  }
}
.empty-notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
