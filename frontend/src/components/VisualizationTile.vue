<template lang="html">
  <md-card class="card">
    <md-card-header>
        <md-card-header-text>
          <div class="md-title">{{ analysisfile.analysisName }}</div>
        </md-card-header-text>
        <md-card-media class="icon-wrap">
          <md-button class="md-icon-button enlarged-button" @click="filterEvent(analysisfile.datasetHash)">
            <img :src="getIconForHash(analysisfile.datasetHash)" class="icon">
          </md-button>
        </md-card-media>
    </md-card-header>

    <md-card-content>
      <component v-if="!visualizationUnavailable && !visualizationEmpty"
                 :url="fileUrl"
                 :yscale="scaleType"
                 v-bind:is="currentTabComponent"
                 @unavailable="hideVisualization"
                 @empty="showWarning">
      </component>
      <no-visualization-possible
                 v-if="visualizationUnavailable"
                 @removeVisualization="clearVisualization(analysisfile)">
      </no-visualization-possible>
      <empty-dataset
                 v-if="visualizationEmpty"
                 @removeVisualization="clearVisualization(analysisfile)">
      </empty-dataset>
    </md-card-content>

    <md-card-actions class="no-print" md-alignment="space-between">
      <div>
        <md-switch v-model="scaleType" value="logarithmic" v-if="typesThatSupportLogCharts.includes(currentTabComponent)"> Logarithmic</md-switch>
      </div>
      <div>
        <md-button class="md-icon-button" @click="downloadChart" v-if="downloadAble">
          <md-icon>arrow_downward</md-icon>
        </md-button>
        <md-button class="md-icon-button no-print" @click="resizeHandler(analysisfile.i)">
          <md-icon>photo_size_select_large</md-icon>
        </md-button>
        <md-button class="md-icon-button no-print"
                   @click="clearVisualization(analysisfile)">
          <md-icon>close</md-icon>
        </md-button>
      </div>
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
import LineChart from '../components/LineChart'
import Timeline from '../components/Timeline'
import VisualizationUnavailable from '../components/VisualizationUnavailable'
import VisualizationEmpty from '../components/VisualizationEmpty'
import hashicon from 'hashicon'

export default {
  components: {
    'barchart': BarChart,
    'scatterplot': ScatterPlot,
    'piechart': PieChart,
    'worldmap': WorldMap,
    'timeline': Timeline,
    'no-visualization-possible': VisualizationUnavailable,
    'empty-dataset': VisualizationEmpty,
    'linechart': LineChart
  },
  props: [
    'analysisfile'
  ],
  data: () => {
    return {
      exportUrl: '',
      visualizationUnavailable: false,
      visualizationEmpty: false,
      downloadAble: false,
      scaleType: 'linear',
      typesThatSupportLogCharts: [ 'scatterplot' ]
    }
  },
  mounted: function () {
    this.determineDownloadable()
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
    showWarning: function showWarning () {
      this.visualizationEmpty = true
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
    determineDownloadable: function () {
      this.downloadAble = this.$el.querySelector('canvas') !== null
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
    },
    filterEvent: function (i) {
      console.log('click')
      this.$emit('filterSet', i)
    }
  }
}
</script>

<style lang="css" scoped>
.download {
  display: none;
}
.enlarged-button {
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
}
.icon {
  width: 30px;
  height: 30px;
}
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
md-card-actions{
  position: fixed;
  bottom: 0;
  right: 0;
}
.card {
  height: 100%;
  width: 100%;
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

.md-card-header-text {
  overflow-wrap: anywhere;
}
.vue-grid-item.cssTransforms {
  min-width: 450px!important;
}
</style>
