<template>
  <md-dialog
    :md-active="show"
    @md-closed="close"
    @md-clicked-outside="close"
    @md-opened="loadConfig"
    style="min-width: 30em"
  >
    <md-dialog-title>DNS Sinkhole Configuration</md-dialog-title>
    <md-dialog-content>
      <form novalidate>
        <md-field :class="{'md-invalid': !validateField('dnsPort')}">
          <label>DNS Port</label>
          <md-input
            name="dns-port"
            id="dns-port"
            v-model="form.dnsPort"
            :disabled="sending"
            type="number"
          />
          <span class="md-error" v-if="!validateField('dnsPort')">
            The DNS port must be a valid port number
          </span>
          <div>
            <md-icon style="display: block">information</md-icon>
            <md-tooltip>This sets the port the DNS Sinkhole server will be listening on.</md-tooltip>
          </div>
        </md-field>
        <md-field :class="{'md-invalid': !validateField('sinkholeAddress')}">
          <label>Sinkhole Address</label>
          <md-input
            name="sinkhole-address"
            id="sinkhole-address"
            v-model="form.sinkholeAddress"
            :disabled="sending"
          />
          <span class="md-error" v-if="!validateField('sinkholeAddress')">
            The sinkhole address must not be empty
          </span>
          <div>
            <md-icon style="display: block">information</md-icon>
            <md-tooltip>
              This is the address which is returned when a blacklist item has been matched.
              <br/>
              It is recommended to set this to an address that points to the host of the sinkhole
              and is reachable by most clients.
              <br/>
              (e.g. the same address that is used for DNS queries from the sinkhole)
            </md-tooltip>
          </div>
        </md-field>
        <md-field :class="{'md-invalid': !validateField('mainDns')}">
          <label>Main DNS Server</label>
          <md-input
            name="main-dns"
            id="main-dns"
            v-model="form.mainDns"
            :disabled="sending"
          />
          <span class="md-error" v-if="!validateField('mainDns')">
            The main DNS server must not be empty
          </span>
          <div>
            <md-icon style="display: block">information</md-icon>
            <md-tooltip>This is the DNS server used for all lookups by the sinkhole.</md-tooltip>
          </div>
        </md-field>
        <span style="color: #ff1744" v-if="error">
          There has been an error submitting this configuration!
        </span>
      </form>
    </md-dialog-content>
    <md-dialog-actions>
      <md-button @click="close">
        cancel
      </md-button>
      <md-button class="md-primary" @click="saveAndClose" :disabled="!validateForm()">
        save
      </md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import { apibaseurl } from '@/config/variables'

export default {
  name: 'SinkholeConfigDialog',
  props: ['show'],
  data: () => ({
    form: {
      dnsPort: 5333,
      sinkholeAddress: '',
      mainDns: ''
    },
    error: false,
    sending: false
  }),
  methods: {
    close: function () {
      this.$emit('update:show', false)
    },
    loadConfig: async function () {
      this.sending = true
      this.form = await (await fetch(`${apibaseurl}/sinkhole/config`, { credentials: 'include' })).json()
      this.sending = false
    },
    validateForm: function () {
      return this.validateField('dnsPort') &&
        this.validateField('sinkholeAddress') &&
        this.validateField('mainDns')
    },
    validateField: function (f) {
      switch (f) {
        case 'dnsPort':
          return !isNaN(this.form.dnsPort) && this.form.dnsPort > 9
        case 'sinkholeAddress':
          return this.form.sinkholeAddress.length > 0
        case 'mainDns':
          return this.form.mainDns.length > 0
        default:
          return false
      }
    },
    saveAndClose: async function () {
      this.sending = true
      this.error = false
      try {
        this.form.dnsPort = parseInt(this.form.dnsPort)
        const res = await fetch(`${apibaseurl}/sinkhole/config`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.form)
        })
        if (res.status !== 200) {
          this.error = true
        } else {
          this.$emit('submitted')
          this.close()
        }
      } catch {
        this.error = true
      }
      this.sending = false
    }
  }
}
</script>

<style scoped>
</style>
