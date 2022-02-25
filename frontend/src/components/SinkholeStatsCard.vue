<template>
  <md-card>
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">Blacklist Triggers</div>
        <div class="md-subhead">
          triggered blacklist entries during the most recent run.
        </div>
      </md-card-header-text>
      <md-card-actions>
      </md-card-actions>
    </md-card-header>
    <md-divider/>
    <md-card-content style="padding-top: 0">
      <md-field>
        <label>search</label>
        <md-input v-model="searchString" @keyup.enter="filterStatsBySearch" :disabled="loading"/>
        <!--        <md-icon>search</md-icon>-->
        <md-button class="md-icon-button" @click="filterStatsBySearch" :disabled="loading">
          <md-tooltip>search in stats</md-tooltip>
          <md-icon>search</md-icon>
        </md-button>
      </md-field>
      <md-progress-spinner v-if="loading" :md-diameter="36" :md-stroke="4" md-mode="indeterminate"/>
      <md-list v-if="!loading">
        <md-list-item
          @click="toggleSourceDialog(entry)"
          v-for="entry in this.pagination.pageItems"
          :key="entry.address"
        >
          <span class="md-list-item-text">{{ entry.entry }}</span>
          <md-badge class="md-square" :md-content="entry.count">
            <md-tooltip>occurrences</md-tooltip>
          </md-badge>
        </md-list-item>
      </md-list>
    </md-card-content>
    <md-divider v-if="!loading"/>
    <md-card-actions class="md-layout-item" v-if="!loading">
      <div style="margin-right: 1em">
        rows per page:
      </div>
      <md-field class="row-select">
        <md-select v-model="pagination.itemsPerPage" name="rows" v-on:md-selected="resetView(false)">
          <md-option
            v-for="e in this.pagination.possibleItemsPerPage"
            :key="e"
            :value="e"
          >
            {{ e }}
          </md-option>
        </md-select>
      </md-field>
      <div style="margin-right: 1em">
        {{ getCurrentItemsText() }}
      </div>
      <md-button
        class="md-icon-button"
        v-bind:class="{'md-disabled': !hasPreviousPage}"
        @click="gotoPreviousPage"
        v-bind:disabled="!hasPreviousPage"
      >
        <md-icon>chevron_left</md-icon>
      </md-button>
      <md-button
        class="md-icon-button"
        v-bind:class="{'md-disabled': !hasNextPage}"
        @click="gotoNextPage"
        v-bind:disabled="!hasNextPage"
      >
        <md-icon>chevron_right</md-icon>
      </md-button>
    </md-card-actions>
    <sinkhole-source-dialog :entry="currentEntry" :show.sync="showSourceDialog"/>
  </md-card>
</template>

<script>
import SinkholeSourceDialog from '@/components/SinkholeSourceDialog'
export default {
  name: 'SinkholeStatsCard',
  components: { SinkholeSourceDialog },
  props: ['loading', 'propStats'],
  data: () => ({
    stats: [],
    originalStats: [],
    pagination: {
      currentPage: 0,
      itemsPerPage: 5,
      possibleItemsPerPage: [5, 10, 20, 50, 100],
      pageItems: []
    },
    searchString: '',
    currentEntry: { sources: [] },
    showSourceDialog: false
  }),
  watch: {
    propStats: {
      deep: true,
      handler: function (newVal, oldVal) {
        this.loadStats()
      } }
  },
  async mounted () {
    await this.loadStats()
  },
  methods: {
    loadStats: function () {
      this.originalStats = []
      for (let entry in this.propStats) {
        let newEntry = { entry, count: this.propStats[entry].count }
        newEntry.sources = []
        for (let s in this.propStats[entry].sources) {
          newEntry.sources.push({ address: s, count: this.propStats[entry].sources[s] })
        }
        newEntry.sources.sort((a, b) => (b.count - a.count))
        this.originalStats.push(newEntry)
      }
      this.originalStats.sort((a, b) => (b.count - a.count))
      if (!this.stats.length) {
        this.stats = this.originalStats
      }
      this.updatePageItems()
    },
    updatePageItems: function () {
      this.pagination.pageItems = this.getPageItems(this.pagination.currentPage)
    },
    getPageItems: function (page) {
      let start = page * this.pagination.itemsPerPage
      let stop = start + this.pagination.itemsPerPage
      return this.stats.slice(start, stop)
    },
    getCurrentItemsText: function () {
      let firstItem = this.pagination.currentPage * this.pagination.itemsPerPage + 1
      let lastItem = firstItem + this.pagination.pageItems.length - 1
      return `${firstItem}-${lastItem} of ${this.stats.length}`
    },
    gotoNextPage: function () {
      if (this.pagination.currentPage < this.pages) {
        this.pagination.currentPage++
        this.updatePageItems()
      }
    },
    gotoPreviousPage: function () {
      if (this.pagination.currentPage > 0) {
        this.pagination.currentPage--
        this.updatePageItems()
      }
    },
    resetView: async function (resetSearch) {
      if (resetSearch) {
        this.searchString = ''
      }
      this.pagination.currentPage = 0
      await this.updatePageItems()
    },
    filterStatsBySearch: function () {
      this.stats = this.originalStats.filter(e => e.entry.includes(this.searchString))
      this.updatePageItems()
    },
    toggleSourceDialog: function (entry) {
      this.currentEntry = entry
      this.showSourceDialog = !this.showSourceDialog
    }
  },
  computed: {
    pages: function () {
      return Math.ceil(this.stats.length / this.pagination.itemsPerPage)
    },
    hasNextPage: function () {
      return (this.pagination.currentPage * this.pagination.itemsPerPage) +
        this.pagination.itemsPerPage < this.stats.length
    },
    hasPreviousPage: function () {
      return this.pagination.currentPage > 0
    }
  }
}
</script>

<style scoped>

.row-select {
  width: 80px;
  margin-right: 2em;
}

.md-disabled {
  opacity: 0.5;
}

</style>
