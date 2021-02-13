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

        var opacity = vals.length > 1000 ? 0 : 0.5

        vals = vals.map((value) => {
          switch (value) {
            case 0:
              return 'No Attack'
            case 1:
              return 'SYN Flood'
            case 2:
              return 'ICMP Flood'
            case 3:
              return 'UDP Flood'
            case 4:
              return 'IP Sweep'
            case 5:
              return 'Ping of Death'
            case 6:
              return 'Port Sweep'
            default:
          }
        })

        this.renderChart({
          yLabels: ['No Attack', 'SYN Flood', 'ICMP Flood', 'UDP Flood', 'IP Sweep', 'Ping of Death', 'Port Sweep'],
          datasets: [{
            backgroundColor: `rgba(190, 109, 28, ${opacity})`,
            data: vals,
            label: 'Attack Types in Time Window'
          }],
          labels: labels.map(s => new Date(s * 1e3).toISOString().slice(-13, -5))
        }, {
          scales: {
            xAxes: [{
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Time'
              }
            }],
            yAxes: [{
              type: 'category',
              position: 'left',
              display: true,
              scaleLabel: {
                display: true,
                labelString: 'Attack Type'
              },
              ticks: {
                reverse: true
              }
            }]
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
