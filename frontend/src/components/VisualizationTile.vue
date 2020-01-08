<template lang="html">
  <md-card class="card">

    <md-card-header>
        <md-card-header-text>
          <div class="md-title">{{ analysisfile.chart }}</div>
        </md-card-header-text>
        <md-card-media class="icon-wrap">
          <img :src="getIconForHash(analysisfile.file)" class="icon">
        </md-card-media>
    </md-card-header>

    <md-card-content>
      <component :url="fileUrl" v-bind:is="currentTabComponent"></component>
    </md-card-content>

    <md-card-actions>
      <md-button @click="clearVisualization(analysisfile)">
        <md-icon>close</md-icon>
      </md-button>
    </md-card-actions>

  </md-card>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import BarChart from '@/components/BarChart'
import ScatterPlot from '../components/ScatterPlot'
import PieChart from '../components/PieChart'
import hashicon from 'hashicon'
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
  methods: {
    getIconForHash: function getIconForHash (file) {
      try {
        var hash = file.split('/')[0]
        return hashicon(hash, { size: 80 }).toDataURL()
      } catch (e) {
        console.log(e)
      }
    },
    clearVisualization: function (analysisfile) {
      this.$store.commit('removeVisualization', analysisfile)
    }
  }
}
</script>

<style lang="css" scoped>
.icon {
  width: 30px;
  height: 30px;
  float: right;
}
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
