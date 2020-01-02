<template lang="html">
  <div class="">
    <h1>Upload a File...</h1>
    <div class="form">
      <md-field>
        <label>Upload files</label>
        <md-file v-model="file" placeholder="Choose a PCAP File..." />
      </md-field>

      <md-field>
        <label>Name</label>
        <md-input v-model="fileName" placeholder="Give the file a name"></md-input>
      </md-field>

      <md-field>
        <label>Description</label>
        <md-textarea v-model="fileDescription" md-autogrow></md-textarea>
      </md-field>

    <md-button class="md-raised md-primary">Primary</md-button>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    file: null,
    fileName: null,
    fileDescription: null
  })
}
</script>

<style lang="css" scoped>
</style>
r
