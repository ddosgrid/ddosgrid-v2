<template>
  <div>
    <div class="howto">
      <section class="general about-item">
        <md-card>
          <md-card-header style="text-align: center;">
            <h1>Welcome to the DDoSGrid project</h1>
          </md-card-header>
          <md-card-content>
            <div class="main-icon-wrapper">
              <img src="img/multiline_chart-24px.svg" class="main-icon">
            </div>
            <div class="authActions">
              <md-button v-if="this.$store.state.authenticated" class="md-raised md-primary" href="datasets">
                <md-icon>arrow_right_alt</md-icon><span>Get Started</span>
              </md-button>
              <md-button v-else class="md-raised md-accent" :href="authurl">
                <md-icon>login</md-icon> <span> Log In</span>
              </md-button>
            </div>
            <span class="section-text">
              DDoSGrid is an open platform aiming at making feature extraction and visualization from PCAP files easier. This platform was developed in the scope of a master project at the Communication Systems Group at the University of Zurich.
            </span>
            <div class="logo-wrapper">
              <a href="https://csg.uzh.ch" target="_blank" rel="noreferrer">
                <img src="img/logos/csg.png" class="logo">
              </a>
              <a href="https://uzh.ch" target="_blank" rel="noreferrer">
                <img src="img/logos/uzh.png" class="logo">
              </a>
            </div>
          </md-card-content>
        </md-card>
      </section>
      <section class="uploading about-item slidefromleft">
        <md-card>
            <md-card-header>
              <div class="md-title">Upload and analyse PCAP files</div>
            </md-card-header>
            <md-card-content>
            <img id="analysis-icon" src="img/search-24px.svg">
          <span class="section-text">
            <p>DDoSGrid uses PCAP files as input because they are not oriented towards a specific protocol or model (compared to for example flow-based capture files). DDoSGrid provides the following features for feature extraction using PCAP files:</p>
            <ul class="no-list-style">
              <li>Efficiently Decoding and parsing packets from pcap files</li>
              <li>Receive packets from different layers using an Observer-style API using the <a href="https://nodejs.org/api/events.html">EventEmitter</a> class in NodeJS. This allows for a performant, stream-processing based implementation that feels natural to work with.</li>
              <li>Abstract views based on (OSI) layers and concrete views on specific protocols. For example, simply register an observer for all abstract "transport-level packets" or observe a concrete protocol, for example UDP.</li>
              <li>Supports easy extension by running multiple feature miners independently of each other using the same decoding stream.</li>
              <li>Orchestrates asynchronous operations in different parts of the lifecycle of your feature miners. For example, you can load an in-memory database in one miner and connect to a database through a socket in another miner.</li>
            </ul>
            <p>Using PCAP files as input allows you to analyse from the following sources:
              <ul>
                <li>Packet capture software like Wireshark and tcpdump</li>
                <li>Projects collecting DDoS attacks such as <a href="https://ddosdb.org">DDoSDB</a></li>
                <li>Attack simulators such as DDoS_log_sim</li>
              </ul>
            </p>
            <p></p>
            <p></p>
          </span>
            <div style="clear: both"></div>
          </md-card-content>
        </md-card>
      </section>
      <div class="dashboards about-item slidefromright">
        <md-card>
          <md-card-header>
            <div class="md-title">Creating your dashboard</div>
          </md-card-header>
          <md-card-content>
            <img id="chart-icon" src="img/show_chart-24px.svg">
            <p class="section-text">
            You can leverage all existing visualizations by simply doing the visual transformation required for a specific diagram and labeling your output. Your result will then automatically be served, grouped based on attack type and rendered using the appropriate diagram. For example, to render your results on a Scatterplot you would define two resulting Arrays for the x and y axis and describe the type of attack.
            Of course you can also write custom visualizations by writing it from scratch or by wrapping an existing chart.js visualization. Once your diagrams are registered you can create a dashboard by opening a dataset and the diagrams you are interested in. The final dashboard can be exported to PNG, PDF and it can be saved for later editing.
            </p>
            <div style="clear: both"></div>
          </md-card-content>
        </md-card>
      </div>
      <section class="dev about-item slidefromleft">
        <md-card>
            <md-card-header>
              <div class="md-title">Implement your own analysis</div>
            </md-card-header>
            <md-card-content>
              <img class="left" id="github-icon" src="img/github.svg">
              <p class="section-text" id="github-text">
              Writing your own feature miner is easy and can be done in a matter of minutes.
              Ready to write and integrate your own feature miner? Head over to our GitHub repository.
              </p>
              <div style="clear: both"></div>
              <div class="github-link-wrapper">
                <md-button class="md-raised md-accent" href="https://github.com/ddosgrid/ddos-visualization">
                  GitHub
                </md-button>
              </div>
          </md-card-content>
        </md-card>
      </section>
    </div>
    <md-snackbar :md-position="position" :md-duration="7000" :md-active.sync="showSnackbar" md-persistent>
      <span>{{ snackbarMsg}}</span>
      <md-button class="md-primary" :href="authurl">Login</md-button>
    </md-snackbar>
  </div>
