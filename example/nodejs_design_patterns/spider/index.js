'use strict';

const request = require('request')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const utilities = require('./utilities')

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

function spider(url, callback) {
    const filename = utilities.urlToFilename(url)

    fs.exists(filename, exists => {
        if (exists) {
            return callback(null, filename, false)
        } else {
            download(url, filename, err=>{
                if(err){
                    return callback(err)
                }

                callback(null, filename, true)
            })
        }
    })
}

spider(process.argv[2], (err, filename, downloaded) => {
    if (err) {
        console.log('My Error:', err)
    } else if (downloaded) {
        console.log('Completed download', )
    } else {
        console.log('already downloaded', )
    }
})
