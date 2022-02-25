<template>
  <md-card>
    <md-card-header>
      <md-card-header-text>
        <div class="md-title">Blacklist</div>
        <div class="md-subhead">
          {{ getStatusText() }}
        </div>
      </md-card-header-text>
      <md-card-actions>
        <md-button
          v-if="!loading"
          class="md-primary md-icon-button"
          @click="toggleUpdateDialog"
        >
          <md-tooltip>update blacklist</md-tooltip>
          <md-icon>upload</md-icon>
        </md-button>
        <md-button
          class="md-icon-button"
          @click="loadBlacklist(true)"
        >
          <md-tooltip>refresh blacklist</md-tooltip>
          <md-icon>refresh</md-icon>
        </md-button>
      </md-card-actions>
    </md-card-header>
    <md-divider/>
    <md-card-content style="padding-top: 0">
      <md-field>
        <label>search</label>
        <md-input v-model="searchString" @keyup.enter="filterBlacklistBySearch" :disabled="loading"/>
<!--        <md-icon>search</md-icon>-->
        <md-button class="md-icon-button" @click="filterBlacklistBySearch" :disabled="loading">
          <md-tooltip>search in blacklist</md-tooltip>
          <md-icon>search</md-icon>
        </md-button>
      </md-field>
      <md-progress-spinner v-if="loading" :md-diameter="36" :md-stroke="4" md-mode="indeterminate"/>
      <!--      <blacklist-table :blacklist="blacklist"/>-->
      <md-list v-if="!loading">
        <md-list-item v-for="entry in this.pagination.pageItems" :key="entry">
          <div class="md-list-item-text">{{ entry }}</div>
          <md-divider class="md-inset"></md-divider>
        </md-list-item>
      </md-list>
    </md-card-content>
    <md-divider v-if="!loading"/>
    <md-card-actions class="md-layout-item" v-if="!loading">
      <div style="margin-right: 1em">
        rows per page:
      </div>
      <md-field class="row-select">
        <md-select v-model="pagination.itemsPerPage" name="rows" v-on:md-selected="resetView(false, false)">
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
    <sinkhole-blacklist-update-dialog :show.sync="showUpdateDialog" @updated="loadBlacklist"/>
  </md-card>
</template>

<script>
import { apibaseurl } from '@/config/variables'
import SinkholeBlacklistUpdateDialog from '@/components/SinkholeBlacklistUpdateDialog'

export default {
  name: 'SinkholeBlacklistCard',
  components: { SinkholeBlacklistUpdateDialog },
  data: () => ({
    blacklist: [],
    originalBlacklist: [],
    blacklistMode: 'manual',
    blacklistUrl: null,
    loading: true,
    pagination: {
      currentPage: 0,
      itemsPerPage: 5,
      possibleItemsPerPage: [5, 10, 20, 50, 100],
      pageItems: []
    },
    searchString: '',
    showUpdateDialog: false
  }),
  async mounted () {
    await this.loadBlacklist()
  },
  methods: {
    loadBlacklist: async function (delay) {
      let result = await (await fetch(`${apibaseurl}/sinkhole/blacklist`, { credentials: 'include' })).json()
      this.originalBlacklist = result.data
      this.blacklistMode = result.mode
      this.blacklistUrl = result.url
      this.blacklist = this.originalBlacklist
      this.loading = false
      await this.resetView(delay, true)
    },
    updatePageItems: function () {
      this.pagination.pageItems = this.getPageItems(this.pagination.currentPage)
    },
    getPageItems: function (page) {
      let start = page * this.pagination.itemsPerPage
      let stop = start + this.pagination.itemsPerPage
      return this.blacklist.slice(start, stop)
    },
    getCurrentItemsText: function () {
      let firstItem = this.pagination.currentPage * this.pagination.itemsPerPage + 1
      let lastItem = firstItem + this.pagination.pageItems.length - 1
      return `${firstItem}-${lastItem} of ${this.blacklist.length}`
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
    resetView: async function (delay, resetSearch) {
      this.loading = true
      if (resetSearch) {
        this.searchString = ''
      }
      if (delay) {
        setTimeout(async () => {
          this.pagination.currentPage = 0
          await this.updatePageItems()
          this.loading = false
        }, 1000)
      } else {
        this.pagination.currentPage = 0
        await this.updatePageItems()
        this.loading = false
      }
    },
    filterBlacklistBySearch: function () {
      this.blacklist = this.originalBlacklist.filter(e => e.includes(this.searchString))
      this.updatePageItems()
    },
    toggleUpdateDialog: function () {
      this.showUpdateDialog = !this.showUpdateDialog
    },
    getStatusText: function () {
      if (this.blacklistMode === 'manual') {
        if (this.blacklistUrl) {
          return `manually pulled from ${this.blacklistUrl}`
        } else {
          return 'manually configured'
        }
      } else if (this.blacklistMode === 'auto') {
        return `automatically pulling hourly from ${this.blacklistUrl}`
      }
    }
  },
  computed: {
    pages: function () {
      return Math.ceil(this.blacklist.length / this.pagination.itemsPerPage)
    },
    hasNextPage: function () {
      return (this.pagination.currentPage * this.pagination.itemsPerPage) +
        this.pagination.itemsPerPage < this.blacklist.length
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
