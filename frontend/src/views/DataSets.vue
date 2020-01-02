<template>
  <div class="data-sets">
    <h1>
      Uploaded Data Sets
    </h1>
    <file-upload-form>
    </file-upload-form>
    <div v-for="dataset in datasets"  :key="dataset.id" class="">
      {{ dataset }}
    </div>
    <md-button class="md-fab md-primary md-fab-bottom-right" >
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
      datasets: []
    }
  }
}
</script>

<style scoped>
#flex-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

md-card {
  width: 10%;
}
.card {
  flex-basis: 700px;
  flex-grow: 1;
  margin: 10px 10px;
}
@media only screen and (max-device-width: 768px){
  .card {
    flex-basis: 100%;
  }
}

</style>
