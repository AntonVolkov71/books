const async = require('async')
const request = require("request");
const mkdirp = require("mkdirp");
const path = require("path");
const fs = require("fs");

function downloading(url, filename, callback) {
    console.log('Downloading', url)

    let body

    async.series([
            callback => {
                request(url, (err, response, resBody) => {
                    if (err) {
                        return callback(err)
                    }

                    body = resBody

                    callback()
                })
            },
            mkdirp.bind(null, path.dirname(filename)),
            callback => {
                fs.writeFile(filename, body, callback)
            }
        ], err => {
            if (err) {
                return callback(err)
            }

            console.log('Downloaded and saved ', url)

            callback(null, body)
        }
    )
}