<template>
  <div>
    <div class="sinkhole-controls">
      <div class="sinkhole-item">
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
                <div class="status-content">{{ status.dnsPort }}</div>
              </div>
              <div class="status-item">
                <div class="status-caption">Sinkhole Address</div>
                <div class="status-content">{{ status.sinkholeAddress }}</div>
              </div>
              <div class="status-item">
                <div class="status-caption">Main DNS Server</div>
                <div class="status-content">{{ status.mainDns }}</div>
              </div>
              <div class="status-item">
                <div class="status-caption">Blacklist Entries</div>
                <div class="status-content">{{ status.blacklistEntries }}</div>
              </div>
              <div class="md-subhead unapplied-text" v-if="status.configChanged">
                The config has been changed. Please restart the sinkhole to apply the changes.
              </div>
            </div>
          </md-card-content>
          <md-card-actions v-if="!loading">
            <md-button class="md-primary">
              <div class="icon-button" @click="toggleConfigDialog">
                <md-icon style="margin-right: 0.2em">settings</md-icon>
                Edit Configuration
              </div>
            </md-button>
          </md-card-actions>
        </md-card>
      </div>
      <div class="sinkhole-item">
        <sinkhole-blacklist-card/>
      </div>
      <div class="sinkhole-item">
        <sinkhole-stats-card :loading="loading" :prop-stats="this.stats"/>
      </div>
    </div>

    <sinkhole-config-dialog :show.sync="showConfigDialog" v-on:submitted="loadStatus"/>

    <md-button v-if="!loading" class="md-fab md-fab-bottom-right" @click="toggleSinkhole">
      <md-icon v-bind:class="{'fab-icon': !status.running}"> {{ fabIcon }}</md-icon>
      <md-tooltip md-direction="top">
        {{ status.running ? 'stop sinkhole' : 'start sinkhole' }}
      </md-tooltip>
    </md-button>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import SinkholeConfigDialog from '@/components/SinkholeConfigDialog'
import SinkholeBlacklistCard from '@/components/SinkholeBlacklistCard'
import SinkholeStatsCard from '@/components/SinkholeStatsCard'

export default {
  name: 'DnsSinkhole',
  components: {
    SinkholeBlacklistCard,
    'sinkhole-config-dialog': SinkholeConfigDialog,
    SinkholeStatsCard
  },
  data: () => ({
    loading: true,
    status: { running: false },
    showConfigDialog: false,
    refreshInterval: null,
    stats: {}
  }),
  mounted: function () {
    this.loadStatus()
    this.refreshInterval = setInterval(() => this.loadStatus(), 5000)
  },
  beforeDestroy () {
    if (this.refreshInterval !== null) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  },
  methods: {
    loadStatus: async function () {
      this.status = await (await fetch(`${apibaseurl}/sinkhole`, { credentials: 'include' })).json()
      this.stats = await (await fetch(`${apibaseurl}/sinkhole/stats`, { credentials: 'include' })).json()
      this.loading = false
    },
    toggleSinkhole: async function () {
      if (this.status.running) {
        await fetch(`${apibaseurl}/sinkhole/stop`, { method: 'POST', credentials: 'include' })
      } else {
        await fetch(`${apibaseurl}/sinkhole/start`, { method: 'POST', credentials: 'include' })
      }
      await this.loadStatus()
    },
    toggleConfigDialog: function () {
      this.showConfigDialog = !this.showConfigDialog
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
.sinkhole-item {
  padding: 32px 24px 0 24px;
  box-sizing: border-box;
  width: 100%;
}

.sinkhole-controls {
  max-width: 50em;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto auto 2em;
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
  min-width: 40em;
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

.unapplied-text {
  font-style: italic;
  margin: 1em 0.5em;
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
