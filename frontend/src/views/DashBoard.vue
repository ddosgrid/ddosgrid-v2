<template>
  <div class="dashboard">
    <h1>
    Visualization Dashboard
    </h1>
    <div id="flex-container">

      <datasettile>
      </datasettile>
      <visualizationtile>
      </visualizationtile>

      <md-card v-for='url in urls' v-bind:key="url" class="card">
        <md-card-header>
          <div class="md-title">Most Scanned Ports</div>
        </md-card-header>

        <md-card-content>
          <barchart :url='url'>
          </barchart>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>

      <!-- Example of Scatterplot -->
      <md-card class="card">
        <md-card-header>
          <div class="md-title">Overall traffic distribution (TCP/UDP ports)</div>
        </md-card-header>

        <md-card-content>
          <scatterplot :url="`${url}/public/51e721199b326d1d2a79a509f1519658/51e721199b326d1d2a79a509f1519658.pcap-portscan-clustered.json`">
          </scatterplot>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
      <!-- End Example of Scatterplot -->

      <!-- Example of PieChart -->
      <md-card class="card">
        <md-card-header>
          <div class="md-title">TCP states</div>
        </md-card-header>

        <md-card-content>
          <piechart :url="`${url}/public/51e721199b326d1d2a79a509f1519658/51e721199b326d1d2a79a509f1519658.pcap-synfloodanalysis.json`">
          </piechart>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>
      <!-- End Example of PieChart -->
    </div>
    <md-button class="md-fab md-primary md-fab-bottom-right" >
      <md-icon>add</md-icon>
    </md-button>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import BarChart from '@/components/BarChart'
import ScatterPlot from '../components/ScatterPlot'
import PieChart from '../components/PieChart'
import DataSetTile from '../components/DataSetTile'
import VisualizationTile from '../components/VisualizationTile'

export default {
  name: 'DashBoard',
  components: {
    'barchart': BarChart,
    'scatterplot': ScatterPlot,
    'piechart': PieChart,
    'datasettile': DataSetTile,
    'visualizationtile': VisualizationTile
  },
  mounted: async function () {
    var res = await fetch(`${apibaseurl}/analysis`)
    var json = await res.json()
    this.datasets = json
  },
  methods: {
    add: function (file) {
      console.log(file)
      if (Array.isArray(file)) {
        var urls = file.map(el => `${apibaseurl}/public/${file}`)
        console.log(urls)
        this.urls.push([...urls])
      }
    }
  },
  data: function () {
    return {
      urls: [
      ],
      datasets: [],
      url: apibaseurl
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
  width: 10%;
}
.card {
  flex-basis: 700px;
  flex-grow: 1;
  margin: 10px 10px;
}
@media only screen and (max-device-width: 768px){
  .card {
    flex-basis: 100%;
  }
}

</style>
