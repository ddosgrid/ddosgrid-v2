<template>
  <div class="live-analysis">

    <md-empty-state
      md-icon="link_off"
      md-label="No Connection added"
      class="centered" v-if="!this.$store.state.isSocketConnected">
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

    <div class="connection-wrap" v-if="this.$store.state.isSocketConnected">
      <md-card md-with-hover>
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">Port ...</div>
          </md-card-header-text>
          <div>
            Connected
            <md-icon class="success-icon">check</md-icon>
          </div>

        </md-card-header>
        <md-divider></md-divider>

        <md-card-content>
          <div class="card-content-container">
            <p>Data sent from websocket: </p>
            <p>{{$store.state.socketData}}</p>
          </div>
        </md-card-content>

        <md-card-expand>
          <md-card-actions md-alignment="space-between">
            <div>
              <md-button @click="deleteConnection()">Delete</md-button>
            </div>
          </md-card-actions>
        </md-card-expand>
      </md-card>
    </div>

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
    },
    deleteConnection: function () {
      this.$store.state.isSocketConnected = false
      this.$socket.close()
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
</style>
