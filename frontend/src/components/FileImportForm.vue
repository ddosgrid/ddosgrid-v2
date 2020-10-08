<template lang="html">
  <div id="form">
    <md-field>
      <label>Upload files</label>
      <md-input v-model="file" placeholder="ID of the dataset in DDoSDB"></md-input>
    </md-field>

    <md-field>
      <label>Name</label>
      <md-input v-model="fileName" placeholder="Give the file a name"></md-input>
    </md-field>

    <md-field>
      <label>Description</label>
      <md-textarea v-model="fileDescription" @keyup.ctrl.enter="importFile" md-autogrow></md-textarea>
    </md-field>

  <md-button class="md-raised md-primary md-icon-button" :disabled="!inputDefined" @click="importFile" v-if="!isLoading">
    <md-icon>cloud_download</md-icon>
  </md-button>
  <md-snackbar :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
    <span>{{ snackbarMsg}}</span>
    <md-button class="md-primary" @click="uploadAnother">Import another file</md-button>
  </md-snackbar>
  <md-progress-spinner v-if="isLoading" :md-diameter="36" :md-stroke="4" md-mode="indeterminate"></md-progress-spinner>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
export default {
  data: () => ({
    file: '',
    fileName: null,
    fileDescription: null,
    showSnackbar: false,
    position: 'center',
    duration: 4000,
    isInfinity: false,
    snackbarMsg: null,
    isLoading: false,
    closingTimeout: 0
  }),
  computed: {
    inputDefined: function () {
      return this.file && this.fileName && this.fileDescription
    }
  },
  mounted: function () {
    this.file = this.$route.query.import
    window.ga = this
  },
  methods: {
    clear () {
      this.file = null
      this.fileName = null
      this.fileDescription = null
    },
    uploadAnother () {
      this.clear()
      clearTimeout(this.closingTimeout)
      this.showSnackbar = false
    },
    importFile () {
      this.isLoading = true
      fetch(`${apibaseurl}/analysis/import/${this.file}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          datasetname: this.fileName,
          datasetdescription: this.fileDescription
        }),
        credentials: 'include'
      })
        .then((response) => {
          if (response.status === 409) {
            throw new Error('This dataset already exists! Please upload another one')
          }
          if (response.status >= 400 && response.status < 600) {
            throw new Error('Unable to import dataset. Please check your input or try later')
          }
          return response
        })
        .then((response) => response.json())
        .then((result) => {
          this.isLoading = false
          this.snackbarMsg = 'Import was Successful, starting analysis now.'
          this.showSnackbar = true
          // start analysis
          fetch(`${apibaseurl}/analysis/${result.id}/analyse`, {
            method: 'POST',
            credentials: 'include'
          })
            .then((result) => {
            // console.log(result)
              this.clear()
              this.showSnackbar = true
              this.closingTimeout = setTimeout(() => { this.$emit('done') }, 5000)
            })
        })
        .then((result) => {
          // console.log(result)
        })
        .catch((error) => {
          this.isLoading = false
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
