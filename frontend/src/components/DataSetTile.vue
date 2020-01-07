<template lang="html">
  <md-card class="card">
    <md-card-header>
      <div class="md-title">{{ dataset.name }}</div>
    </md-card-header>

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
      <md-button @click="closeDataSet(dataset)">
        <md-icon>close</md-icon>
      </md-button>
    </md-card-actions>

  </md-card>
</template>

<script>
export default {
  props: [
    'dataset'
  ],
  computed: {
    groupedByAttackType: function () {
      console.log(this.dataset.analysisFiles)
      var result = this.dataset.analysisFiles.reduce((h, obj) => Object.assign(h, { [obj.attackCategory]: (h[obj.attackCategory] || []).concat(obj) }), {})
      console.log(result)
      return result
    }
  },
  methods: {
    openDiagram: function (analysisFile, chart) {
      analysisFile.chart = chart
      this.$store.commit('addVisualization', analysisFile)
    },
    closeDataSet: function (dataset) {
      this.$store.commit('removeDataSet', dataset)
    },
    translateDiagramToIcon: function translateDiagramToIcon (diagram) {
      console.log(diagram)
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
.card {
  max-width: 25em;
}
.item {
  padding-left: 10px;
}
</style>
