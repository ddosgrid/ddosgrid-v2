<template lang="html">
  <md-card class="card">

    <md-card-header>
        <md-card-header-text>
          <div class="md-title">{{ dataset.name }}</div>
          <div class="md-subhead">Dataset ({{dataset.md5.slice(0,5)}}..{{dataset.md5.slice(dataset.md5.length-5)}})</div>
        </md-card-header-text>
      <md-card-media class="icon-wrap">
          <md-button class="md-icon-button enlarged-button" @click="filterEvent(dataset.i)">
            <img :src="getIconForHash(dataset.md5)" class="icon">
          </md-button>
      </md-card-media>
    </md-card-header>

    <md-divider></md-divider>

    <md-card-content>
      <md-tabs md-alignment="fixed">
        <md-tab id="tab-metrics" md-label="Metrics">
          <md-list>
              <md-list-item>
                <span>Duration</span>
                <span class="selectable">{{ formattedDuration }}</span>
              </md-list-item>
              <md-list-item>
                <span>Number of Packets:</span>
                <span class="selectable">{{ dataset.metrics.nrOfIPpackets }}</span>
              </md-list-item>
              <md-list-item>
                <span>Attack Size</span>
                <span class="selectable">{{ Math.floor(dataset.metrics.attackSizeInBytes / 1000 / 1000) + " MB"}}</span>
              </md-list-item>
              <md-list-item>
                <span>Number of Packets</span>
                <span class="selectable"> {{ dataset.metrics.nrOfIPpackets }}</span>
              </md-list-item>
              <md-list-item>
                <span> Number of Source IPs</span>
                <span class="selectable"> {{ dataset.metrics.nrOfSrcIps }} </span>
              </md-list-item>
              <md-list-item>
                <span>Number of Source Ports </span>
                <span class="selectable"> {{ dataset.metrics.nrOfSrcPorts }} </span>
              </md-list-item>
              <md-list-item>
                <span>Number of Destination IPs</span>
                <span class="selectable"> {{ dataset.metrics.nrOfDstIps }}</span>
              </md-list-item>
              <md-list-item>
                <span>Number of Destination Ports</span>
                <span class="selectable">{{ dataset.metrics.nrOfDstPorts }}</span>
              </md-list-item>
              <md-list-item>
                <span>Proportion of HTTP traffic</span>
                <span class="selectable">{{ httpShare }}%</span>
              </md-list-item>
              <md-list-item>
                <span>Proportion of ICMP traffic</span>
                <span class="selectable">{{ icmpShare }}%</span>
              </md-list-item>
          </md-list>
        </md-tab>
        <md-tab id="tab-visualizations" md-label="Visualizations">
           <md-list :md-expand-single="true">
             <md-list-item md-expand v-for="group in Object.keys(groupedByAttackType)" :key="group">
               <span class="md-list-item-text">{{ group }}</span>
               <md-list slot="md-expand">
                 <md-list-item v-for="analysisFile in groupedByAttackType[group]"  :key="analysisFile.file">
                   <md-button v-for="diagram in analysisFile.supportedDiagrams"
                              :key="diagram"
                              @click="openDiagram(analysisFile, diagram, dataset.md5)"
                              class="md-icon-button md-raised md-primary">
                     <md-icon>{{translateDiagramToIcon(diagram)}}</md-icon>
                   </md-button>
                   <md-button v-if="analysisFile.supportedDiagrams.length === 0"
                              class="md-icon-button md-raised md-primary no-print" disabled>
                     <md-icon>close</md-icon>
                   </md-button>
                  <span class="item md-list-item-text">{{ analysisFile.analysisName }}</span>
                 </md-list-item>
               </md-list>
             </md-list-item>
           </md-list>
        </md-tab>
      </md-tabs>
    </md-card-content>

    <md-card-actions>
      <md-button class="md-icon-button no-print" @click="closeDataSet(dataset)">
        <md-icon>close</md-icon>
      </md-button>
    </md-card-actions>

  </md-card>
</template>

<script>
import hashicon from 'hashicon'

export default {
  props: [
    'dataset'
  ],
  computed: {
    groupedByAttackType: function () {
      var result = this.dataset.analysisFiles.reduce((h, obj) => Object.assign(h, { [obj.attackCategory]: (h[obj.attackCategory] || []).concat(obj) }), {})
      return result
    },
    httpShare: function () {
      var percentage = this.dataset.metrics.nrOfHTTP / this.dataset.metrics.nrOfIPpackets
      var dec = percentage * 100
      return dec.toFixed(2)
    },
    icmpShare: function () {
      var percentage = this.dataset.metrics.nrOfICMP / this.dataset.metrics.nrOfIPpackets
      var dec = percentage * 100
      return dec.toFixed(2)
    },
    formattedDuration: function () {
      var duration = this.dataset.metrics.duration
      if (duration < 60) {
        return `${duration} seconds`
      }
      if (duration < 600) {
        var minutes = duration / 60
        return `${minutes.toFixed(0)} minutes`
      }
      if (duration < 86400) {
        var hours = duration / 3600
        return `${hours.toFixed(0)} hours`
      }
      var days = duration / 86400
      return `${days.toFixed(0)} days`
    }
  },
  methods: {
    getIconForHash: function getIconForHash (hash) {
      return hashicon(hash, { size: 80 }).toDataURL()
    },
    openDiagram: function (analysisFile, chart, datasetHash) {
      console.log(datasetHash)
      analysisFile.chart = chart
      this.$store.commit('addTile', analysisFile)
    },
    closeDataSet: function (dataset) {
      this.$store.commit('removeTile', dataset)
    },
    translateDiagramToIcon: function translateDiagramToIcon (diagram) {
      if (diagram.toLowerCase() === 'barchart') {
        return 'bar_chart'
      }
      if (diagram.toLowerCase() === 'piechart') {
        return 'pie_chart'
      }
      if (diagram.toLowerCase() === 'scatterplot') {
        return 'scatter_plot'
      }
      if (diagram.toLowerCase() === 'worldmap') {
        return 'map'
      }
      return 'add'
    },
    filterEvent: function (i) {
      this.$emit('filterSet', i)
    }
  }
}
</script>

<style lang="css" scoped>
.icon {
  width: 30px;
  height: 30px;
  float: right;
}
.enlarged-button {
  width: 50px !important;
  height: 50px !important;
  min-width: 50px !important;
}
.icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}
.card {
  width: 100%;
  height: 100%;
}
.item {
  padding-left: 10px;
}
.md-card-actions {
  bottom: 0;
  width: 100%;
  position: absolute;
  z-index: -1
}

.md-card-header-text {
  overflow-wrap: anywhere;
}
>>> .md-list-item-content {
  min-height: 32px !important;
}
.selectable{
  user-select: text;
}
</style>
