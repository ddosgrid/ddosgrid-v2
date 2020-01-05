<template lang="html">
  <md-card class="card">
    <md-card-header>
      <div class="md-title">{{ dataset.name }}</div>
    </md-card-header>

    <md-card-content>
      a
    </md-card-content>

    <md-card-actions>
      <md-button>Action</md-button>
    </md-card-actions>
  </md-card>
</template>

<script>
export default {
  props: [
    'dataset'
  ]
}
</script>

<style lang="css" scoped>
</style>
