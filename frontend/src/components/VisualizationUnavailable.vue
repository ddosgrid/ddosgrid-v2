<template lang="html">
  <md-empty-state
    md-icon="error_outline"
    md-label="Unable to render chart"
    md-description="This may due to an error or because you deleted the corresponding dataset">
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
    color: #ef6f6c !important;
    font-size: 100px !important;
    width: 100px !important;
    height: 100px !important;
    min-width: 100px !important;
  }
</style>
