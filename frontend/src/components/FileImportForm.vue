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
    closingTimeout: 0,
    classify: 'no',
    sections: [],
    attackType: 0,
    algo: 'randomforest',
    algorithms: [],
    attackTypes: []
  }),
  computed: {
    inputDefined: function () {
      return this.file && this.fileName && this.fileDescription
    },
    extensions () {
      return this.$store.state.extensions
    }
  },
  mounted: function () {
    this.file = this.$route.query.import
    window.ga = this

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
      console.log(attackTimes)
      return attackTimes
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
          datasetdescription: this.fileDescription,
          classification: this.classify,
          algorithm: this.algo,
          attackTimes: this.createFinalAttackTimes()
        }),
        credentials: 'include'
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
              this.$router.replace({ 'query': null })
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
          this.$router.replace({ 'query': null })
          // snackbar to let user know an error has occurred
          this.snackbarMsg = error.message
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
