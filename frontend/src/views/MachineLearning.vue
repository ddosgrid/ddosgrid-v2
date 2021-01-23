<template lang="html">

  <div class="wrapper">
    <md-card>
      <md-card-header>
        <div class="md-title">Machine Learning Model Statistics and Overview</div>
      </md-card-header>

      <md-card-content>
        This tab lists different statistics and metrics about your machine learning model, as well as the ML extension itself.<br>It also allows you to perform actions that manipulate the entire model-data, such as deletion of the model.
        <md-card-header>
          <div class="md-subhead">Model Data Metrics</div>
        </md-card-header>
        <div class="card-content-container">
          <div class="card-content-half">
            <div class="">Number of Datasets: </div>
            <div class="">Number of Records: </div>
            <div class="">Size of Traninig Data: </div>
          </div>
        </div>

        <md-card-header>
          <div class="md-subhead">Recognized Attack Types</div>
        </md-card-header>
        <div class="card-content-container">
          <div class="card-content-half">
            <div v-for="at in attackTypes"  :key="at.id" class="">{{ at.id }}: {{ at.name }}</div>
          </div>
        </div>

        <md-card-header>
          <div class="md-subhead">Available ML Algorithms</div>
        </md-card-header>
        <div class="card-content-container">
          <div class="card-content-half">
            <div v-for="at in algorithms"  :key="at.id" class="">{{ at.name }}</div>

          </div>
        </div>
      </md-card-content>

      <md-card-actions md-alignment="left">
        <md-button @click="deleteModel()">Delete Model</md-button>

        <md-button>Action</md-button>
      </md-card-actions>
    </md-card>
  </div>

</template>

<script>
import { apibaseurl } from '@/config/variables.js'

export default {
  data: () => ({
    attackTypes: [],
    algorithms: []
  }),
  mounted: function () {
    fetch(`${apibaseurl}/ml/attacktypes`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
      .then(async (response) => {
        this.attackTypes = await response.json()
      })

    fetch(`${apibaseurl}/ml/algorithms`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    })
      .then(async (response) => {
        this.algorithms = await response.json()
      })
  },
  methods: {
    deleteModel: function () {
      fetch(`${apibaseurl}/ml/deletemodel`, {
        method: 'POST',
        credentials: 'include'
      })
        .then(() => {
        })
        .catch(() => {
          console.error('Unable to delete model')
        })
    }
  }
}
</script>

<style lang="css">
.wrapper {
  max-width: 960px;
  margin: auto;
  display: flex;
  flex-direction: column;
}
</style>
