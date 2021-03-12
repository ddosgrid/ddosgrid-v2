<script>
import {
  Doughnut,
  mixins
} from 'vue-chartjs'

const {
  reactiveProp
} = mixins

export default {
  extends: Doughnut,
  name: 'Doughnut',
  mixins: [reactiveProp],
  mounted: async function () {
    try {
      this.renderChart(this.chartData, {
        responsive: true,
        maintainAspectRatio: false
      })
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
