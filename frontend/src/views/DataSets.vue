<template>
  <div class="data-sets">
    <h1>
      Uploaded Data Sets
    </h1>
    <div v-for="dataset in datasets"  :key="dataset.md5" class="">

    </div>
  </div>
</template>

<script>
export default {
  name: 'DataSets',
  components: {
  },
  mounted: async function () {
    var res = await fetch('https://api.ddosgrid.online/analysis')
    var json = await res.json()
    this.datasets = json
  },
  methods: {
    add: function (file) {
      console.log(file)
      if (Array.isArray(file)) {
        var urls = file.map(el => `https://api.ddosgrid.online/public/${file}`)
        console.log(urls)
        this.urls.push([...urls])
      }
    }
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
