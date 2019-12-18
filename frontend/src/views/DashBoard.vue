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
  </div>
</template>

<script>
import BarChart from '@/components/BarChart.vue'
export default {
  name: 'DashBoard',
  components: {
    'barchart': BarChart
  },
  mounted: async function () {
    var res = await fetch('https://api.ddosgrid.online/analysis')
    var json = await res.json()
    this.datasets = json
  },
  methods: {
    add: function (file) {
      console.log(file)
      if (Array.isArray(file)) {
        var urls = file.map(el => `https://api.ddosgrid.online/public/${file}`)
        console.log(urls)
        this.urls.push([...urls])
      }
    }
  },
  data: function () {
    return {
      urls: [
        'https://api.ddosgrid.online/public/61aa5e77c9bdef137fd00376c9891c31/61aa5e77c9bdef137fd00376c9891c31.pcap-portscan.json',
        'https://api.ddosgrid.online/public/7783cc6dfb0dcd3d2a8202336cf4beb3/7783cc6dfb0dcd3d2a8202336cf4beb3.pcap-portscan.json',
        'https://api.ddosgrid.online/public/50b3fcf30e5801f37e773c8c5ac92420/50b3fcf30e5801f37e773c8c5ac92420.pcap-portscan.json'
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
