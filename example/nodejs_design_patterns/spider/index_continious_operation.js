'use strict';

const request = require('request')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const {getPageLinks,urlToFilename} = require('./utilities')

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

function spiderLinks(currentUrl, body, nesting, callback) {
    if(nesting === 0) {
        return process.nextTick(callback);
    }

    let links = getPageLinks(currentUrl, body);  //[1]
    function iterate(index) {
        if(index === links.length) {
            return callback();
        }

        spider(links[index], nesting - 1, function(err) {
            if(err) {
                return callback(err);
            }
            iterate(index + 1);
        });
    }
    iterate(0);
}


function spider(url, nesting, callback) {
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

spider(process.argv[2], (err, filename, downloaded) => {
    if (err) {
        console.log('My Error:', err)
    } else if (downloaded) {
        console.log('Completed download',)
    } else {
        console.log('already downloaded',)
    }
})

