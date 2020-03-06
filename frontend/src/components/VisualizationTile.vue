<template lang="html">
  <md-card class="card">
    <md-card-header>
        <md-card-header-text>
          <div class="md-title">{{ analysisfile.analysisName }}</div>
        </md-card-header-text>
        <md-card-media class="icon-wrap">
          <img :src="getIconForHash(analysisfile.file)" class="icon">
        </md-card-media>
    </md-card-header>

    <md-card-content>
      <component v-if="!visualizationUnavailable"
                 :url="fileUrl"
                 v-bind:is="currentTabComponent"
                 @unavailable="hideVisualization">
      </component>
      <no-visualization-possible
                 v-else
                 @removeVisualization="clearVisualization(analysisfile)">
      </no-visualization-possible>
    </md-card-content>

    <md-card-actions class="no-print">
      <md-button class="md-icon-button" @click="downloadChart">
        <md-icon>arrow_downward</md-icon>
      </md-button>
      <md-button class="md-icon-button no-print" @click="resizeHandler(analysisfile.i)">
        <md-icon>photo_size_select_large</md-icon>
      </md-button>
      <md-button class="md-icon-button no-print"
                 @click="clearVisualization(analysisfile)">
        <md-icon>close</md-icon>
      </md-button>
    </md-card-actions>

    <a class="download"
       :href="exportUrl"
       target="_blank"
       :download="fileName">Download</a>
  </md-card>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import BarChart from '@/components/BarChart'
import ScatterPlot from '../components/ScatterPlot'
import PieChart from '../components/PieChart'
import WorldMap from '../components/WorldMap'
import VisualizationUnavailable from '../components/VisualizationUnavailable'
import hashicon from 'hashicon'

export default {
  components: {
    'barchart': BarChart,
    'scatterplot': ScatterPlot,
    'piechart': PieChart,
    'worldmap': WorldMap,
    'no-visualization-possible': VisualizationUnavailable
  },
  props: [
    'analysisfile'
  ],
  data: () => {
    return {
      exportUrl: '',
      visualizationUnavailable: false
    }
  },
  computed: {
    currentTabComponent: function () {
      return this.analysisfile.chart.toLowerCase()
    },
    fileUrl: function () {
      return `${apibaseurl}/public/${this.analysisfile.file}`
    },
    fileName: function fileName () {
      return `${this.analysisfile.file}.png`
    }
  },
  methods: {
    hideVisualization: function hideVisualization () {
      this.visualizationUnavailable = true
    },
    getIconForHash: function getIconForHash (file) {
      try {
        var hash = file.split('/')[0]
        return hashicon(hash, { size: 80 }).toDataURL()
      } catch (e) {
        console.log(e)
      }
    },
    clearVisualization: function (analysisfile) {
      // this.$store.commit('removeVisualization', analysisfile)
      this.$store.commit('removeTile', analysisfile)
    },
    downloadChart: function downloadChart () {
      var b64image = this.$el.querySelector('canvas').toDataURL('image/png')
      this.exportUrl = b64image
      setTimeout(() => {
        this.$el.querySelector('.download').click()
      }, 300)
    },
    resizeHandler: function resizeHandler (tileId) {
      this.$emit('resized', tileId)
    }
  }
}
</script>

<style lang="css" scoped>
.download {
  display: none;
}
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
md-card-content {

}
.card {
  -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
       -moz-animation: fadein 1s; /* Firefox < 16 */
        -ms-animation: fadein 1s; /* Internet Explorer */
         -o-animation: fadein 1s; /* Opera < 12.1 */
            animation: fadein 1s;
}

@keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Firefox < 16 */
@-moz-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}

/* Internet Explorer */
@-ms-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
}
</style>
