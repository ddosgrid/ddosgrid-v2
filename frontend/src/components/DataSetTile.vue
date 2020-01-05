<template lang="html">
  <md-card class="card">
    <md-card-header>
      <div class="md-title">{{ dataset.name }}</div>
    </md-card-header>

    <md-card-content>
      <md-button @click="closeDataSet(dataset)" class="md-raised md-primary">Close Tile</md-button>
      <div class="" v-for="analysisFile in dataset.analysisFiles" :key="analysisFile.file">
       <div class="">
         {{ analysisFile.attackCategory }}
       </div>
       <div class="">
         {{ analysisFile.file.slice(66, -5) }}
       </div>
       <md-button v-for="diagram in analysisFile.supportedDiagrams" :key="diagram" @click="openDiagram(analysisFile)" class="md-raised md-primary">Open in {{ diagram }} Diagram</md-button>
       <md-divider></md-divider>
      </div>
    </md-card-content>
  </md-card>
</template>

<script>
export default {
  props: [
    'dataset'
  ],
  methods: {
    openDiagram: function (analysisFile) {
      // add this file to stack in store
    },
    closeDataSet: function (dataset) {
      // remove this data set from the stack in store
    }
  }
}
</script>

<style lang="css" scoped>
.card {
  width: 30%;
}
</style>
