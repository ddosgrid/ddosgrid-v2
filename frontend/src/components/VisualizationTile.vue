<template lang="html">
  <md-card class="card">
    <md-card-header>
      <div class="md-title">vis tile</div>
    </md-card-header>

    <md-card-content>
      <component :url="fileUrl" v-bind:is="currentTabComponent"></component>
    </md-card-content>

    <md-card-actions>
      <md-button>Action</md-button>
    </md-card-actions>
  </md-card>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import BarChart from '@/components/BarChart'
import ScatterPlot from '../components/ScatterPlot'
import PieChart from '../components/PieChart'
export default {
  components: {
    'barchart': BarChart,
    'scatterplot': ScatterPlot,
    'piechart': PieChart
  },
  props: [
    'analysisfile'
  ],
  computed: {
    currentTabComponent: function () {
      return this.analysisfile.chart.toLowerCase()
    },
    fileUrl: function () {
      return `${apibaseurl}/public/${this.analysisfile.file}`
    }
  },
  data: function () {
    return {
    }
  }
}
</script>

<style lang="css" scoped>
</style>
