<template lang="html">
    <md-card md-with-hover>
      <md-card-header>
        <div class="md-title">{{ dataset.name }}</div>
        <div class="md-subhead">General Information</div>
      </md-card-header>

      <md-card-content>
        <div class="card-content-container">
          <div class="card-content-half">
            <div class="">{{ dataset.description }}</div>
          </div>
          <div class="card-content-half">
            <div class="">Uploaded on: {{ dataset.created }}</div>
            <div class="">Status: {{ dataset.status }}</div>
            <div class="">Filesize in MBs: {{ dataset.fileSizeMB }}</div>
            <div class="">Analysis Duration: {{ dataset.analysisDuration }}</div>
          </div>
        </div>
      </md-card-content>

      <md-card-expand>
        <md-card-actions md-alignment="space-between">
          <div>
            <md-button>Open</md-button>
            <md-button>Delete</md-button>
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
                  <div class="">Start: {{ dataset.metrics.start }}</div>
                  <div class="">End: {{ dataset.metrics.end }}</div>
                  <div class="">Duration: {{ dataset.metrics.duration }}</div>
                  <div class="">Number of IP Packets: {{ dataset.metrics.nrOfIPpackets }}</div>
                  <div class="">Attack Size in Bytes: {{ dataset.metrics.attackSizeInBytes }}</div>
                  <div class="">Attack Bandwith in Bytes Per Second: {{ dataset.metrics.attackBandwidthInBps }}</div>
                  <div class="">Average Packet Size: {{ dataset.metrics.avgPacketSize }}</div>
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
                  <div class="">UDP to TCP Ratio: {{ dataset.metrics.udpToTcpRatio }}</div>
                </div>
              </div>
              <md-card-header>
                <div class="md-subhead">Analysis Files</div>
              </md-card-header>
                <div v-for="analysis in dataset.analysisFiles" :key="analysis.file" class="analysisFile">
                  <div class="">
                    {{ analysis }}
                  </div>
                </div>
            </md-card-content>
        </md-card-expand-content>
      </md-card-expand>
    </md-card>
</template>

<script>
export default {
  props: ['dataset']
}
</script>

<style lang="css" scoped>
.card-content-container {
  display: flex;
  justify-content: space-between;
}
.card-content-half {
  width: 50%;
}
</style>
