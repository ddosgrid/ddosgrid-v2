<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  name: 'BarChart',
  props: [ 'dataset' ],
  mounted: async function () {
    let response = await fetch('https://api.ddosgrid.online/public/61aa5e77c9bdef137fd00376c9891c31/61aa5e77c9bdef137fd00376c9891c31.pcap-portscan.json')
    let parsedResponse = await response.json()
    console.log(parsedResponse)

    let ports = parsedResponse.topTen.map(item => item.port)
    let count = parsedResponse.topTen.map(item => item.count)

    // make fetch, get labels, and pass data
    this.renderChart({
      labels: ports,
      datasets: [
        {
          label: 'Data One',
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
