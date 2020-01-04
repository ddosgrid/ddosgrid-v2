<script>
import { Scatter } from 'vue-chartjs'

export default {
  extends: Scatter,
  name: 'ScatterChart',
  props: [ 'url' ],
  mounted: async function () {
    let response = await fetch(this.url)
    let parsedResponse = await response.json()
    var clusteredPortsCounted = parsedResponse.clusters.map((count, index) => {
      return { x: index * 64, y: count }
    })
    var filteredPorts = clusteredPortsCounted.filter((bucket) => {
      return bucket.y > 0
    })
    // make fetch, get labels, and pass data
    this.renderChart({
      datasets: [
        {
          label: 'Count',
          backgroundColor: '#f87979',
          data: filteredPorts
        }
      ]
    }, {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        Axes: [{
        }]
      } })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
