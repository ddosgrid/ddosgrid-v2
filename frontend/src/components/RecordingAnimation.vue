<template>
  <!-- This is based on a work from "Florian Pop", credits to him: https://www.florin-pop.com/blog/2019/03/css-pulse-effect/ -->
  <div class="blob"></div>
</template>

<script>
export default {
  name: 'RecordingAnimation'
}
</script>

<style scoped>
.blob {
  display: inline-block;
  background: #ff5252;
  border-radius: 50%;
  margin: 0em;
  height: 1em;
  width: 1em;
  z-index: 100000;
  margin: 4px 4px 0 6px;

  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  transform: scale(1);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>
