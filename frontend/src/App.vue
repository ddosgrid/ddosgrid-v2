<template>
  <div id="app">
    <div id="nav">
      <md-tabs md-sync-route>
        <md-tab id="tab-home" md-label="" to="/" md-icon="home" exact></md-tab>
        <md-tab id="tab-dashboard" md-label="" to="/dashboard" md-icon="dashboard" exact></md-tab>
      </md-tabs>
    </div>
    <div>
    <router-view id="main" />
    <md-button class="md-fab md-primary md-fab-bottom-right" >
      <md-icon>add</md-icon>
    </md-button>
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style>
  #main {
    width: 80%;
    margin: auto;
  }
</style>
