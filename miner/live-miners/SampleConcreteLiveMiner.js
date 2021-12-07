import AbstractLiveMiner from './AbstractLiveMiner'

class SampleConcreteLiveMiner extends AbstractLiveMiner {
    constructor(collectorConnector) {
        super(collectorConnector)
    }

    setUp() {

    }

    startStreaming() {
        this.collectorConnector
    }
}

module.exports = SampleConcreteLiveMiner
