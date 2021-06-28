<template lang="html">
  <div id="form">
    <md-field>
      <label>Network Interface</label>
      <md-input v-model="targetInterface" placeholder="Define from which interface to capture"></md-input>
    </md-field>

    <md-field>
      <label>Name</label>
      <md-input v-model="fileName" placeholder="Give the file a name"></md-input>
    </md-field>

    <md-field>
      <label>Description</label>
      <md-textarea v-model="fileDescription" @keyup.ctrl.enter="uploadFile" md-autogrow></md-textarea>
    </md-field>

    <div class="upload-btn-wrapper">
      <md-button class="md-raised md-primary" :disabled="!inputDefined" @click="uploadFile" v-if="!isLoading">
        <md-icon>camera</md-icon>
        Capture
      </md-button>
      <md-progress-bar v-if="isLoading" :md-diameter="36" :md-stroke="4" :md-value="uploadProgress" md-mode="determinate"></md-progress-bar>
    </div>
    <md-snackbar :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ snackbarMsg}}</span>
      <md-button class="md-primary" @click="uploadAnother">Upload another file</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import axios from 'axios'

export default {
  data: () => ({
    targetInterface: null,
    fileName: null,
    fileDescription: null,
    showSnackbar: false,
    position: 'center',
    duration: 4000,
    isInfinity: false,
    snackbarMsg: null,
    isLoading: false,
    closingTimeout: 0,
    exportUploadedFile: false,
    fileSize: 0,
    uploadProgress: 0
  }),
  computed: {
    inputDefined: function () {
      return this.targetInterface && this.fileName && this.fileDescription
    }
  },
  methods: {
    clear () {
      this.file = null
      this.fileName = null
      this.fileDescription = null
    },
    uploadFile () {
      const formData = new FormData()

      formData.append('name', this.fileName)
      formData.append('description', this.fileDescription)
      formData.append('targetinterface', this.targetInterface)

      this.isLoading = true
      axios.request({
        url: `${apibaseurl}/analysis/capture`,
        method: 'POST',
        data: formData,
        withCredentials: 'include'
      })
        .then((response) => {
          if (response.status === 409) {
            throw new Error('This dataset already exists in the system, it was added to your account.')
          }
          if (response.status >= 400 && response.status < 600) {
            throw new Error('Unable to import dataset. Please check your input or try later')
          }
          return response
        })
        .then((response) => {
          var result = response.data
          this.isLoading = false
          // snackbar to let user know that file was uploaded and analysis has started
          this.snackbarMsg = `Live capture started (${result.id})`
          this.showSnackbar = true
          // start analysis
        })
        .catch((error) => {
          this.isLoading = false
          console.error('Error:', error)
          // snackbar to let user know an error has occurred
          this.snackbarMsg = error.message
          this.showSnackbar = true
        })
    }
  }
}
</script>

<style lang="css">
#form {
  width: 90%;
  margin: auto;
}
.md-list-item-content {
  padding-left: 0px;
}
.upload-btn-wrapper {
  text-align: center;
  margin-top: 20px;
}
.unavailable {
  text-decoration: line-through;
  cursor: help;
}
</style>
