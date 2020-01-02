<template>
  <div class="data-sets">
    <h1>
      Uploaded Data Sets
    </h1>
    <md-dialog :md-active.sync="showFileUpload">
      <md-dialog-title>Upload a Data Set</md-dialog-title>
      <file-upload-form>
      </file-upload-form>
      <md-dialog-actions>
        <md-button class="md-primary" @click="showDialog = false">Close</md-button>
        <md-button class="md-primary" @click="showDialog = false">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
    <div v-for="dataset in datasets"  :key="dataset.id" class="">
      {{ dataset }}
    </div>
    <md-button @click="showFileUpload=true" class="md-fab md-primary md-fab-bottom-right" >
      <md-icon>add</md-icon>
    </md-button>
  </div>
</template>

<script>
import FileUploadForm from '../components/FileUploadForm.vue'
export default {
  name: 'DataSets',
  components: {
    'file-upload-form': FileUploadForm
  },
  mounted: async function () {
    try {
      var res = await fetch('http://localhost:3000/analysis')
      var json = await res.json()
      this.datasets = json
    } catch (e) {
      console.log(e)
    }
  },
  methods: {
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
@media only screen and (max-device-width: 768px){
  .card {
    flex-basis: 100%;
  }
}

.md-dialog {
  width: 50%;
  max-width: 768px;
}

</style>
