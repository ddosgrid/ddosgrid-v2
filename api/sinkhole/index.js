const {Router} = require('express')
const bodyParser = require('body-parser')
const {protect} = require('../auth/index')
const {Sinkhole} = require('./sinkhole')
const config = require('./config')
const blacklist = require("./blacklist");

let blacklistInterval = null
let currentConfig = config.loadConfig()
// TODO: look into whether loading blacklists into memory is a bad idea, or if it's the only good idea...
let currentBlacklist = config.loadBlacklist()
let sinkhole = new Sinkhole({
    ...currentConfig,
    blacklist: currentBlacklist.data
})
updateBlacklistInterval()
const router = Router()

router.get('', protect, getSinkholeStatus)
router.get('/config', protect, getSinkholeConfig)
router.post('/config', protect, bodyParser.json(), setSinkholeConfig)
router.get('/blacklist', protect, getSinkholeBlacklist)
router.post('/blacklist', protect, bodyParser.json(), setSinkholeBlacklist)
// note: this could be misused for SSRF, thus it's also protected
// (but is still vulnerable against attacks by authenticated users)
router.post('/blacklist/test-url', protect, bodyParser.json(), testBlacklistUrl)
router.post('/start', protect, startSinkhole)
router.post('/stop', protect, stopSinkhole)

async function getSinkholeStatus(req, res) {
    let config = sinkhole.getConfig()
    let changed = (JSON.stringify(config) !== JSON.stringify(currentConfig))
    return res.json({
        running: sinkhole.isRunning(),
        ...config,
        blacklistEntries: currentBlacklist.data.length,
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
    let candidate;
    if (req.body.data) {
        candidate = req.body.data
        currentBlacklist.mode = 'manual'
        currentBlacklist.url = null
    } else if (req.body.url) {
        try {
            candidate = await blacklist.getRawBlacklistFromUrl(req.body.url)
            currentBlacklist.url = req.body.url
            if (req.body.continuous) {
                currentBlacklist.mode = 'auto'
            } else {
                currentBlacklist.mode = 'manual'
            }
        } catch {
            return res.sendStatus(500);
        }
    } else {
        return res.sendStatus(400);
    }

    updateBlacklistInterval()

    try {
        config.saveBlacklist({...currentBlacklist, data: candidate})
        currentBlacklist.data = candidate
        sinkhole.updateBlacklist(candidate)

        // sending back the entire blacklist is potentially a bad idea
        return res.send("blacklist updated successfully!")
    } catch {
        return res.sendStatus(400)
    }
}

async function testBlacklistUrl(req, res) {
    if (!req.body.url)
        return res.sendStatus(400)
    try {
        let rawList = await blacklist.getRawBlacklistFromUrl(req.body.url)
        return res.json({success: true, entries: rawList.length})
    } catch {
        return res.json({success: false})
    }
}

async function startSinkhole(req, res) {
    // if sinkhole is already running, we do nothing,
    // but still return 200 and the current status
    if (!sinkhole.isRunning()) {
        sinkhole = new Sinkhole({
            ...currentConfig,
            blacklist: currentBlacklist.data
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

function updateRemoteBlacklist() {
    try {
        let candidate = blacklist.getRawBlacklistFromUrl(currentBlacklist.url)
        config.saveBlacklist({...currentBlacklist, data: candidate})
        currentBlacklist.data = candidate
        sinkhole.updateBlacklist(candidate)
        console.log("successfully updated blacklist from url!")
    } catch {
        console.warn("failed to update blacklist from url!")
    }
}

function updateBlacklistInterval() {
    if (blacklistInterval) {
        clearInterval(blacklistInterval)
    }
    if (currentBlacklist.mode === 'auto') {
        blacklistInterval = setInterval(() => updateRemoteBlacklist(), 1000 * 60 * 60)
    }
}

module.exports = router