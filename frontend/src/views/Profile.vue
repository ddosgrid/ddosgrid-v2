<template>
  <div>
    <md-card>
      <md-card-header>
        <div class="md-title">Logged in as {{ name }}</div>
        <div class="md-subhead">{{ email }}</div>

        <md-card-media>
          <img src="https://ddosdb.org/static/ddosdb/img/logo-new.svg" alt="People">
        </md-card-media>
      </md-card-header>

      <md-card-content>
        Authentication and Authorization is provided by the DDoSDB platform.
      </md-card-content>

      <md-card-actions>
        <!-- TODO: implement logout endpoint  -->
        <md-button>Logout</md-button>
      </md-card-actions>
    </md-card>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'

export default {
  data: function () {
    return {
      infourl: `${apibaseurl}/auth/info`,
      name: '',
      email: ''
    }
  },
  mounted: async function () {
    var res = await fetch(this.infourl, { credentials: 'include' })
    var info = await res.json()
    this.name = info.name
    this.email = info.email
  },
  name: 'Profile'
}
</script>

<style scoped>
.md-card-media {
  right: 0;
  position: absolute;
  top: 2em;
  right: 2em;
}
</style>
