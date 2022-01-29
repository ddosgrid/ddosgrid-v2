import ipRegex from 'ip-regex';
import fetch from 'node-fetch';

const ipv4reg = ipRegex({exact: true, includeBoundaries: true});

const sortBlacklist = (bl) => {
    const result = {
        domains: new Set(),
        addresses: new Set()
    };

    for (let e of bl) {
        if (ipv4reg.test(e)) {
            result.addresses.add(e);
        } else {
            result.domains.add(e);
        }
    }

    return result;
};

const getRawBlacklistFromText = (text) => {
    let processedList = []
    for (let line of text.split(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g)) {
        line = line.trim()
        if (line.length && !line.startsWith('#')) {
            processedList.push(line)
        }
    }
    return processedList
};

const getRawBlacklistFromUrl = async (url) => {
    let testRes = await ((await fetch(url)).text())
    return getRawBlacklistFromText(testRes)
};

export default {
    sortBlacklist,
    getRawBlacklistFromUrl
};