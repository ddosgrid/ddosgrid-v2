<template lang="html">
  <md-card class="card">
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">Port {{ live_tile.port }}</div>
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
      datacollection: this.$store.state.socketData,
      options: { animation: false }
    }
  },
  mounted: function () {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'SOCKET_newData') {
        this.$refs.linechart.update()
      }
    })
  },
  computed: {
    socketData () {
      return this.$store.state.socketData
    }
  },
  methods: {},
  watch: {
    socketData () {
      this.$refs.linechart.update()
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

.md-card-header-text {
  overflow-wrap: anywhere;
}
.vue-grid-item.cssTransforms {
  min-width: 450px!important;
}
</style>
