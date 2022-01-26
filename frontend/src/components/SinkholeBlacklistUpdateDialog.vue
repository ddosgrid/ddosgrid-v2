<template>
  <md-dialog
    :md-active="show"
    @md-closed="close"
    @md-clicked-outside="close"
    style="min-width: 30em"
  >
    <md-dialog-title>Update Blacklist</md-dialog-title>
    <md-tabs class="md-transparent" md-alignment="fixed" v-on:md-changed="onTabChange">
      <md-tab id="tab-file" md-label="File"></md-tab>
      <md-tab id="tab-text" md-label="Text"></md-tab>
      <md-tab id="tab-url" md-label="URL"></md-tab>
    </md-tabs>
    <br/>
    <md-dialog-content v-if="activeTab === 'tab-file'">
      <div class="md-body-2">
        Upload a file to use as the new blacklist.
      </div>
      <div class="md-body-1 subbody" style="margin-bottom: 1em">
        One entry per line. Lines starting with # will be ignored.
      </div>
      <md-field>
        <label>Blacklist file</label>
        <md-file @md-change="onFileUpload"/>
      </md-field>
      <div class="md-body-1">
        <div v-if="status === 'processed'">
          <md-icon class="success-icon">check</md-icon>
          Successfully processed this file! found
          <span class="md-body-2">{{ processedBlacklist.length }}</span>
          entries.
        </div>
        <div v-if="status === 'error'">
          <md-icon class="failure-icon">close</md-icon>
          Failed to process this file!
        </div>
      </div>
    </md-dialog-content>
    <md-dialog-content v-else-if="activeTab === 'tab-text'">
      <div class="md-body-2">
        Paste a blacklist or write it up manually.
      </div>
      <div class="md-body-1 subbody" style="margin-bottom: 1em">
        One entry per line. Lines starting with # will be ignored.
      </div>
      <!-- TODO: maybe add line numbers for editing? Might be really unnecessary though -->
      <md-field style="display: none">
        <md-input/>
        <!-- this invisible field is unfortunately needed as an ugly hack -->
        <!-- because it otherwise breaks the CSS of the neighbouring tabs... -->
      </md-field>
      <md-field>
        <label>Blacklist entries</label>
        <md-textarea
          v-model="blacklistText"
          placeholder="evil.com
more-evil.to"
          @input="onTextChange"
        />
      </md-field>
      <div class="md-body-1 text-status-container">
        <md-button
          class="md-primary"
          :disabled="!changes || !blacklistText.length"
          @click="onApplyText"
        >
          <md-icon>check</md-icon>
          apply
          <md-tooltip>Apply and process the current text entries to prepare them for saving</md-tooltip>
        </md-button>
        <div v-if="status === 'processed'" style="flex-grow: 1">
          <md-icon class="success-icon">check</md-icon>
          Successfully processed! found
          <span class="md-body-2">{{ processedBlacklist.length }}</span>
          entries.
        </div>
        <div v-if="status === 'error'" style="flex-grow: 1">
          <md-icon class="failure-icon">close</md-icon>
          Failed to process this list!
        </div>
      </div>
    </md-dialog-content>
    <md-dialog-content v-else-if="activeTab === 'tab-url'">
      <div class="md-body-2">
        Set up a remote blacklist that will be grabbed regularly.
      </div>
      <div class="md-body-1 subbody" style="margin-bottom: 1em; max-width: fit-content">
        Enter a URL pointing to a blacklist file.
        If enabled, this URL will be retrieved once every hour in order to keep an updated blacklist at all times.
      </div>
      <md-switch class="md-primary" v-model="urlContinuous">
        Update blacklist hourly via this URL
      </md-switch>
      <md-field :class="{'md-invalid': !isUrlValid()}">
        <md-icon>link</md-icon>
        <label>Blacklist URL</label>
        <md-input
          v-model="blacklistUrl"
          @input="onTextChange"
        />
        <span class="md-error" v-if="!isUrlValid()">Must be a valid http(s) URL!</span>
      </md-field>
      <div class="md-body-1 text-status-container">
        <md-button
          class="md-primary"
          :disabled="!changes || !blacklistUrl.length || !isUrlValid()"
          @click="onApplyUrl"
        >
          <md-icon>check</md-icon>
          apply and test
          <md-tooltip>Apply and test the current URL to prepare it for saving</md-tooltip>
        </md-button>
        <div v-if="status === 'testing'" style="flex-grow: 1; display: flex; align-items: center">
          <md-progress-spinner :md-diameter="18" :md-stroke="2" md-mode="indeterminate" style="margin-right: 0.5em"/>
          testing...
        </div>
        <div v-if="status === 'processed'" style="flex-grow: 1">
          <md-icon class="success-icon" style="float: left; margin-right: 0.25em">check</md-icon>
          <div style="display: inline-block">
            Successfully processed and tested! <br/> found
            <span class="md-body-2">{{ remoteTestEntries }}</span>
            entries.
          </div>
        </div>
        <div v-if="status === 'error'" style="flex-grow: 1">
          <md-icon class="failure-icon">close</md-icon>
          Failed to process this list!
        </div>
      </div>
      <span style="color: #ff1744" v-if="error">
          There has been an error submitting this blacklist!
        </span>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button @click="close">
        cancel
      </md-button>
      <md-button class="md-primary" @click="updateAndClose" :disabled="!validate()">
        save
      </md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import { apibaseurl } from '@/config/variables'

