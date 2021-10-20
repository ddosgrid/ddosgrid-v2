<template>
  <div class="live-analysis">

    <md-empty-state
      md-icon="link_off"
      md-label="No Connection added"
      class="centered">
      <md-button class="md-primary md-raised" @click="showLiveConnectionForm = true">Add a connection</md-button>
    </md-empty-state>

    <md-dialog :md-active.sync="showLiveConnectionForm">
      <md-dialog-title>Add a connection</md-dialog-title>
      <live-connection-form @done="closeConnectionForm">
      </live-connection-form>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showLiveConnectionForm = false">
          <md-icon>close</md-icon>
        </md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<script>

import LiveConnectionForm from '../components/LiveConnectionForm.vue'

export default {
  name: 'LiveAnalysis',
  data: function () {
    return {
      showLiveConnectionForm: false,
      hasLoaded: false
    }
  },
  components: {
    'live-connection-form': LiveConnectionForm
  },
  computed: {},
  methods: {
    closeConnectionForm: function () {
      this.showLiveConnectionForm = false
    }
  },
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

.md-dialog {
  width: 50%;
  max-width: 768px;
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
</style>
