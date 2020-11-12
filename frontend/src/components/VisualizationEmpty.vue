<template lang="html">
  <md-empty-state
    md-icon="directions_off"
    md-label="No traffic captured"
    md-description="No traffic that corresponds to this visualization type was captured">
  <md-button
    class="md-accent md-raised"
    @click="emitRemove">
      Remove chart
  </md-button>
</md-empty-state>
</template>

<script>
export default {
  methods: {
    emitRemove: function emitRemove () {
      this.$emit('removeVisualization')
    }
  }
}
</script>

<style lang="css" scoped>
  /* We only want to style the icon of this md-empty-state component */
  >>> .md-empty-state-icon {
    font-size: 100px !important;
    width: 100px !important;
    height: 100px !important;
    min-width: 100px !important;
  }
</style>
