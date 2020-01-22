<template>
<div class="data-sets">
  <h1>
    Uploaded Data Sets
  </h1>
      <md-empty-state
        md-rounded
        md-icon="sync"
        md-label="No datasets uploaded"
        md-description="You can upload a dataset by clicking the + button in the bottom right corner" v-if="datasets.length === 0" class="empty-notification">
      </md-empty-state>

  <div class="wrapper">
    <md-dialog :md-active.sync="showFileUpload">
      <md-dialog-title>Upload a Data Set</md-dialog-title>
      <file-upload-form>
      </file-upload-form>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showFileUpload = false">
          <md-icon>close</md-icon>
        </md-button>
      </md-dialog-actions>
    </md-dialog>

    <div v-for="dataset in datasets" :key="dataset._id" class="dataset">
      <data-set-list-item :dataset="dataset" @deleted="refresh">
      </data-set-list-item>
    </div>

    <md-button id="fab" @click="showFileUpload=true" class="md-fab md-primary md-fab-bottom-right">
      <md-icon>add</md-icon>
    </md-button>

  </div>
</div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import FileUploadForm from '../components/FileUploadForm.vue'
import DataSetListItem from '../components/DataSetListItem.vue'

var intervalId = null

export default {
  name: 'DataSets',
  components: {
    'file-upload-form': FileUploadForm,
    'data-set-list-item': DataSetListItem
  },
  mounted: function () {
    this.fetchDataSets()
    intervalId = setInterval(this.fetchDataSets, 1000)
  },
  beforeDestroy: function () {
    clearInterval(intervalId)
  },
  methods: {
    refresh: function () {
      this.fetchDataSets()
    },
    fetchDataSets: async function fetchDataSets () {
      try {
        var res = await fetch(`${apibaseurl}/analysis`)
        var json = await res.json()
        this.datasets = json
      } catch (e) {
        console.log(e)
      }
    },
    sendNotification: function sendNotification (msg) {
      var text = `Dataset "${msg}" was successfully analysed`
      if (!('Notification' in window)) {
        return null
      } else if (Notification.permission === 'granted') {
        var notification = new Notification(text)
        console.log(notification)
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(function (permission) {
          if (permission === 'granted') {
            var notification = new Notification(text)
            console.log(notification)
          }
        })
      }
    }
  },
  watch: {
    datasets: async function (newval, oldval) {
      var app = this
      if (newval.length > 1 && oldval.length === 0) {
        return null
      }
      newval.forEach(function (el) {
        var correspondingOldDataset = oldval.find((olds) => { return olds.md5 === el.md5 })
        if (!correspondingOldDataset && el.status === 'analysed') {
          app.sendNotification(el.name)
        }
        if (correspondingOldDataset && correspondingOldDataset.status !== 'analysed' && el.status === 'analysed') {
          app.sendNotification(el.name)
        }
      })
    },
    showFileUpload: async function (newVal, oldVal) {
      if (!newVal) {
        // refresh list
        this.fetchDataSets()
      }
    }
  },
  data: function () {
    return {
      datasets: [],
      showFileUpload: false
    }
  }
}
</script>

<style scoped>
@media only screen and (max-device-width: 768px) {
  .card {
    flex-basis: 100%;
  }
}
.wrapper {
  scrollbar-width: none;
}

.wrapper::-webkit-scrollbar {
  display: none;
}

.dataset {
  margin-bottom: 10px;
}

.md-dialog {
  width: 50%;
  max-width: 768px;
}

#fab {
  position: fixed;
}
.empty-notification {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
