<template>
  <div class="dashboard">
    <h1>
    Visualization Dashboard
    </h1>
    <div id="flex-container">
      <visualizationtile class="tile" v-for="analysisfile in analysisfiles" :key="analysisfile.file" :analysisfile="analysisfile">
      </visualizationtile>

      <datasettile class="tile" v-for="dataset in datasets" :key="dataset._id" :dataset="dataset">
      </datasettile>
    </div>

    <md-speed-dial class="md-bottom-right" md-event="hover" id="dial">
      <md-speed-dial-target class="md-primary">
        <md-icon class="md-morph-initial">grid_on</md-icon>
        <md-icon class="md-morph-final">close</md-icon>
        <!--md-icon>storage</md-icon-->
      </md-speed-dial-target>

      <md-speed-dial-content>
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
  </div>
</template>

<script>
import DataSetTile from '../components/DataSetTile'
import VisualizationTile from '../components/VisualizationTile'

export default {
  name: 'DashBoard',
  data: function () {
    return {
      showLoadSetups: false,
      showSaveSetups: false,
      setupName: '',
      loading: false
    }
  },
  components: {
    'datasettile': DataSetTile,
    'visualizationtile': VisualizationTile
  },
  mounted: function () {
    window.gg = this.$store
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
    }
  },
  computed: {
    datasets () {
      return this.$store.state.datasets
    },
    analysisfiles () {
      return this.$store.state.visualizations
    },
    storedSetups () {
      return this.$store.state.setups
    },
    dashBoardIsEmpty () {
      try {
        var { datasets, visualizations } = this.$store.state
        return datasets.length === 0 && visualizations.length === 0
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
#flex-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.tile {
  flex-basis: 600px;
  flex-grow: 1;
  margin: 10px 10px;
}
@media only screen and (max-device-width: 768px){
  .tile {
    flex-basis: 100%;
  }
}

#dial {
  position: fixed;
}
.form {
  padding: 24px 24px 0
}
</style>
