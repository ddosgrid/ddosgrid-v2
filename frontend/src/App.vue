<template>
  <div id="app">
    <div id="nav">
      <md-tabs md-sync-route>
        <md-tab id="tab-home" md-label="" to="/" md-icon="home" exact></md-tab>
        <md-tab id="tab-dashboard" md-label="" to="/dashboard" md-icon="dashboard" exact></md-tab>
        <md-tab id="tab-data-sets" md-label="" to="/datasets" md-icon="view_list" exact></md-tab>
      </md-tabs>
    </div>
    <div>
    <router-view id="main" />
    </div>
  </div>
</template>

<script>
export default {
}
</script>

<style>
  #app {
    -webkit-animation: fadein 0.5s; /* Safari, Chrome and Opera > 12.1 */
       -moz-animation: fadein 0.5s; /* Firefox < 16 */
        -ms-animation: fadein 0.5s; /* Internet Explorer */
         -o-animation: fadein 0.5s; /* Opera < 12.1 */
            animation: fadein 0.5s;
  }
  @keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Firefox < 16 */
  @-moz-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Safari, Chrome and Opera > 12.1 */
  @-webkit-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Internet Explorer */
  @-ms-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* Opera < 12.1 */
  @-o-keyframes fadein {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  #main {
    width: 80%;
    margin: auto;
  }
</style>
