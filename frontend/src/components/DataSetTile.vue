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
       <md-list>
        <div class="" v-for="group in Object.keys(groupedByAttackType)" :key="group">
          <md-subheader>{{ group }}</md-subheader>
          <div class="" v-for="analysisFile in groupedByAttackType[group]"  :key="analysisFile.file">

          <md-list-item>
             <md-button v-for="diagram in analysisFile.supportedDiagrams"
                        :key="diagram"
                        @click="openDiagram(analysisFile, diagram)"
                        class="md-icon-button md-raised md-primary">
               <md-icon>{{translateDiagramToIcon(diagram)}}</md-icon>
             </md-button>
             <md-button v-if="analysisFile.supportedDiagrams.length === 0"
                        class="md-icon-button md-raised md-primary" disabled>
               <md-icon>close</md-icon>
             </md-button>
            <span class="item md-list-item-text">{{ analysisFile.file.slice(71, -5) }}</span>
          </md-list-item>
          </div>
        </div>
      </md-list>
    </md-card-content>

    <md-card-actions>
      <md-button class="md-icon-button" @click="closeDataSet(dataset)">
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
      this.$store.commit('addVisualization', analysisFile)
    },
    closeDataSet: function (dataset) {
      this.$store.commit('removeDataSet', dataset)
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
  max-width: 25em;
}
.item {
  padding-left: 10px;
}
</style>
