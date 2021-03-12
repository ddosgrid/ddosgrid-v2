<template lang="html">

  <div class="wrapper">
    <md-card>
      <md-card-header>
        <div class="md-title">Machine Learning Model Statistics and Overview</div>
      </md-card-header>

      <md-card-content>
        This tab lists different statistics and metrics about your machine learning model, as well as the ML extension itself.<br>It also allows you to perform actions that manipulate the entire model-data, such as deletion of the model.
        <md-card-header>
          <h3>Model Data Metrics</h3>
        </md-card-header>
        <div class="card-content-container">
          <div class="card-content-half">
            <div class="">Number of Datasets: {{ modelstats.nrdatasets }}</div>
            <div class="">Number of Records: {{ modelstats.lineCount }}</div>
            <div class="">Size of Traninig Data: {{ modelstats.size }} Bytes</div>
          </div>
        </div>

        <md-card-header>
          <h3>Recognized Attack Types of the ML Extension and Their Occurrence in the Model</h3>
        </md-card-header>
        <div id="attack-types" class="card-content-container">
          <div id="attack-list" class="card-content-half">
            <div v-for="at in attackTypes"  :key="at.id" class="">{{ at.id }}: {{ at.name }}</div>
          </div>
          <div id="pie-vis" class="card-content-half hundred">
            <div id="pie-div" v-if="modelstats.lineCount > 0" class="distribution-wrapper hundred">
              <piechart class="hundred" :chartData="modelstats.distribution">
              </piechart>
            </div>
            <div v-else>
              Populate the model to get the attack type distribution.
            </div>
          </div>
        </div>

        <md-card-header>
          <h3>Available ML Algorithms</h3>
        </md-card-header>
        <div class="card-content-container">
          <div class="card-content-half">
            <div class="btn-eval-div" v-for="at in algorithms"  :key="at.id">
              <div  class="">{{ at.name }}</div>
              <div v-if="modelstats.lineCount > 0">
                <md-button class="md-raised" @click="getModelEval(at.id)">Evaluate</md-button>
              </div>
            </div>
          </div>
        </div>

        <md-card-header>
          <h3>Model Evaluation Results</h3>
        </md-card-header>
        <div class="card-content-container">
          <div class="card-content-half">
            <div v-if="!modeleval">
              Populate the model to evaluate it and choose an algorithm above and click evaluate.
            </div>
            <div class="keep-spaces" v-for="line in this.modeleval.split('\n')"  :key="line">
              {{ line }}
            </div>
          </div>
        </div>

      </md-card-content>
      <md-card-actions md-alignment="left">
        <md-button @click="deleteModel()">Delete Model</md-button>
      </md-card-actions>
    </md-card>
  </div>

</template>

<script>
import { apibaseurl } from '@/config/variables.js'
import LocalPieChart from '../components/LocalPieChart'

export default {
  data: () => ({
    attackTypes: [],
    algorithms: [],
    modeleval: '',
    modelstats: {
      distribution: {
        labels: ['placeholder'],
        datasets: [
          {
            backgroundColor: '#f87979',
            data: [0]
          }
        ]
      }
    }
  }),
  components: {
    'piechart': LocalPieChart
  },
  mounted: function () {
    this.getAttackTypes()
    this.getAlgorithms()
    this.getModelStats()
  },
  methods: {
    getRandomHexColor: function () {
      return `#${(Math.random() * 0xFFFFFF << 0).toString(16)}`
    },
    getAttackTypes: function () {
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
    },
    getAlgorithms: function () {
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
    deleteModel: function () {
      fetch(`${apibaseurl}/ml/deletemodel`, {
        method: 'POST',
        credentials: 'include'
      })
        .then(() => {
          this.getModelStats()
        })
        .catch(() => {
          console.error('Unable to delete model')
        })
    },
    getModelStats: function () {
      fetch(`${apibaseurl}/ml/modelstats`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      })
        .then(async (response) => {
          this.modelstats = await response.json()

          this.modelstats.distribution = {
            labels: this.modelstats.distribution.labels,
            datasets: [
              {
                backgroundColor: ['#4f5bd5', '#feda75', '#fa7e1e', '#d62976', '#962fbf', '#00ff83', '#00d27f', '#028900'],
                data: this.modelstats.distribution.data
              }
            ]
          }
        })
    },
    getModelEval: function (id) {
      this.modeleval = 'Retrieving Evaluation Values...'
      fetch(`${apibaseurl}/ml/modeleval/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        }
      })
        .then(async (response) => {
          this.modeleval = await response.text()
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

.distribution-wrapper {
  width: 50%;
}

.keep-spaces {
  white-space: pre-wrap;
  font-family: monospace
 }

 .card-content-container {
   display: flex;
   align-items: center;
 }

#attack-types {
  height: 300px;
}

.hundred {
  height: 100% !important;
  width: 100% !important;
}

#attack-list {
  width: 30%;
}

.btn-eval-div {
  display: flex;
  align-items: center;
}
</style>
