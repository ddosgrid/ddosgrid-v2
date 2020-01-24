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
              <img src="/img/multiline_chart-24px.svg" class="main-icon">
            </div>
            <span class="section-text">
             Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc hendrerit tempor metus. In hac habitasse platea dictumst. Morbi nulla nunc, tincidunt eu euismod maximus, placerat ut justo. Phasellus commodo ante dignissim felis commodo molestie. Nunc sit amet laoreet massa, at vehicula augue. Proin vehicula nibh sed diam sodales, non molestie elit dignissim.
            </span>
          </md-card-content>
        </md-card>
      </section>
      <section class="uploading about-item slidefromleft">
        <md-card>
            <md-card-header>
              <div class="md-title">Upload and analyse PCAP files</div>
            </md-card-header>
            <md-card-content>
            <img id="analysis-icon" src="/img/search-24px.svg">
          <span class="section-text">
           Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc hendrerit tempor metus. In hac habitasse platea dictumst. Morbi nulla nunc, tincidunt eu euismod maximus, placerat ut justo. Phasellus commodo ante dignissim felis commodo molestie. Nunc sit amet laoreet massa, at vehicula augue. Proin vehicula nibh sed diam sodales, non molestie elit dignissim.
           Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
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
            <img id="chart-icon" src="/img/show_chart-24px.svg">
            <p class="section-text">
            Duis luctus egestas eros, in ornare lacus tincidunt quis. In justo purus, semper a sodales vel, auctor id est. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc et viverra sapien, in interdum risus. Nam imperdiet varius risus, eget mattis justo posuere eu.
            Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.
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
              <img class="left" id="github-icon" src="/img/github.svg">
              <p class="section-text" id="github-text">
              Writing your own feature miner is easy and can be done in A MATTER OF MINUTES. DDoSGrid decodes all packets in your PCAP files and allows you to observe specific packets.
              Ready to write and integrate your own feature miner? Head over to our GitHub repository!
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
  </div>
</template>

<script>
export default {
  name: 'LandingPage'
}
</script>

<style scoped>
.howto {
  max-width: 960px;
  margin: auto;
}
.about-item {
  padding: 32px 24px 0px 24px;
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
</style>
