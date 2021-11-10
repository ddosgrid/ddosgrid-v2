<template>
  <div class="live-analysis">
    <md-empty-state
      md-icon="grid_on"
      md-label="No live connections were added"
      md-description="You can add a tile for each dataset that you have uploaded on the datasets page" class="empty-notification">
      <md-button class="md-primary md-raised" to="/datasets">Add a live connection</md-button>
    </md-empty-state>
  </div>
</template>

<script>

// import { apibaseurl } from '@/config/variables.js'

export default {
  name: 'LiveAnalysis',
  data: function () {
    return {
      connections: [],
      showLiveConnectionForm: false,
      hasLoaded: false
    }
  },
  components: {},
  computed: {},
  methods: {},
  watch: {}
}
</script>

<style scoped>
@media only screen and (max-device-width: 768px) {
  .card {
    flex-basis: 100%;
  }
}
.wrapper {
  scrollbar-width: none;
}

.wrapper::-webkit-scrollbar {
  display: none;
}

.connection {
  margin-bottom: 10px;
}

.md-dialog {
  width: 50%;
  max-width: 768px;
}
.connection-wrap {
  max-width: 800px;
  margin: auto;
}
#fab {
  position: fixed;
}
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.success-icon {
  color: #30b375 !important;
}
.empty-notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
