<template>
<div class="data-sets">
  <div class="loader" v-if="!hasLoaded">
    <md-progress-spinner :md-diameter="60" :md-stroke="3" md-mode="indeterminate" class="centered"></md-progress-spinner>
  </div>

  <md-empty-state
    md-icon="layers_clear"
    md-label="No datasets uploaded"
    md-description="You can upload a dataset by clicking the + button in the bottom right corner" v-if="datasets.length === 0 && hasLoaded" class="centered">
    <md-button class="md-primary md-raised" @click="showFileUpload = true" :disabled="demoMode">Upload a dataset</md-button>
    <md-button class="md-primary md-raised" @click="showFileImport = true" :disabled="demoMode">Import a dataset</md-button>
  </md-empty-state>

  <!-- Uploading datasets to DDoSDB/DDoSGrid -->
  <md-dialog :md-active.sync="showFileUpload">
    <md-dialog-title>Upload a Data Set</md-dialog-title>
    <file-upload-form @done="closeUploadForm">
    </file-upload-form>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showFileUpload = false">
        <md-icon>close</md-icon>
      </md-button>
    </md-dialog-actions>
  </md-dialog>

  <!-- Importing datasets from DDoSDB -->
  <md-dialog :md-active.sync="showFileImport">
    <md-dialog-title>Import a Data Set</md-dialog-title>
    <file-import-form @done="closeImportForm">
    </file-import-form>
    <md-dialog-actions>
      <md-button class="md-primary" @click="showFileImport = false">
        <md-icon>close</md-icon>
      </md-button>
    </md-dialog-actions>
  </md-dialog>

  <div v-for="dataset in datasets" :key="dataset._id" class="dataset">
    <data-set-list-item :dataset="dataset" @deleted="refresh">
    </data-set-list-item>
  </div>

  <md-speed-dial class="md-bottom-right no-print above" md-event="hover" id="dial">
    <md-speed-dial-target class="md-primary">
      <md-icon class="md-morph-initial">add</md-icon>
      <md-icon class="md-morph-final no-print">close</md-icon>
    </md-speed-dial-target>
    <md-tooltip md-direction="top" v-if="demoMode">Demo Mode: Import/Export disabled!</md-tooltip>

    <md-speed-dial-content>
      <md-button class="md-icon-button" @click="showFileUpload = true" :disabled="demoMode">
        <md-tooltip md-direction="top" v-if="!demoMode">Upload a raw PCAP file</md-tooltip>
        <md-tooltip md-direction="top" v-else>Demo Mode: Upload disabled</md-tooltip>
        <md-icon>cloud_upload</md-icon>
      </md-button>
      <md-button class="md-icon-button" @click="showFileImport = true" :disabled="demoMode">
        <md-tooltip md-direction="top" v-if="!demoMode">Import an existing dataset from DDoSDB</md-tooltip>
        <md-tooltip md-direction="top" v-else>Demo Mode: Import disabled</md-tooltip>
        <md-icon>cloud_download</md-icon>
      </md-button>
    </md-speed-dial-content>
  </md-speed-dial>

</div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import FileUploadForm from '../components/FileUploadForm.vue'
import FileImportForm from '../components/FileImportForm.vue'
import DataSetListItem from '../components/DataSetListItem.vue'

var intervalId = null

export default {
  name: 'DataSets',
  data: function () {
    return {
      datasets: [],
      showFileUpload: false,
      showFileImport: false,
      hasLoaded: false
    }
  },
  components: {
    'file-upload-form': FileUploadForm,
    'file-import-form': FileImportForm,
    'data-set-list-item': DataSetListItem
  },
  mounted: function () {
    this.fetchDataSets()
    intervalId = setInterval(this.fetchDataSets, 3000)
    this.showFileImport = 'import' in this.$route.query && !this.demoMode
  },
  beforeDestroy: function () {
    clearInterval(intervalId)
  },
  computed: {
    demoMode () {
      return this.$store.state.demomode
    }
  },
  methods: {
    closeUploadForm: function () {
      this.showFileUpload = false
    },
    closeImportForm: function () {
      this.showFileImport = false
    },
    refresh: function () {
      this.fetchDataSets()
    },
    fetchDataSets: async function fetchDataSets () {
      try {
        var res = await fetch(`${apibaseurl}/analysis`, { credentials: 'include' })
        var json = await res.json()
        this.datasets = json
        this.hasLoaded = true
        var nrOfAnalysedSetups = this.datasets.filter(d => {
          return d.status === 'analysed'
        }).length
        this.$store.commit('updateNrOfAnalysedSetups', nrOfAnalysedSetups)
      } catch (e) {
        console.log(e)
      }
    }
  },
  watch: {
    showFileUpload: async function (newVal, oldVal) {
      if (!newVal) {
        // refresh list
        this.fetchDataSets()
      }
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
.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
