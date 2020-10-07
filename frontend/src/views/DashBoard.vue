''<template>
  <div class="dashboard">
  <grid-layout
          @layout-updated="layoutUpdatedEvent"
          :layout="layout"
          :is-draggable="true"
          :is-resizable="true"
          :is-mirrored="false"
          :vertical-compact="true"
          :margin="[10, 10]"
          :use-css-transforms="true"
          :rowHeight="600"
          :responsive="true"
          :cols="{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }">

      <grid-item  v-for="tile in layout"
                 :key="tile.i"
                 :x="tile.x"
                 :y="tile.y"
                 :w="tile.w"
                 :h="tile.h"
                 :i="tile.i"
                 :minW="1"
                 :minH="1">
                 <component class="datasetordashboard" v-bind:class="{ 'transparent': !tile.show }"
                 v-bind:is="getComponentType(tile)" :analysisfile="tile"
                 :dataset="tile" @resized="resizeTile" @filterSet="setFilter"></component>
      </grid-item>
  </grid-layout>
  <md-empty-state
    md-icon="grid_on"
    md-label="No analysis files were added"
    md-description="You can add a tile for each dataset that you have uploaded on the datasets page" v-if="tiles.length === 0" class="empty-notification">
    <md-button class="md-primary md-raised" to="/datasets">Open a dataset</md-button>
  </md-empty-state>

    <md-speed-dial class="md-bottom-right no-print above" md-event="hover" id="dial">
      <md-speed-dial-target class="md-primary">
        <md-icon class="md-morph-initial">grid_on</md-icon>
        <md-icon class="md-morph-final no-print">close</md-icon>
        <!--md-icon>storage</md-icon-->
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button :disabled="dashBoardIsEmpty" class="md-icon-button" @click="clearDashboard">
          <md-tooltip md-direction="top" v-if="dashBoardIsEmpty">Dashboard is already empty</md-tooltip>
          <md-tooltip md-direction="top" v-else>Clear the dashboard</md-tooltip>
          <md-icon>clear</md-icon>
        </md-button>
        <md-button :disabled="dashBoardIsEmpty" class="md-icon-button" @click="showFilter = !showFilter">
          <md-tooltip md-direction="top" v-if="dashBoardIsEmpty">Dashboard is empty</md-tooltip>
          <md-tooltip md-direction="top" v-else>Filter by Datasets</md-tooltip>
          <md-icon>filter_list</md-icon>
        </md-button>

        <md-button :disabled="dashBoardIsEmpty" class="md-icon-button" @click="exportToPdf">
          <md-tooltip md-direction="top" v-if="dashBoardIsEmpty">Please add some visualizations first</md-tooltip>
          <md-tooltip md-direction="top" v-else>Export dashboard as PDF or print it</md-tooltip>
          <md-icon>picture_as_pdf</md-icon>
        </md-button>

        <md-button :disabled="!savedDashBoardsExist" class="md-icon-button" @click="showLoadSetups = !showLoadSetups">
          <md-tooltip md-direction="top" v-if="savedDashBoardsExist">Load a previously stored setup</md-tooltip>
          <md-tooltip md-direction="top" v-else>No setups saved</md-tooltip>
          <md-icon>restore</md-icon>
        </md-button>

        <md-button :disabled="dashBoardIsEmpty" class="md-icon-button" @click="showSaveSetups = !showSaveSetups">
          <md-tooltip md-direction="top" v-if="dashBoardIsEmpty">Please add some visualizations first</md-tooltip>
          <md-tooltip md-direction="top" v-else>Save your current setup</md-tooltip>
          <md-icon>save</md-icon>
        </md-button>
      </md-speed-dial-content>
    </md-speed-dial>

    <md-dialog :md-active.sync="showLoadSetups">
      <md-dialog-title>Load a saved dashboard</md-dialog-title>
      <md-list>
        <md-list-item v-for="setup in storedSetups" :key="setup.id">
        <md-button class="md-raised md-primary md-icon-button" @click="loadSetup(setup.id)" v-if="!loading">
          <md-icon>restore</md-icon>
        </md-button>
          <span class="md-list-item-text">{{setup.name}}</span>
        </md-list-item>
      </md-list>

      <md-dialog-actions>
        <md-button class="md-primary" @click="showLoadSetups = false">
          <md-icon>close</md-icon>
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showSaveSetups">
      <md-dialog-title>Save this dashboard</md-dialog-title>
      <div class="form">
        <md-field>
          <label>Name</label>
          <md-input v-model="setupName" placeholder="Give the setup a name"></md-input>
        </md-field>
        <md-button :disabled="!setupName" class="md-raised md-primary md-icon-button" @click="saveSetup" v-if="!loading">
          <md-icon>save</md-icon>
        </md-button>
        <md-progress-spinner v-else :md-diameter="36" :md-stroke="4" md-mode="indeterminate"></md-progress-spinner>
      </div>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showSaveSetups = false">
          <md-icon>close</md-icon>
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog :md-active.sync="showFilter">
      <md-dialog-title>Filter the Dashboard by Datasets</md-dialog-title>
      <div class="form">
        <div class="chip" v-for="dataset in getDatasets()" :key="dataset.i">
          <md-chip  v-bind:class="{ 'md-primary': dataset.show, 'md-accent': !dataset.show }" md-clickable @click="setFilter(dataset.i)">{{ dataset.name }}</md-chip>
        </div>
      </div>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showFilter = false">
          <md-icon>close</md-icon>
        </md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import VueGridLayout from 'vue-grid-layout'

