<script>
import { Scatter } from 'vue-chartjs'

export default {
  extends: Scatter,
  name: 'ScatterChart',
  props: [ 'url' ],
  mounted: async function () {
    try {
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
        tooltips: {
          callbacks: {
            label: function (item) {
              console.log(arguments)
              var bucket = item.xLabel
              var count = item.yLabel
              return `Port range ${bucket}-${bucket + 64} received ${count} segments`
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Number of segments'
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Port ranges in buckets (64 ports per bucket)'
            },
            ticks: {
              callback: function (val) {
                return `${val}-${val + 64}`
              }
            }
          }]
        }
      })
    } catch (e) {
      console.log('cant be rendnernd')
      console.log(e)
      this.$emit('unavailable')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
