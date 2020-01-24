<script>
import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
  name: 'Doughnut',
  props: [ 'url' ],
  mounted: async function () {
    try {
      var response = await fetch(this.url)
      var parsedResponse = await response.json()
      var vals = Object.values(parsedResponse.data)
      var labels = parsedResponse.labels

      this.renderChart({
        datasets: [
          {
            backgroundColor: vals.map(getRandomHexColro),
            data: vals
          }
        ],
        labels: labels
      })
    } catch (e) {
      this.$emit('unavailable')
    }
  }
}

function getRandomHexColro () {
  return `#${(Math.random() * 0xFFFFFF << 0).toString(16)}`
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
