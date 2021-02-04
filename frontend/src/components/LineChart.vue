<script>
import {
  Line
} from 'vue-chartjs'

export default {
  extends: Line,
  name: 'Line',
  props: ['url'],
  mounted: async function () {
    try {
      var response = await fetch(this.url)
      var parsedResponse = await response.json()
      // If the data of the response is formatted to be rendered directly we
      // can directly feed it to the renderChart method!
      if (!parsedResponse.hasOwnProperty('linechart')) {
        this.renderChart(parsedResponse.linechart, parsedResponse.options)
      } else {
        var vals = Object.values(parsedResponse.linechart.datasets[0].data)
        var labels = parsedResponse.linechart.labels

        this.renderChart({
          datasets: [{
            backgroundColor: 'rgba(190, 109, 28, 0.7)',
            data: vals,
            label: '0: No Attack, 1: SYN-Flood, 2: ICMP-Flood, 3: UDP-Flood'
          }],
          labels: labels
        }, {
          scales: {
            yAxes: [{
              ticks: {
                max: 7,
                min: 0,
                stepSize: 1
              }
            }]
          },
          legend: {
            display: true,
            labels: {
            }
          }
        })
      }
    } catch (e) {
      console.log(e)
      this.$emit('unavailable')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
