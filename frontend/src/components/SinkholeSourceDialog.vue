<template>
  <md-dialog
    :md-active="show"
    @md-closed="close"
    @md-opened="loadStats"
    @md-clicked-outside="close"
    style="min-width: 30em"
  >
    <md-dialog-title>Sources for {{ this.entry.entry }}</md-dialog-title>
    <md-dialog-content>
      <md-card-content style="padding-top: 0">
        <md-field>
          <label>search</label>
          <md-input v-model="searchString" @keyup.enter="filterStatsBySearch"/>
          <!--        <md-icon>search</md-icon>-->
          <md-button class="md-icon-button" @click="filterStatsBySearch">
            <md-tooltip>search in stats</md-tooltip>
            <md-icon>search</md-icon>
          </md-button>
        </md-field>
        <md-list>
          <md-list-item
            v-for="entry in this.pagination.pageItems"
            :key="entry.address"
          >
            <span class="md-list-item-text">{{ entry.address }}</span>
            <md-badge class="md-square" :md-content="entry.count">
              <md-tooltip>occurrences</md-tooltip>
            </md-badge>
          </md-list-item>
        </md-list>
      </md-card-content>
      <md-divider/>
      <md-card-actions class="md-layout-item">
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
    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary" @click="close">
        close
      </md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
export default {
  name: 'SinkholeSourceDialog',
  props: ['entry', 'show'],
  data: () => ({
    stats: [],
    originalStats: [],
    pagination: {
      currentPage: 0,
      itemsPerPage: 5,
      possibleItemsPerPage: [5, 10, 20, 50, 100],
      pageItems: []
    },
    searchString: ''
  }),
  methods: {
    close: function () {
      this.$emit('update:show', false)
    },
    loadStats: function () {
      this.originalStats = this.entry.sources
      this.stats = this.originalStats
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
      this.stats = this.originalStats.filter(e => e.address.includes(this.searchString))
      this.updatePageItems()
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
