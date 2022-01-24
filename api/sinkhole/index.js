const {Router} = require('express')
const bodyParser = require('body-parser')
const {protect} = require('../auth/index')
const {Sinkhole} = require('./sinkhole')
const config = require('./config')

let currentConfig = config.loadConfig()
// TODO: look into whether loading blacklists into memory is a bad idea, or if it's the only good idea...
let currentBlacklist = config.loadBlacklist()
let sinkhole = new Sinkhole({
    ...currentConfig,
    blacklist: currentBlacklist
})
const router = Router()

router.get('', protect, getSinkholeStatus)
router.get('/config', protect, getSinkholeConfig)
router.post('/config', protect, bodyParser.json(), setSinkholeConfig)
router.get('/blacklist', protect, getSinkholeBlacklist)
router.post('/blacklist', protect, bodyParser.json(), setSinkholeBlacklist)
router.post('/start', protect, startSinkhole)
router.post('/stop', protect, stopSinkhole)

async function getSinkholeStatus(req, res) {
    let config = sinkhole.getConfig()
    let changed = (JSON.stringify(config) !== JSON.stringify(currentConfig))
    return res.json({
        running: sinkhole.isRunning(),
        ...config,
        blacklistEntries: currentBlacklist.length,
        configChanged: changed
    })
}

async function getSinkholeConfig(req, res) {
    return res.json(currentConfig)
}

async function setSinkholeConfig(req, res) {
    let candidate = {
        ...currentConfig,
        ...req.body
    }
    try {
        config.saveConfig(candidate)
        currentConfig = candidate
        return res.json(currentConfig)
    } catch (e) {
        res.sendStatus(400);
    }
}

async function getSinkholeBlacklist(req, res) {
    return res.json(currentBlacklist)
}

async function setSinkholeBlacklist(req, res) {
    let candidate = req.body
    try {
        config.saveBlacklist(candidate)
        currentBlacklist = candidate
        // sending back the entire blacklist is potentially a bad idea
        return res.send("blacklist updated successfully!")
    } catch {
        res.sendStatus(400);
    }
}

async function startSinkhole(req, res) {
    // if sinkhole is already running, we do nothing,
    // but still return 200 and the current status
    if (!sinkhole.isRunning()) {
        sinkhole = new Sinkhole({
            ...currentConfig,
            blacklist: currentBlacklist
        })
        await sinkhole.start()
    }
    return await getSinkholeStatus(req, res)
}

async function stopSinkhole(req, res) {
    // if sinkhole is already stopped, we do nothing,
    // but still return 200 and the current status
    if (sinkhole.isRunning()) {
        await sinkhole.stop()
    }
    return await getSinkholeStatus(req, res)
}

module.exports = router