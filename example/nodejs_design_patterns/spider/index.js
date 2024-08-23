'use strict';

const request = require('request')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
const utilities = require('./utilities')

function spider(url, callback) {
    const filename = utilities.urlToFilename(url)

    fs.exists(filename, exists => {
        if (!exists) {
            request(url, (err, response, body) => {
                if (err) {
                    callback(err)
                } else {
                    console.log('body', body)
                    mkdirp(path.dirname(filename), err => {
                        if (err) {
                            callback(err)
                        } else {
                            fs.writeFile(filename, body, err => {
                                if (err) {
                                    callback(err)
                                } else {
                                    callback(null, filename, true)
                                }
                            })
                        }
                    })
                }
            })
        } else {
            callback(null, filename, false)
        }
    })
}

spider(process.argv[2], (err, filename, downloaded)=>{
    if(err){
        console.log('My Error:',err )
    } else if (downloaded){
        console.log('Compeleted download', filename )
    } else {
        console.log('already downloaded', filename )
    }
})

