<template>
  <div class="dashboard">
    <h1>
    Visualization Dashboard
    </h1>
    <div id="flex-container">

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

      <md-card class="card">
        <md-card-header>
          <div class="md-title">Overall traffic distribution (TCP/UDP ports)</div>
        </md-card-header>

        <md-card-content>
          <scatterplot :url='"http://localhost:3000/public/9bcc581df61965d6aefda87f7beb690c/9bcc581df61965d6aefda87f7beb690c.pcap-portscan-clustered.json"'>
          </scatterplot>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>

      <md-card class="card">
        <md-card-header>
          <div class="md-title">Available datasets</div>
        </md-card-header>

        <md-card-content>
          <md-list>
            <md-list-item class="listitem" v-bind:key="dataset.id" v-for='dataset in datasets' @click="add(dataset.analysisFiles)">
              {{dataset.id}}
              <md-button class="btn md-icon-button md-dense md-raised md-primary">
                <md-icon @click="add(dataset.analysisFiles)">add</md-icon>
              </md-button>
            </md-list-item>
          </md-list>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>

    </div>
    <md-button class="md-fab md-primary md-fab-bottom-right" >
      <md-icon>add</md-icon>
    </md-button>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import BarChart from '@/components/BarChart.vue'
import ScatterPlot from '../components/ScatterPlot'

export default {
  name: 'DashBoard',
  components: {
    'barchart': BarChart,
    'scatterplot': ScatterPlot
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
      datasets: []
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
