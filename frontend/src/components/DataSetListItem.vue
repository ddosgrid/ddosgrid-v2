<template lang="html">
  <div class="dataset-wrap">
    <md-card md-with-hover>
      <md-card-header>
        <md-card-header-text>
        <div class="md-title">{{ dataset.name }}</div>
        <div class="md-subhead">Dataset ({{dataset.md5.slice(0,5)}}..{{dataset.md5.slice(dataset.md5.length-5)}})</div>
        <!--div class="md-subhead">General Information</div-->
        </md-card-header-text>
        <md-card-media class="icon-wrap">
          <img :src="getIconForHash(dataset.md5)" class="icon">
        </md-card-media>
      </md-card-header>
      <md-divider></md-divider>

      <md-card-content>
        <div class="card-content-container">
          <div class="card-content-half">
            <div class="">{{ dataset.description }}</div>
          </div>
          <div class="card-content-half">
            <div class="">Uploaded on: {{ new Date(dataset.created).toLocaleString() }}</div>
            <div class="">Status: {{ dataset.status }}</div>
            <div class="">Filesize: {{ dataset.fileSizeMB }} MB</div>
            <div class="">Analysis Duration: {{ dataset.analysisDuration }} seconds</div>
          </div>
        </div>
      </md-card-content>

      <md-card-expand>
        <md-card-actions md-alignment="space-between">
          <div>
            <md-button v-if="dataset.status === 'analysed'" @click="addDataSet(dataset)">Open</md-button>
            <md-button class="md-accent" v-else @click="notifyNotAnalysed">Open</md-button>
            <md-button @click="deleteAnalysis(dataset)">Delete</md-button>
            <md-button @click="retryAnalysis(dataset)" v-if="dataset.status === 'failed'">Retry</md-button>
          </div>

          <md-card-expand-trigger>
            <md-button class="md-icon-button">
              <md-icon>keyboard_arrow_down</md-icon>
            </md-button>
          </md-card-expand-trigger>
        </md-card-actions>

        <md-card-expand-content>
            <md-card-content>
              <md-card-header>
                <div class="md-subhead">Metrics</div>
              </md-card-header>
              <div class="card-content-container">
                <div class="card-content-half">
                  <div class="">Start: {{ new Date(dataset.metrics.start * 1000).toLocaleString() }}</div>
                  <div class="">End: {{ new Date(dataset.metrics.end * 1000).toLocaleString() }}</div>
                  <div class="">Duration: {{ dataset.metrics.duration }} seconds</div>
                  <div class="">Number of IP Packets: {{ dataset.metrics.nrOfIPpackets }}</div>
                  <div class="">Attack Size: {{ Math.floor(dataset.metrics.attackSizeInBytes / 1000 / 1000) }} MB</div>
                  <div class="">Attack Bandwith: {{ Math.floor(dataset.metrics.attackBandwidthInBps / 1000 / 1000) }} MB/s</div>
                  <div class="">Average Packet Size: {{ Math.floor(dataset.metrics.avgPacketSize / 1000 / 1000) }} MB</div>
                  <div class="">Number of IPv4 Packets: {{ dataset.metrics.nrOfIPv4Packets }}</div>
                </div>
                <div class="card-content-half">
                  <div class="">Number of IPv6 Packets: {{ dataset.metrics.nrOfIPv6Packets }}</div>
                  <div class="">Number of Source IPs: {{ dataset.metrics.nrOfSrcIps }}</div>
                  <div class="">Number of Destination IPs: {{ dataset.metrics.nrOfDstIps }}</div>
                  <div class="">Number of Source Ports: {{ dataset.metrics.nrOfSrcPorts }}</div>
                  <div class="">Number of Destination Ports: {{ dataset.metrics.nrOfDstPorts }}</div>
                  <div class="">Number of UDP Packets: {{ dataset.metrics.nrOfUDPPackets }}</div>
                  <div class="">Number of TCP Packets: {{ dataset.metrics.nrOfTCPPackets }}</div>
                  <div class="">UDP to TCP Ratio: {{ Math.floor(dataset.metrics.udpToTcpRatio* 1000) / 1000 }}</div>
                </div>
              </div>
              <md-card-header>
                <div class="md-subhead">Analysis Files</div>
              </md-card-header>
                <div v-for="analysis in dataset.analysisFiles" :key="analysis.file" class="analysisFile">
                  <h5 class="">
                    {{ analysis.attackCategory }}:
                  </h5>
                  <div class="">
                    {{ analysis.file }}
                  </div>
                </div>
            </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>

    <md-snackbar :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ snackbarMsg }}</span>
      <md-button class="md-primary" @click="handleSnackBarShow">Show</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import hashicon from 'hashicon'

export default {
  props: ['dataset'],
  methods: {
    handleSnackBarShow: function handleSnackBarShow () {
      this.showSnackbar = false
      this.$router.push('/dashboard')
    },
    getIconForHash: function getIconForHash (hash) {
      return hashicon(hash, { size: 80 }).toDataURL()
    },
    addDataSet: function (dataset) {
      this.snackbarMsg = 'Added ' + dataset.name + ' to the Dashboard'
      this.showSnackbar = true
      // this.$store.commit('addDataSet', dataset)
      this.$store.commit('addTile', dataset)
    },
    notifyNotAnalysed: function () {
      this.snackbarMsg = 'This data set has not been analysed, probably due to an error while parsing.'
      this.showSnackbar = true
    },
    deleteAnalysis: function deleteAnalysis (dataset) {
      var app = this
      console.log(dataset)
      fetch(`${apibaseurl}/analysis/${dataset.md5}`, {
        method: 'DELETE'
      })
        .then(() => {
          app.$emit('deleted')
        })
        .catch(() => {
          console.error('Unable to delete dataset')
        })
    },
    retryAnalysis: function retryAnalysis (dataset) {
      var id = dataset.md5
      var app = this
      fetch(`${apibaseurl}/analysis/${id}/analyse`, {
        method: 'POST'
      })
        .then((result) => {
          app.$emit('deleted')
          console.log(result)
        })
    }
  },
  data: function () {
    return {
      showSnackbar: false,
      position: 'center',
      duration: 4000,
      isInfinity: false,
      snackbarMsg: null
    }
  }
}
</script>

<style lang="css" scoped>
.dataset-wrap {
  max-width: 800px;
  margin: auto;
}
.icon {
  width: 30px;
  height: 30px;
  float: right;
}
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-content-container {
  display: flex;
  justify-content: space-between;
}
.card-content-half {
  width: 50%;
}
</style>
