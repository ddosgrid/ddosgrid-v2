<template>
  <div id="app">
      <md-tabs md-sync-route class="nav">
        <md-tab id="tab-home" md-label="" to="/" md-icon="home" exact></md-tab>
        <md-tab id="tab-dashboard" md-label="" to="/dashboard" md-icon="dashboard" exact></md-tab>
        <md-tab id="tab-data-sets" md-label="" to="/datasets" md-icon="view_list" exact></md-tab>
      </md-tabs>
    <router-view id="main" />
  </div>
</template>

<script>
export default {
}
</script>

<style>
  #app {
    height: 100%;
    width: 100%;
    position: absolute;
    overflow: hidden;
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
    height: calc(100% - 50px)
  }
</style>
