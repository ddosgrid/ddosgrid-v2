<template>
  <div>
    <div class="sinkhole-controls">
      <md-card>
        <md-card-header>
          <md-card-header-text>
            <div class="md-title">DNS Sinkhole</div>
            <div class="md-subhead" v-bind:class="{'active-subcaption': status.running}">
              {{ statusText }}
            </div>
          </md-card-header-text>
          <md-card-media class="icon-wrap">
            <md-icon class="md-size-2x" v-bind:class="statusIconClass">{{ statusIcon }}</md-icon>
          </md-card-media>
        </md-card-header>
        <md-divider></md-divider>
        <md-card-content class="sinkhole-content">
          <md-progress-spinner v-if="loading" :md-diameter="36" :md-stroke="4" md-mode="indeterminate"/>
          <div v-if="!loading" class="status-container">
            <div class="status-item">
              <div class="status-caption">DNS Port</div>
              <div class="status-content">{{status.dnsPort}}</div>
            </div>
            <div class="status-item">
              <div class="status-caption">Sinkhole Address</div>
              <div class="status-content">{{status.sinkholeAddress}}</div>
            </div>
            <div class="status-item">
              <div class="status-caption">Main DNS Server</div>
              <div class="status-content">{{status.mainDns}}</div>
            </div>
            <div class="status-item">
              <div class="status-caption">Blacklist Entries</div>
              <div class="status-content">{{status.blacklistEntries}}</div>
            </div>
          </div>
        </md-card-content>
        <md-card-actions v-if="!loading">
          <md-button>
            <div class="icon-button">
              <md-icon style="margin-right: 0.2em">settings</md-icon>
              Edit Configuration
            </div>
          </md-button>
          <md-button>
            <div class="icon-button">
              <md-icon style="margin-right: 0.2em">remove_circle</md-icon>
              Edit Blacklist
            </div>
          </md-button>
        </md-card-actions>
      </md-card>
    </div>
    <md-button v-if="!loading" class="md-fab md-fab-bottom-right" @click="toggleSinkhole">
      <md-icon v-bind:class="{'fab-icon': !status.running}"> {{ fabIcon }}</md-icon>
      <md-tooltip md-direction="top">
        {{status.running ? 'stop sinkhole' : 'start sinkhole'}}
      </md-tooltip>
    </md-button>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'

export default {
  name: 'DnsSinkhole',
  components: {},
  data: () => ({
    loading: true,
    status: { running: false }
  }),
  mounted: function () {
    setTimeout(() => {
      this.loadStatus()
    }, 1000)
  },
  methods: {
    loadStatus: async function () {
      this.loading = true
      this.status = await (await fetch(`${apibaseurl}/sinkhole`, { credentials: 'include' })).json()
      console.log(this.status)
      this.loading = false
    },
    toggleSinkhole: async function () {
      if (this.status.running) {
        await fetch(`${apibaseurl}/sinkhole/stop`, { method: 'POST', credentials: 'include' })
      } else {
        await fetch(`${apibaseurl}/sinkhole/start`, { method: 'POST', credentials: 'include' })
      }
      await this.loadStatus()
    }
  },
  computed: {
    statusText: function () {
      if (this.loading) return 'loading...'
      if (this.status.running) return 'running'
      else return 'stopped'
    },
    statusIcon: function () {
      if (this.loading) return 'more_horiz'
      return this.status.running ? 'cyclone' : 'nights_stay'
    },
    fabIcon: function () {
      return this.status.running ? 'stop' : 'cyclone'
    },
    statusIconClass: function () {
      let baseClass = ''
      if (!this.loading && this.status.running) {
        baseClass = 'active-icon'
      }
      return baseClass
    }
  }
}
</script>

<style scoped>
.sinkhole-controls {
  max-width: 960px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
}

.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.md-title, .md-card-header-flex, .md-card-header-text {
  text-overflow: ellipsis;
  overflow: hidden;
}

.sinkhole-content {
  min-width: 50em;
}

.status-container {
  width: 100%;
}

.status-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 1em 0.5em;
}

.status-caption {
  font-weight: bold;
  min-width: 10em;
  margin-right: 1em;
  flex-grow: 1;
}

.status-content {
  font-weight: normal;
  text-align: right;
  flex-grow: 1;
}

.active-icon {
  color: #30b375 !important;
  animation: rotation 20s linear infinite;
}

.active-subcaption {
  color: #30b375 !important;
  opacity: 1 !important;
}

.fab-icon:hover {
  animation: rotation 10s linear infinite;
}

.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}
</style>