export default {
  name: 'SinkholeBlacklistUpdateDialog',
  props: ['show'],
  data: () => ({
    activeTab: 'tab-manual',
    blacklistText: '',
    blacklistUrl: '',
    processedBlacklist: [],
    urlContinuous: false,
    status: null,
    changes: false,
    remoteTestEntries: 0,
    error: false
  }),
  methods: {
    resetState: function () {
      this.processedBlacklist = []
      this.blacklistText = ''
      this.blacklistUrl = ''
      this.changes = false
      this.status = null
      this.urlContinuous = false
    },
    close: function () {
      this.resetState()
      this.$emit('update:show', false)
    },
    validate: function () {
      if (this.activeTab === 'tab-url') {
        return this.status === 'processed' && this.isUrlValid()
      } else {
        return this.processedBlacklist.length > 0 && this.status === 'processed'
      }
    },
    updateAndClose: async function () {
      this.error = false
      if (this.activeTab !== 'tab-url') {
        try {
          const res = await fetch(`${apibaseurl}/sinkhole/blacklist`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ data: this.processedBlacklist })
          })
          if (res.status !== 200) {
            this.error = true
            return
          }
        } catch {
          this.error = true
          return
        }
      } else {
        try {
          const res = await fetch(`${apibaseurl}/sinkhole/blacklist`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: this.blacklistUrl, continuous: this.urlContinuous })
          })
          if (res.status !== 200) {
            this.error = true
            return
          }
        } catch {
          this.error = true
          return
        }
      }

      this.$emit('updated')
      this.close()
    },
    onTabChange: function (value) {
      this.activeTab = value
      this.resetState()
    },
    onFileUpload: function (files) {
      const fr = new FileReader()
      fr.onload = () => {
        this.processBlacklist(fr.result)
      }
      fr.onerror = () => {
        this.status = 'error'
      }
      fr.readAsText(files[0])
    },
    processBlacklist: function (text) {
      try {
        let processedList = []
        for (let line of text.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g)) {
          line = line.trim()
          if (line.length && !line.startsWith('#')) {
            processedList.push(line)
          }
        }
        this.processedBlacklist = processedList
        this.status = 'processed'
      } catch {
        this.status = 'error'
      }
    },
    onTextChange: function () {
      this.changes = true
      this.status = null
    },
    onApplyText: function () {
      this.changes = false
      this.processBlacklist(this.blacklistText)
    },
    isUrlValid: function () {
      if (!this.blacklistUrl.length) {
        return true
      }
      let url
      try {
        url = new URL(this.blacklistUrl)
      } catch {
        return false
      }
      return url.protocol === 'http:' || url.protocol === 'https:'
    },
    onApplyUrl: async function () {
      this.changes = false
      this.status = 'testing'
      try {
        let testRes = await ((await fetch(`${apibaseurl}/sinkhole/blacklist/test-url`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: this.blacklistUrl })
        })).json())
        if (!testRes.success) {
          this.status = 'error'
        } else {
          this.remoteTestEntries = testRes.entries
          this.status = 'processed'
        }
      } catch {
        this.status = 'error'
      }
    }
  }
}
</script>

<style scoped>

.subbody {
  opacity: 0.5;
}

.text-status-container {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
}

.success-icon {
  color: #30b375 !important;
}

.failure-icon {
  color: #ff5252 !important;
}

</style>
