<template>
  <div class="dashboard">
    <h1>
      This is a dashboard
    </h1>
    <barchart></barchart>
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
