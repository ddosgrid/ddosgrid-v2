<template>
  <div class="live-analysis">
    <div class="loader" v-if="!hasLoaded">
      <md-progress-spinner :md-diameter="60" :md-stroke="3" md-mode="indeterminate" class="centered"></md-progress-spinner>
    </div>

    <md-empty-state
      md-icon="link_off"
      md-label="No Connection added"
      class="centered" v-if="connections.length === 0 && hasLoaded">
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

    <div v-for="connection in connections" :key="connection.port" class="connection">
      <live-connection-list-item :connection="connection" @deleted="refresh"/>
    </div>

    <md-speed-dial class="md-bottom-right no-print above" md-event="hover" id="dial" v-if="connections.length>0">
      <md-speed-dial-target class="md-primary">
        <md-icon class="md-morph-initial">add</md-icon>
        <md-icon class="md-morph-final no-print">close</md-icon>
      </md-speed-dial-target>

      <md-speed-dial-content>
        <md-button class="md-icon-button" @click="showLiveConnectionForm = true">
          <md-tooltip md-direction="top" >Add another connection</md-tooltip>
          <md-icon>add_link</md-icon>
        </md-button>
      </md-speed-dial-content>
    </md-speed-dial>
  </div>
</template>

<script>

import LiveConnectionForm from '../components/LiveConnectionForm.vue'
import LiveConnectionListItem from '../components/LiveConnectionListItem'
import { apibaseurl } from '@/config/variables.js'

export default {
  name: 'LiveAnalysis',
  data: function () {
    return {
      connections: [],
      showLiveConnectionForm: false,
      hasLoaded: false
    }
  },
  components: {
    'live-connection-form': LiveConnectionForm,
    'live-connection-list-item': LiveConnectionListItem
  },
  mounted: function () {
    this.fetchConnections()
  },
  computed: {},
  methods: {
    closeConnectionForm: function () {
      this.showLiveConnectionForm = false
      this.refresh()
    },
    refresh: function () {
      this.fetchConnections()
    },
    fetchConnections: async function fetchConnections () {
      try {
        var res = await fetch(`${apibaseurl}/live-analysis/connection`, { credentials: 'include' })
        var connections = await res.json()
        this.connections = connections
        if (connections.length === 0) {
          this.$socket.close()
        } else {
          this.$socket.open()
        }
        this.hasLoaded = true
      } catch (e) {
        console.warn(e)
      }
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
