<template lang="html">
  <md-card class="card">

    <md-card-header>
        <md-card-header-text>
          <div class="md-title">{{ dataset.name }}</div>
          <div class="md-subhead">Dataset ({{dataset.md5.slice(0,5)}}..{{dataset.md5.slice(dataset.md5.length-5)}})</div>
        </md-card-header-text>
      <md-card-media class="icon-wrap">
        <img :src="getIconForHash(dataset.md5)" class="icon">
      </md-card-media>
    </md-card-header>

    <md-divider></md-divider>

    <md-card-content>
      <md-tabs md-alignment="fixed">
        <md-tab id="tab-metrics" md-label="Metrics">
          <md-list>
            <md-list-item md-expand>
              <span class="md-list-item-text">Attack Stats</span>
              <md-list slot="md-expand" class="md-dense">
                <md-list-item>
                  {{ "Duration: " + dataset.metrics.duration + "s"}}
                </md-list-item>
                <md-list-item>
                  {{ "Number of Packets: " + dataset.metrics.nrOfIPpackets }}
                </md-list-item>
                <md-list-item>
                  {{ "Attack Size: " + Math.floor(dataset.metrics.attackSizeInBytes / 1000 / 1000) + " MB"}}
                </md-list-item>
                <md-list-item>
                  {{ "Number of Packets: " + dataset.metrics.nrOfIPpackets }}
                </md-list-item>
              </md-list>
            </md-list-item>
            <md-list-item md-expand>
              <span class="md-list-item-text">Network Stats</span>
              <md-list slot="md-expand" class="md-dense">
                <md-list-item>
                  {{ "Number of Source IPs: " + dataset.metrics.nrOfSrcIps }}
                </md-list-item>
                <md-list-item>
                  {{ "Number of Source Ports: " + dataset.metrics.nrOfSrcPorts }}
                </md-list-item>
                <md-list-item>
                  {{ "Number of Destination IPs: " + dataset.metrics.nrOfDstIps }}
                </md-list-item>
                <md-list-item>
                  {{ "Number of Destination Ports: " + dataset.metrics.nrOfDstPorts }}
                </md-list-item>
              </md-list>
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
                              @click="openDiagram(analysisFile, diagram)"
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
    }
  },
  methods: {
    getIconForHash: function getIconForHash (hash) {
      return hashicon(hash, { size: 80 }).toDataURL()
    },
    openDiagram: function (analysisFile, chart) {
      analysisFile.chart = chart
      // this.$store.commit('addVisualization', analysisFile)
      this.$store.commit('addTile', analysisFile)
    },
    closeDataSet: function (dataset) {
      // this.$store.commit('removeDataSet', dataset)
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
}
</style>
