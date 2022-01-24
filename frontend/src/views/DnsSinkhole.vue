<template>
  <div>
    <div class="sinkhole-controls">
      <md-card>
        <md-card-header>
          <div class="md-title">DNS Sinkhole</div>
        </md-card-header>
        <md-card-content>
        </md-card-content>
      </md-card>
    </div>
    <md-button class="md-fab md-fab-bottom-right">
      <md-icon>cyclone</md-icon>
      <md-tooltip md-direction="top">start sinkhole</md-tooltip>
    </md-button>
  </div>
</template>

<script>
export default {
  name: 'DnsSinkhole'
}
</script>

<style scoped>
.sinkhole-controls {
  max-width: 960px;
  display: flex;
  flex-direction: column;
}
</style>