</template>

<script>
import { apibaseurl } from '@/config/variables.js'

export default {
  data: function () {
    return {
      authurl: `${apibaseurl}/auth/provider/`,
      showSnackbar: false,
      snackbarMsg: 'The action you are trying to perform requires authentication'
    }
  },
  name: 'LandingPage',
  mounted: function () {
    window.th = this
    if ('authprevented' in this.$route.query) {
      this.showSnackbar = true
    }
  }
}
</script>

<style scoped>
.howto {
  max-width: 960px;
  margin: auto;
}
.about-item {
  padding: 32px 24px 0px 24px;
  box-sizing: border-box;
}
.howto:last-child {
  padding-bottom: 32px;
}
section {
  display: block;
}
.icon {
  height: 22px !important;
  filter: invert(100%);
  padding-right: 5px;
}
#chart-icon {
  height: 200px !important;
  float: right;
  shape-outside: polygon(182px 13px, 115px 79px, 77px 50px, -12px 139px, 20px 177px, 82px 124px, 114px 163px, 183px 91px, 192px 28px);
}
#github-icon {
  height: 80px !important;
  shape-outside: circle(55px at 42px 33px);
  margin: 0 20px 20px 0px;
}
#analysis-icon {
  float: left;
  height: 200px !important;
  margin: 0 20px 20px 0px;
  shape-outside: polygon(143px 38px, 104px 11px, 2px 1px, 0px 128px, 148px 186px, 176px 181px, 189px 157px, 152px 105px, 158px 72px);
}
.main-icon-wrapper {
  height: 200px;
  text-align: center;
}
.main-icon {
  height: 100% !important;
  margin: auto;
}
.left {
  float: left !important;
}
.github-link-wrapper {
  text-align: center;
}
.slidefromleft {
  animation-duration: 1s;
  animation-name: slideinfromleft;
}
.slidefromright {
  animation-duration: 1s;
  animation-name: slideinfromright;
}
@keyframes slideinfromright {
  from {
    transform: translate(-15%, 0);
  }

  to {
    transform: translate(0, 0);
    margin-left: 0%;
  }
}

@keyframes slideinfromleft {
  from {
    transform: translate(15%, 0);
  }

  to {
    transform: translate(0, 0);
    margin-left: 0%;
  }
}
.logo-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}
.logo {
  height: 3em;
}
ul {
}
.no-list-style {
  list-style: none;
  padding-left: 0px;
}
.no-list-style > li {
  margin-bottom: 10px;
}
@media only screen and (max-width: 600px) {
  #analysis-icon, #chart-icon {
    float: none;
    display: block;
    margin: 0 auto;
  }
}
.authActions {
  text-align:center;
  margin-bottom: 20px;
}
.authActions span {
  margin: 0 5px;
}
</style>
