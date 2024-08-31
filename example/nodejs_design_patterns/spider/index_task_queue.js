'use strict';

const request = require('request')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const {getPageLinks, urlToFilename} = require('./utilities')
const TaskQueue = require('./taskQueue')

function saveFile(filename, content, callback) {
    mkdirp(path.dirname(filename), err => {
        if (err) {
            return callback(err)
        }

        fs.writeFile(filename, content, callback)
    })
}

function download(url, filename, callback) {
    console.log('Downloading', url)
    request(url, (err, response, body) => {
        if (err) {
            callback(err)
        } else {
            saveFile(filename, body, err => {
                if (err) {
                    return callback(err)
                }

                console.log('Downloaded and saved:', url)

                callback(null, body)
            })
        }
    })
}

const downloadQueue = new TaskQueue(2)

function spiderLinks(currentUrl, body, nesting, callback) {
    if (nesting === 0) {
        return process.nextTick(callback);
    }

    const links = getPageLinks(currentUrl, body);  //[1]

    if (links.length === 0) {
        return process.nextTick(callback);
    }

    let completed = 0
    let hasErrors = false

    links.forEach(link => {
        downloadQueue.pushTask(done => {
            spider(link, nesting - 1, err => {
                if (err) {
                    hasErrors = true
                    return callback(err)
                }

                if (++completed === link.length && !hasErrors) {
                    callback()
                }

                done()
            })
        })
    })
}

const spiderind = new Map()

function spider(url, nesting, callback) {
    if (spiderind.has(url)) {
        return process.nextTick(callback)
    }

    spiderind.set(url)
    const filename = urlToFilename(url)

    fs.readFile(filename, 'utf8', (err, body) => {
        if (err) {
            if (err.code !== 'ENOENT') {
                return callback(null, filename, false)
            }

            return download(url, filename, (err, body) => {
                if (err) {
                    return callback(err)
                }

                spiderLinks(url, body, nesting, callback)
            })
        }

        spiderLinks(url, body, nesting, callback)
    })
}

spider(process.argv[2], 1, (err, filename, downloaded) => {
    if (err) {
        console.log('My Error:', err)
    } else if (downloaded) {
        console.log('Completed download',)
    } else {
        console.log('already downloaded',)
    }
})

