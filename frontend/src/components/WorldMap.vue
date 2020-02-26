<template>
  <div class="wrap">
    <mymap :countryData="countries" defaultCountryFillColor="#f8f8f8" lowColor="#ffbdbb" highColor="#af4448"></mymap>
    <md-divider></md-divider>
    <div class="chips-wrapper">
      <div>Please note that the world map above only shows the origin of the top N source hosts!</div>
      <md-chip class="md-primary country" v-for="obj of Object.entries(countries)" :key="obj[0]">
        {{obj[0]}}: {{obj[1]}} packets
      </md-chip>
    </div>
  </div>
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
      this.countries = parsedResponse.worldmap
    } catch (e) {
      this.$emit('unavailable')
    }
  }
}
</script>

<style scoped>
.wrap {
  max-width: 890px;
}
.country {
  margin-top: 10px;
}
>>> .md-chip.md-theme-default {
}
</style>
