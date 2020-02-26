<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  name: 'BarChart',
  props: [ 'url' ],
  mounted: async function () {
    try {
      let response = await fetch(this.url)
      let parsedResponse = await response.json()

      let ports
      let count
      try {
        ports = parsedResponse.topTen.map(item => item.port)
        count = parsedResponse.topTen.map(item => item.count)
      } catch (e) {
        ports = parsedResponse.topTwenty.map(item => item.port)
        count = parsedResponse.topTwenty.map(item => item.count)
      }

      // make fetch, get labels, and pass data
      this.renderChart({
        labels: ports,
        datasets: [
          {
            label: 'Count',
            backgroundColor: '#f87979',
            data: count
          }
        ]
      }, {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Destination UDP/TCP port'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Number of segments'
            },
            ticks: {
              beginAtZero: true
            }
          }]
        }
      })
    } catch (e) {
      this.$emit('unavailable')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
