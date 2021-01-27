<template lang="html">
  <div id="form">
    <md-field>
      <label>Upload files ({{fileSizeInMB}}MB)</label>
      <md-file v-model="file" accept=".pcap,.tcpdump" placeholder="Choose a PCAP File..." @md-change="checkDetails" />
    </md-field>

    <md-field>
      <label>Name</label>
      <md-input v-model="fileName" placeholder="Give the file a name"></md-input>
    </md-field>

    <md-field>
      <label>Description</label>
      <md-textarea v-model="fileDescription" @keyup.ctrl.enter="uploadFile" md-autogrow></md-textarea>
    </md-field>

    <md-list>
      <md-list-item>
        <md-checkbox class="md-primary" v-model="exportUploadedFile" :disabled="!exportAllowed">
          <span :class="{ unavailable: !exportAllowed }" title="Only available for files under 50MB">Export to DDoSDB</span>
        </md-checkbox>
        <md-badge class="md-square" md-content="BETA" />
      </md-list-item>
    </md-list>

    <div class="radio-wrapper" v-if="extensions">
      <md-radio v-model="classify" value="no">Do Not Classify Attack Type</md-radio>

      <md-radio v-model="classify" value="auto" class="md-primary">Automatically Classify Attack Type</md-radio>
      <div v-if="classify === 'auto'" class="radio-submenu">
        <div class="radio-wrapper">
          <md-radio v-model="algo" :value="algorithm.id" class="md-primary" v-for="algorithm in algorithms"  :key="algorithm.id">{{ algorithm.name }}</md-radio>
        </div>
      </div>

      <md-radio v-model="classify" value="manual" class="md-primary">Manually Classify Attack Type</md-radio>
      <div v-if="classify === 'manual'" class="radio-submenu">
        <div v-if="sections.length === 0" class="section-row">
          The entire file is of attack type
          <md-field class="section-value">
            <md-select v-model="attackType" name="attackType" id="movie">
              <md-option v-for="attackType in attackTypes"  :key="attackType.id" :value="attackType.id">{{ attackType.name }}</md-option>
            </md-select>
          </md-field>
        </div>

        <div v-else v-for="(section, index) in sections"  :key="index" class="section-row">
          Section from
          <md-field class="section-value">
            <md-input class="section-value" v-model="sections[index].start" type="number"></md-input>
          </md-field>
           to
           <md-field class="section-value">
            <md-input class="section-value" v-model="sections[index].end" type="number"></md-input>
          </md-field>
          seconds is of attack type
          <md-field class="section-value">
            <md-select v-model="sections[index].type" name="attackType" id="movie">
              <md-option v-for="attackType in attackTypes"  :key="attackType.id" :value="attackType.id">{{ attackType.name }}</md-option>
            </md-select>
          </md-field>
        </div>

        <md-button class="md-dense md-raised md-primary" @click="sections.push({start: 0, end:0, type:0})">Add Section</md-button>
        <md-button v-if="sections.length > 0" class="md-dense md-raised " @click="sections.pop()">Remove Section</md-button>
      </div>
    </div>

  <div class="upload-btn-wrapper">
    <md-button class="md-raised md-primary md-icon-button" :disabled="!inputDefined" @click="uploadFile" v-if="!isLoading">
      <md-icon>cloud_upload</md-icon>
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
    file: null,
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
    uploadProgress: 0,
    classify: 'no',
    sections: [],
    attackType: 0,
    algo: 'randomforest',
    algorithms: [],
    attackTypes: []
  }),
  mounted: function () {
    fetch(`${apibaseurl}/ml/algorithms`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
      .then(async (response) => {
        this.algorithms = await response.json()
      })

    fetch(`${apibaseurl}/ml/attacktypes`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
      .then(async (response) => {
        this.attackTypes = await response.json()
      })
  },
  computed: {
    inputDefined: function () {
      return this.file && this.fileName && this.fileDescription
    },
    fileSizeInMB: function () {
      var mbs = this.fileSize / 1000 / 1000
      if (mbs >= 1) {
        return (this.fileSize / 1000 / 1000).toFixed()
      }
      return (this.fileSize / 1000 / 1000).toFixed(3)
    },
    exportAllowed: function () {
      return this.fileSize < 50000000
    },
    extensions () {
      return this.$store.state.extensions
    }
  },
  methods: {
    checkDetails (fileList) {
      this.fileSize = fileList.item(0).size
    },
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
    createFinalAttackTimes () {
      var attackTimes = ''
      if (this.classify === 'no') {
        attackTimes = '0'
      } else if (this.sections.length > 0) {
        var finalString = ''
        for (var section of this.sections) {
          finalString = finalString + section.start + ':' + section.end + ':' + section.type + ','
        }
        attackTimes = finalString.slice(0, finalString.length - 1)
      } else {
        attackTimes = this.attackType
      }
      return attackTimes
    },
    uploadFile () {
      const formData = new FormData()
      const fileField = document.querySelector('input[type="file"]')

      formData.append('name', this.fileName)
      formData.append('description', this.fileDescription)
      formData.append('captureFile', fileField.files[0])
      formData.append('classification', this.classify)
      formData.append('algorithm', this.algo)
      formData.append('attacktimes', this.createFinalAttackTimes())

      this.isLoading = true
      axios.request({
        url: `${apibaseurl}/analysis/upload`,
        method: 'POST',
        data: formData,
        withCredentials: 'include',
        onUploadProgress: (p) => {
          var progress = (p.loaded / p.total) * 100
          this.uploadProgress = progress.toFixed(2)
        }
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
          this.snackbarMsg = 'Upload was Successful, starting analysis now.'
          this.showSnackbar = true
          // start analysis
          var shouldExport = this.exportUploadedFile && this.exportAllowed
          fetch(`${apibaseurl}/analysis/${result.id}/analyse?export=${shouldExport}`, {
            method: 'POST',
            credentials: 'include'
          })
            .then((result) => {
              this.clear()
              this.showSnackbar = true
              //  this.closingTimeout = setTimeout(() => { this.$emit('done') }, 5000)
              this.$emit('done')
            })
        })
        .then((result) => {
          // console.log(result)
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
  .radio-wrapper {
    display: flex;
    flex-direction: column;
  }
  .section-value {
    display: inline;
    width: 100px;
    height: 10px;
    margin-left: 10px;
    margin-right: 15px;
  }
  .section-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
  }
  .radio-submenu {
    margin-left: 38px;
    max-height: 200px;
    overflow-y: scroll;
  }
  .md-radio {
    margin: 8px 8px 8px 0 !important;
  }
</style>
