<template lang="html">
  <md-card class="card">
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">{{ live_tile.miner }}
        <md-icon  class="icon">help
          <md-tooltip md-direction="right">{{ helpText[live_tile.miner] }}</md-tooltip>
        </md-icon>
        </div>
        <p>Port {{live_tile.port}}</p>
      </md-card-header-text>
    </md-card-header>

    <md-card-content>
      <livelinechart ref="linechart" :chart-data="datacollection" :options="options"></livelinechart>
    </md-card-content>
  </md-card>
</template>

<script>
import LiveLineChart from '../components/LiveLineChart'

export default {
  components: {
    'livelinechart': LiveLineChart
  },
  props: [
    'live_tile'
  ],
  data: function () {
    return {
      exportUrl: '',
      visualizationUnavailable: false,
      visualizationEmpty: false,
      downloadAble: false,
      port: this.live_tile.port,
      datacollection: this.$store.state.socketData[this.live_tile.miner],
      options: {
        animation: false,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }]
        },
        responsive: true,
        maintainAspectRatio: false },
      helpText: {
        ByteCount: 'Shows the cumulative number of bytes',
        PacketCount: 'Shows the cumulative number of collected packets',
        TCPFlagCount: 'Shows the cumulative number of tcp flags'
      }
    }
  },
  mounted: function () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'SOCKET_newData') {
        const interval = setInterval(() => {
          if (this.$refs.linechart) {
            this.$refs.linechart.update()
            clearInterval(interval)
          }
        }, 100)
      }
    })
  },
  computed: {
    socketData () {
      return this.$store.state.socketData
    }
  }
}

</script>

<style lang="css" scoped>
md-card-actions{
  position: fixed;
  bottom: 0;
  right: 0;
}
.card {
  height: 100%;
  width: 100%;
  -webkit-animation: fadein 1s; /* Safari, Chrome and Opera > 12.1 */
  -moz-animation: fadein 1s; /* Firefox < 16 */
  -ms-animation: fadein 1s; /* Internet Explorer */
  -o-animation: fadein 1s; /* Opera < 12.1 */
  animation: fadein 1s;
}
.icon {
  margin-bottom: 5px;
}

@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Firefox < 16 */
@-moz-keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Safari, Chrome and Opera > 12.1 */
@-webkit-keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Internet Explorer */
@-ms-keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
</style>
