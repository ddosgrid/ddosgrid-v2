<script>
import { Line, mixins } from 'vue-chartjs'

export default {
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: ['options'],
  mounted: function () {
    try {
      // If the data of the response is formatted to be rendered directly we
      // can directly feed it to the renderChart method!
      this.renderChart(this.chartData, this.options)
    } catch (e) {
      console.log(e)
      this.$emit('unavailable')
    }
  },
  methods: {
    update () {
      this.renderChart(this.chartData, this.options)
    }
  }
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