import DataSetTile from '../components/DataSetTile'
import VisualizationTile from '../components/VisualizationTile'

export default {
  name: 'DashBoard',
  data: function () {
    return {
      showLoadSetups: false,
      showSaveSetups: false,
      showFilter: false,
      setupName: '',
      loading: false,
      layout: []
    }
  },
  components: {
    'datasettile': DataSetTile,
    'visualizationtile': VisualizationTile,
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem
  },
  created: function () {
    this.layout = JSON.parse(JSON.stringify(this.tiles))
  },
  mounted: function () {
  },
  watch: {
    tiles (val) {
      // needed for adding tiles
      if (val) {
        this.layout = JSON.parse(JSON.stringify(this.tiles))
      }
    }
  },
  methods: {
    loadSetup: function saveSetup (id) {
      this.loading = true
      this.$store.commit('loadSetup', id)
      setTimeout(() => {
        this.loading = false
        this.showLoadSetups = false
      }, 300)
    },
    saveSetup: function saveSetup () {
      this.loading = true
      this.$store.commit('storeSetup', this.setupName)
      setTimeout(() => {
        this.loading = false
        this.showSaveSetups = false
      }, 300)
    },
    exportToPdf: function exportToPdf () {
      window.print()
    },
    getComponentType: function getComponentType (tile) {
      if (Object.prototype.hasOwnProperty.call(tile, 'file')) {
        return 'visualizationtile'
      } else if (Object.prototype.hasOwnProperty.call(tile, 'md5')) {
        return 'datasettile'
      }
    },
    layoutUpdatedEvent: function (newLayout) {
      const toBeCommited = JSON.parse(JSON.stringify(newLayout))
      this.$store.commit('setTiles', toBeCommited)
    },
    resizeTile: function (tileId) {
      var tileIndex = this.layout.findIndex(tile => tile.i === tileId)
      if (tileIndex !== -1) {
        if (this.layout[tileIndex].w === 2) {
          this.layout[tileIndex].w = 1
        } else {
          this.layout[tileIndex].w = 2
        }
      }
    },
    clearDashboard: function clearDashboard () {
      this.$store.commit('setTiles', [])
    },
    getDatasets: function () {
      return this.layout.filter(tile => typeof tile.md5 !== 'undefined')
    },
    setFilter: function (hash) {
      this.layout = this.layout.map(tile => {
        if (tile.i.startsWith(hash)) {
          tile.show = !tile.show
        }
        return tile
      })
    }
  },
  computed: {
    tiles: {
      get () {
        return this.$store.state.tiles
      },
      set (newLayout) {
        this.$store.commit('setTiles', newLayout)
      }
    },
    storedSetups () {
      return this.$store.state.setups
    },
    dashBoardIsEmpty () {
      try {
        var openTiles = this.$store.state.tiles
        return openTiles.length === 0
      } catch (e) {
        return false
      }
    },
    savedDashBoardsExist () {
      try {
        return this.$store.state.setups.length > 0
      } catch (e) {
        return false
      }
    }
  }
}
</script>

<style scoped>
.dashboard {
  width: 100%;
  user-select: none;
}
@media print {
  .no-print, .no-print * {
    display: none !important;
  }
}

#dial {
  position: fixed;
}
.form {
  padding: 0px 24px;
}
.empty-notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.above {
  z-index: 1;
}
.datasetordashboard {
}
.chip {
  display: block;
  margin-bottom: 10px;
}
.transparent {
  opacity: 0.2 !important;
}
</style>
