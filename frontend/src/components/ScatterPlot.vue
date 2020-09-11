<script>
import { Scatter } from 'vue-chartjs'
var cleaned

export default {
  extends: Scatter,
  name: 'ScatterChart',
  props: [ 'url', 'yscale' ],
  mounted: async function () {
    try {
      let response = await fetch(this.url)
      let parsedResponse = await response.json()
      var clusteredPortsCounted = parsedResponse.clusters.map((count, index) => {
        return { x: index * 64, y: count }
      })
      cleaned = clusteredPortsCounted.filter((bucket) => {
        return bucket.y > 0
      })
      // make fetch, get labels, and pass data
      setTimeout(() => {
        this.renderScatterplot(cleaned)
      }, 300)
    } catch (e) {
      console.log('cant be rendnernd')
      console.log(e)
      this.$emit('unavailable')
    }
  },
  methods: {
    renderScatterplot: function renderScatterplot (cleaned) {
      this.renderChart({
        datasets: [
          {
            label: 'Count',
            backgroundColor: '#f87979',
            data: cleaned
          }
        ]
      }, {
        tooltips: {
          callbacks: {
            label: function (item) {
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
            type: this.yscale || 'linear',
            scaleLabel: {
              display: true,
              labelString: 'Number of segments'
            },
            ticks: {
              precision: 0
            }
          }],
          xAxes: [{
            allowDecimals: false,
            scaleLabel: {
              display: true,
              labelString: 'Port ranges in buckets (64 ports per bucket)'
            },
            ticks: {
              precision: 0,
              callback: function (val) {
                return `${val}-${val + 64}`
              }
            }
          }]
        }
      })
    }
  },
  watch: {
    yscale: function () {
      this.renderScatterplot(cleaned)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
