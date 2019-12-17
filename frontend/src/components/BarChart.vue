<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  name: 'BarChart',
  props: [ 'url' ],
  mounted: async function () {
    let response = await fetch(this.url)
    let parsedResponse = await response.json()
    console.log(parsedResponse)

    let ports = parsedResponse.topTen.map(item => item.port)
    let count = parsedResponse.topTen.map(item => item.count)

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
    }, { responsive: true,
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }]
      } })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
