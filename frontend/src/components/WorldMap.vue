<template>
  <mymap :countryData="countries" defaultCountryFillColor="#f8f8f8" lowColor="#ffbdbb" highColor="#af4448"></mymap>
</template>
<script>
import map from 'vue-world-map'

export default {
  name: 'WorldMap',
  props: [ 'url' ],
  components: {
    'mymap': map
  },
  data: function () {
    return {
      countries: {}
    }
  },
  mounted: async function () {
    try {
      let response = await fetch(this.url)
      let parsedResponse = await response.json()
      console.log(parsedResponse.worldmap)
      this.countries = parsedResponse.worldmap
    } catch (e) {
      this.$emit('unavailable')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
