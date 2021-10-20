<template lang="html">
  <div id="form">
    <md-field>
      <label>Port</label>
      <md-input v-model="port" placeholder="Enter a port..." :disabled="isLoading" />
    </md-field>

    <md-button class="md-primary md-raised" :disabled="!inputDefined" @click="addConnection" v-if="!isLoading">Add</md-button>
    <md-progress-spinner :md-diameter="40" :md-stroke="3" md-mode="indeterminate" class="centered" v-if="isLoading"></md-progress-spinner>

    <md-snackbar :md-position="position" :md-duration="isInfinity ? Infinity : duration" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ snackbarMsg }}</span>
      <md-button class="md-primary" @click="addAnother">Add another connection</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import axios from 'axios'

export default {
  data: () => ({
    port: null,
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
      return this.port
    }
  },
  methods: {
    clear () {
      this.port = null
    },
    addAnother () {
      this.clear()
      clearTimeout(this.closingTimeout)
      this.showSnackbar = false
    },
    addConnection () {
      const formData = new FormData()

      formData.append('port', this.port)
      this.isLoading = true
      axios.request({
        url: `${apibaseurl}/live-analysis/connection`,
        method: 'POST',
        data: formData,
        withCredentials: 'include'
      })
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(`something went wrong. Status: ${response.status}`)
          }
          return response
        })
        .then((response) => {
          this.isLoading = false
          this.snackbarMsg = 'Successfully added a new connection.'
          this.showSnackbar = true
        })
        .catch((error) => {
          this.isLoading = false
          console.error('Error:', error)
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
