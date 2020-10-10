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
            <div class="" v-if="dataset.exportstatus !== 'exported'">Export Status: {{ dataset.exportstatus }}
              <md-icon v-if="dataset.exportstatus === 'planned'" :md-diameter="10">schedule</md-icon>
              <md-icon v-if="dataset.exportstatus === 'opt-out'" :md-diameter="10" title="Exporting was disabled by the user" style="cursor: help">block</md-icon>
              <md-progress-spinner v-if="dataset.exportstatus === 'in progress'" :md-diameter="12" :md-stroke="2" md-mode="indeterminate"></md-progress-spinner>
              <md-icon v-if="dataset.exportstatus === 'failed'" :md-diameter="10" class="failure-icon">warning</md-icon>
            </div>
            <!-- TODO: Extract as variable -->
            <div class="" v-else>Export Status: <a target="_blank" :href="`https://www.csg.uzh.ch/ddosgrid/ddosdb/query?q=key:${dataset.md5}`">{{ dataset.exportstatus }}</a>
              <md-icon :md-diameter="10" class="success-icon">check</md-icon>
            </div>
            <div class="">Analysis Status: {{ dataset.status }}
              <md-icon v-if="dataset.status === 'planned'" :md-diameter="10">schedule</md-icon>
              <md-icon v-if="dataset.status === 'analysed'" :md-diameter="10" class="success-icon">check</md-icon>
              <md-progress-spinner v-if="dataset.status === 'in progress'" :md-diameter="10" :md-stroke="2" md-mode="indeterminate"></md-progress-spinner>
              <md-icon v-if="dataset.status === 'failed'" :md-diameter="10" class="failure-icon">warning</md-icon>
            </div>
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
                  <div class="">Nº of IP Packets: {{ dataset.metrics.nrOfIPpackets }}</div>
                  <div class="">Attack Size: {{ Math.floor(dataset.metrics.attackSizeInBytes / 1000 / 1000) }} MB</div>
                  <div class="">Attack Bandwith: {{ Math.floor(dataset.metrics.attackBandwidthInBps / 1000 / 1000) }} MB/s</div>
                  <div class="">Average Packet Size: {{ Math.floor(dataset.metrics.avgPacketSize / 1000 / 1000) }} MB</div>
                  <div class="">Nº of IPv4 Packets: {{ dataset.metrics.nrOfIPv4Packets }}</div>
                </div>
                <div class="card-content-half">
                  <div class="">Nº of IPv6 Packets: {{ dataset.metrics.nrOfIPv6Packets }}</div>
                  <div class="">Nº of Source IPs: {{ dataset.metrics.nrOfSrcIps }}</div>
                  <div class="">Nº of Destination IPs: {{ dataset.metrics.nrOfDstIps }}</div>
                  <div class="">Nº of Source Ports: {{ dataset.metrics.nrOfSrcPorts }}</div>
                  <div class="">Nº of Destination Ports: {{ dataset.metrics.nrOfDstPorts }}</div>
                  <div class="">Nº of UDP Packets: {{ dataset.metrics.nrOfUDPPackets }}</div>
                  <div class="">Nº of TCP Packets: {{ dataset.metrics.nrOfTCPPackets }}</div>
                  <div class="">UDP to TCP Ratio: {{ Math.floor(dataset.metrics.udpToTcpRatio* 1000) / 1000 }}</div>
                </div>
              </div>
<!--
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
-->
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
        method: 'DELETE',
        credentials: 'include'
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
        method: 'POST',
        credentials: 'include'
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
.card-content-half > div {
  overflow: hidden;
  text-overflow: ellipsis;
}
.md-title, .md-card-header-flex, .md-card-header-text {
  text-overflow: ellipsis;
  overflow: hidden;
}
.md-title { width: 100%; }
.success-icon {
    color: #30b375 !important;
}
.failure-icon {
    color: #ff5252 !important;
}
a[target="_blank"]::before {
  margin: 0 3px 0 5px;
  content: url(data:image/png;base64,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IHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgeG1wTU06RG9jdW1lbnRJRD0iZ2ltcDpkb2NpZDpnaW1wOjlhOTVmNTlkLThjNzUtNGZlNS05NGMwLTc3MWMwN2EwYzc0MyIKICAgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo4NGM1ZTU1MC1hMDNiLTQzYjEtOGM5NS01MjU4Zjg3NGFiYmEiCiAgIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpkODI3NTQ5OS0wYmNiLTRhOWMtOGFlNS1iNDAzMjA4ZmYwYTAiCiAgIEdJTVA6QVBJPSIyLjAiCiAgIEdJTVA6UGxhdGZvcm09IkxpbnV4IgogICBHSU1QOlRpbWVTdGFtcD0iMTYwMjMzOTI4MTQzMjkwOSIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjIyIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgdGlmZjpPcmllbnRhdGlvbj0iMSIKICAgeG1wOkNyZWF0b3JUb29sPSJHSU1QIDIuMTAiPgogICA8aXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvbkNyZWF0ZWQ+CiAgIDxpcHRjRXh0OkxvY2F0aW9uU2hvd24+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpMb2NhdGlvblNob3duPgogICA8aXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpBcnR3b3JrT3JPYmplY3Q+CiAgIDxpcHRjRXh0OlJlZ2lzdHJ5SWQ+CiAgICA8cmRmOkJhZy8+CiAgIDwvaXB0Y0V4dDpSZWdpc3RyeUlkPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJzYXZlZCIKICAgICAgc3RFdnQ6Y2hhbmdlZD0iLyIKICAgICAgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozYWNiMGViZC05ZTZlLTQzMTQtOGVhNy04NDAyZmY0MWNiZDEiCiAgICAgIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkdpbXAgMi4xMCAoTGludXgpIgogICAgICBzdEV2dDp3aGVuPSIrMDI6MDAiLz4KICAgIDwvcmRmOlNlcT4KICAgPC94bXBNTTpIaXN0b3J5PgogICA8cGx1czpJbWFnZVN1cHBsaWVyPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VTdXBwbGllcj4KICAgPHBsdXM6SW1hZ2VDcmVhdG9yPgogICAgPHJkZjpTZXEvPgogICA8L3BsdXM6SW1hZ2VDcmVhdG9yPgogICA8cGx1czpDb3B5cmlnaHRPd25lcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkNvcHlyaWdodE93bmVyPgogICA8cGx1czpMaWNlbnNvcj4KICAgIDxyZGY6U2VxLz4KICAgPC9wbHVzOkxpY2Vuc29yPgogIDwvcmRmOkRlc2NyaXB0aW9uPgogPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+1UD/VwAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB+QKCg4OKbKjkxkAAABFSURBVBjTY2TAAVy6/v9H5jOiC+wpY2TEqgFdITZFLl3//zPhU4RiOjYTsdqCLojTKfjciCzPxEAkIFohCzHWMzAwMAAAaFUpnaPu6TUAAAAASUVORK5CYII=);
}
</style>
