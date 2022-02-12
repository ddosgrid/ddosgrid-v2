<template>
  <div class="live-analysis">
    <md-empty-state
      md-icon="grid_on"
      md-label="No live connections were added"
      md-description="You can add a tile for each dataset that you have uploaded on the datasets page"
      class="empty-notification"
      v-if="connections.length === 0">
      <md-button class="md-primary md-raised" to="/datasets">Add a live connection</md-button>
    </md-empty-state>
    <grid-layout
      v-if="connections.length > 0"
      @layout-updated="layoutUpdatedEvent"
      :layout="layout"
      :is-draggable="false"
      :is-resizable="false"
      :is-mirrored="false"
      :vertical-compact="true"
      :margin="[10, 10]"
      :use-css-transforms="true"
      :rowHeight="550"
      :responsive="true"
      :cols="{ lg: 1, md: 1, sm: 1, xs: 1, xxs: 1 }">

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
                  </div>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>

import VueGridLayout from 'vue-grid-layout'
import LiveVisualizationTile from '../components/LiveVisualizationTile'
import { apibaseurl } from '@/config/variables'

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
  mounted: function () {
    this.fetchConnections()
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
    fetchConnections: async function fetchConnections () {
      try {
        const res = await fetch(`${apibaseurl}/live-analysis/connection`, { credentials: 'include' })
        this.connections = await res.json()
        this.hasLoaded = true
      } catch (e) {
        console.warn(e)
      }
    }
  },
  created: function () {
    this.layout = JSON.parse(JSON.stringify(this.$store.state.live_tiles))
  },
  watch: {
    live_tiles (val) {
      if (val) {
        this.layout = JSON.parse(JSON.stringify(this.$store.state.live_tiles))
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
