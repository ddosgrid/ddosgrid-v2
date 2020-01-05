<template lang="html">
  <div id="form">
    <md-field>
      <label>Upload files</label>
      <md-file v-model="file" accept=".pcap" placeholder="Choose a PCAP File..." />
    </md-field>

    <md-field>
      <label>Name</label>
      <md-input v-model="fileName" placeholder="Give the file a name"></md-input>
    </md-field>

    <md-field>
      <label>Description</label>
      <md-textarea v-model="fileDescription" md-autogrow></md-textarea>
    </md-field>

  <md-button class="md-raised md-primary md-icon-button" @click="uploadFile">
    <md-icon>cloud_upload</md-icon>
  </md-button>
  <md-snackbar :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
    <span>{{ snackbarMsg}}</span>
    <md-button class="md-primary" @click="showSnackbar = false">OK</md-button>
  </md-snackbar>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
export default {
  data: () => ({
    file: null,
    fileName: null,
    fileDescription: null,
    showSnackbar: false,
    position: 'center',
    duration: 4000,
    isInfinity: false,
    snackbarMsg: null
  }),
  methods: {
    uploadFile () {
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
          this.snackbarMsg = 'Upload was Successful, starting analysis now.'
          this.showSnackbar = true
          // start analysis
          fetch(`${apibaseurl}/analysis/${result.id}/analyse`, {
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
          // snackbar to let user know an error has occurred
          this.snackbarMsg = error
          this.showSnackbar = true
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
