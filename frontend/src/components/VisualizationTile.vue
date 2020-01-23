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
      <component :url="fileUrl" v-bind:is="currentTabComponent"></component>
    </md-card-content>

    <md-card-actions>
      <md-button class="md-icon-button" @click="downloadChart">
        <md-icon>arrow_downward</md-icon>
      </md-button>
      <md-button class="md-icon-button" @click="clearVisualization(analysisfile)">
        <md-icon>close</md-icon>
      </md-button>
    </md-card-actions>

    <a class="download" :href="exportUrl" target="_blank" :download="fileName">Download</a>
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
  data: () => {
    return {
      exportUrl: ''
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
    },
    downloadChart: function downloadChart () {
      var b64image = this.$el.querySelector('canvas').toDataURL('image/png')
      this.exportUrl = b64image
      setTimeout(() => {
        this.$el.querySelector('.download').click()
      }, 300)
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
