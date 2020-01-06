<template>
  <div class="dashboard">
    <h1>
    Visualization Dashboard
    </h1>
    <div id="flex-container">

      <datasettile v-for="dataset in datasets" :key="dataset._id" :dataset="dataset">
      </datasettile>

      <visualizationtile v-for="analysisfile in analysisfiles" :key="analysisfile.file" :analysisfile="analysisfile">
      </visualizationtile>

    </div>

    <md-button id="fab" class="md-fab md-primary md-fab-bottom-right" >
      <md-icon>add</md-icon>
    </md-button>
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

md-card {
  /*width: 30%;*/
}
datasettile, visualizationtile {
  flex-basis: auto;
  flex-grow: 1;
  margin: 10px 10px;
}
@media only screen and (max-device-width: 768px){
  datasettile, visualizationtile {
    flex-basis: 100%;
  }
}

#fab {
  position: fixed;
}
</style>
