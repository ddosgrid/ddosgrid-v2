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
          <div>Lorem ipsum card content</div>
        </md-card-content>

        <md-card-actions>
          <md-button>Action</md-button>
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
  }
}
</script>

<style scoped>
#flex-container {
  display: flex;
  justify-content: space-between;
}
</style>
