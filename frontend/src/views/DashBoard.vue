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

    <!--md-button id="fab" class="md-fab md-primary md-fab-bottom-right" >
      <md-icon>add</md-icon>
    </md-button-->
    <md-speed-dial md-event="hover" id="dial">
      <md-speed-dial-target>
        <md-icon>add</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button">
          <md-icon>note</md-icon>
        </md-button>

        <md-button class="md-icon-button">
          <md-icon>event</md-icon>
        </md-button>
      </md-speed-dial-content>
    </md-speed-dial>
  </div>
</template>

<script>
import DataSetTile from '../components/DataSetTile'
import VisualizationTile from '../components/VisualizationTile'

export default {
  name: 'DashBoard',
  components: {
    'datasettile': DataSetTile,
    'visualizationtile': VisualizationTile
  },
  mounted: function () {
    window.gg = this.$store
  },
  computed: {
    datasets () {
      return this.$store.state.datasets
    },
    analysisfiles () {
      return this.$store.state.visualizations
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
</style>
