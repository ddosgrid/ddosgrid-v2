<template lang="html">
  <div id="form">
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

  <md-button class="md-raised md-primary" @click="uploadFile">Primary</md-button>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
export default {
  data: () => ({
    file: null,
    fileName: null,
    fileDescription: null
  }),
  methods: {
    uploadFile () {
      console.log(this.file)
      const formData = new FormData()
      const fileField = document.querySelector('input[type="file"]')

      formData.append('name', this.fileName)
      formData.append('description', this.fileDescription)
      formData.append('captureFile', fileField.files[0])

      fetch(`${apibaseurl}/analysis/upload`, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((result) => {
          console.log('Success:', result)
          // snackbar to let user know that file was uploaded and analysis has started

          // start analysis
          fetch('http://localhost:3000/analysis/' + result.id + '/analyse', {
            method: 'POST'
          })
            .then((result) => {
              console.log(result)
            })
        })
        .then((result) => {
          console.log(result)
        })
        .catch((error) => {
          console.error('Error:', error)
        })
    }
  }
}
</script>

<style lang="css" scoped>
  #form {
    width: 90%;
    margin: auto;
  }
</style>
