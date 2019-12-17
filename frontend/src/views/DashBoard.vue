<template>
  <div class="dashboard">
    <h1>
      This is a dashboard
    </h1>
    <div id="flex-container">
      <md-card>
        <md-card-header>
          <div class="md-title">Most Scanned Ports</div>
        </md-card-header>

        <md-card-content>
          <barchart :url='this.portscanURL1'>
          </barchart>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>

      <md-card>
        <md-card-header>
          <div class="md-title">Card Thing</div>
        </md-card-header>

        <md-card-content>
          <div>Lorem ipsum card content</div>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>

      <md-card>
        <md-card-header>
          <div class="md-title">Most Scanned Ports</div>
        </md-card-header>

        <md-card-content>
          <barchart :url='this.portscanURL2'>
          </barchart>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
        </md-card-actions>
      </md-card>

      <md-card>
        <md-card-header>
          <div class="md-title">Card Thing</div>
        </md-card-header>

        <md-card-content>
          <div>Lorem ipsum card content  </div>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
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
      portscanURL1: 'https://api.ddosgrid.online/public/61aa5e77c9bdef137fd00376c9891c31/61aa5e77c9bdef137fd00376c9891c31.pcap-portscan.json',
      portscanURL2: 'https://api.ddosgrid.online/public/7783cc6dfb0dcd3d2a8202336cf4beb3/7783cc6dfb0dcd3d2a8202336cf4beb3.pcap-portscan.json'
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
