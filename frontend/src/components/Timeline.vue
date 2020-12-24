<template>
  <GChart
    type="Timeline"
    :settings="{ packages: ['corechart', 'timeline'] }"
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
import { GChart } from 'vue-google-charts'

export default {
  name: 'Timeline',
  props: [ 'url' ],
  mounted: async function () {
    try {
      var response = await fetch(this.url)
      var parsedResponse = await response.json()
      console.log(parsedResponse)
      this.$data.chartData = this.$data.chartData.concat(parsedResponse.timeline)
    } catch (e) {
    }
  },
  components: {
    GChart
  },
  data () {
    return {
      chartData: [
        [
          { type: 'string', id: 'BGP Speaker' },
          { type: 'string', id: 'dummy label' },
          { type: 'string', role: 'tooltip' },

          { type: 'number', id: 'Start' },
          { type: 'number', id: 'End' }
        ]
      ],
      chartOptions: {
        chart: {
          title: 'BGP Speakers',
          subtitle: 'Open, Keepalive, Update and Notification messages in chronological order'
        }
      }
    }
  }
}

</script>

<style scoped>
</style>
