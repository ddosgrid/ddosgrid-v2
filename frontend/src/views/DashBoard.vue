<template>
  <div class="dashboard">
    <h1>
      This is a dashboard
    </h1>
    <div id="flex-container">

      <md-card v-for='url in urls' v-bind:key="url">
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
  data: function () {
    return {
      urls: [
        'https://api.ddosgrid.online/public/61aa5e77c9bdef137fd00376c9891c31/61aa5e77c9bdef137fd00376c9891c31.pcap-portscan.json',
        'https://api.ddosgrid.online/public/7783cc6dfb0dcd3d2a8202336cf4beb3/7783cc6dfb0dcd3d2a8202336cf4beb3.pcap-portscan.json',
        'https://api.ddosgrid.online/public/50b3fcf30e5801f37e773c8c5ac92420/50b3fcf30e5801f37e773c8c5ac92420.pcap-portscan.json'
      ]
    }
  }
}
</script>

<style scoped>
#flex-container {
  display: flex;
  justify-content: space-between;
}

md-card {
  width: 10%;
}
</style>
