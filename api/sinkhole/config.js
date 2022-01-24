const fs = require('fs');
const path = require("path");
const dns = require('dns');
const { networkInterfaces } = require('os');
const Ajv = require("ajv");

const ajv = new Ajv();

const configSchema = {
    type: "object",
    properties: {
        dnsPort: {type: "integer"},
        sinkholeAddress: {type: "string"},
        mainDns: {type: "string"}
    },
    required: [],
    additionalProperties: false
};
const blacklistSchema = {
    "type": "array",
    "items": {
        "type": "string"
    }
};

const validateConfig = ajv.compile(configSchema);
const validateBlacklist = ajv.compile(blacklistSchema);

const configPath = path.resolve(__dirname, '../data/sinkhole/config.json');
const blacklistPath = path.resolve(__dirname, '../data/sinkhole/blacklist.json');
// this is just the first lan ipv4, however this might not always be what the user wants,
// but it should be fine for a default setting
const lanIP = Object.values(networkInterfaces()).flat().find(i => i.family == 'IPv4' && !i.internal).address;

const defaultConfig = {
    dnsPort: 5333,
    sinkholeAddress: lanIP,
    mainDns: dns.getServers()[0]
};

function loadConfig() {
    if (!fs.existsSync(configPath)) {
        fs.mkdirSync(path.dirname(configPath), {recursive: true});
        fs.writeFileSync(configPath, JSON.stringify(defaultConfig));
        return defaultConfig;
    }
    return JSON.parse(fs.readFileSync(configPath));
}

function saveConfig(config) {
    if (!validateConfig(config)) {
        throw validateConfig.errors;
    }
    if (!fs.existsSync(configPath)) {
        fs.mkdirSync(path.dirname(configPath), {recursive: true});
    }
    fs.writeFileSync(configPath, JSON.stringify(config));
}

function loadBlacklist() {
    if (!fs.existsSync(blacklistPath)) {
        fs.mkdirSync(path.dirname(blacklistPath), {recursive: true});
        fs.writeFileSync(blacklistPath, JSON.stringify([]));
        return [];
    }
    return JSON.parse(fs.readFileSync(blacklistPath));
}

function saveBlacklist(bl) {
    if (!validateBlacklist(bl)) {
        throw validateBlacklist.errors;
    }
    if (!fs.existsSync(blacklistPath)) {
        fs.mkdirSync(path.dirname(blacklistPath), {recursive: true});
    }
    fs.writeFileSync(blacklistPath, JSON.stringify(bl));
}

module.exports = {
    loadConfig,
    saveConfig,
    loadBlacklist,
    saveBlacklist
}