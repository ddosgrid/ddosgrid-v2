<template>
  <div class="dashboard">
    <h1>
      This is a dashboard
    </h1>
    <md-card>
      <md-card-header>
        <div class="md-title">Top 10 Most Scanned Ports (You wnot believe!!!11!!)</div>
      </md-card-header>

      <md-card-content>
        <barchart>
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
        <div>Lorem ipsum card content Free bobby shmurda</div>
      </md-card-content>

      <md-card-actions>
        <md-button>Action</md-button>
        <md-button>Action</md-button>
      </md-card-actions>
    </md-card>
  </div>
</template>

<script>
import BarChart from '@/components/BarChart.vue'
export default {
  name: 'DashBoard',
  components: {
    'barchart': BarChart
  }
}
</script>
