<template lang="html">
  <md-card class="card">
    <md-card-header>
      <div class="md-title">{{ dataset.name }}</div>
    </md-card-header>

    <md-card-content>
      <div class="" v-for="analysisFile in dataset.analysisFiles" :key="analysisFile.file">
       <div class="">
         {{ analysisFile.attackCategory }}
       </div>
       <div class="">
         {{ analysisFile.file.slice(66, -5) }}
       </div>
       <div class="">
         {{ analysisFile.supportedDiagrams }}
       </div>
       <md-divider></md-divider>
      </div>
    </md-card-content>
  </md-card>
</template>

<script>
export default {
  props: [
    'dataset'
  ]
}
</script>

<style lang="css" scoped>
.card {
  width: 30%;
}
</style>
