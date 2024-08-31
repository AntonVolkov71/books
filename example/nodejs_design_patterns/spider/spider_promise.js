const utilities = require('./utilities')

const request = utilities.promisify(require('request'))
const mkdirp = utilities.promisify(require('mkdirp'))
const fs = require('fs')
const path = require('path')
const TaskQueue = require("./taskQueue");
const {getPageLinks, urlToFilename} = require("./utilities");
const readFile = utilities.promisify(require(fs.readFile))
const writeFile = utilities.promisify(require(fs.writeFile))

function download(url, filename) {
    console.log('Downloading', url)

    let body

    return request(url)
        .then(response => {
            body = response.body

            return mkdirp(path.dirname(filename))
        })
        .then(() => writeFile(filename, body))
        .then(() => {
            console.log('Downloaded and saved', url)

            return body
        })
}

const downloadQueue = new TaskQueue(2)

function spiderLinks(currentUrl, body, nesting) {
    if(nesting === 0) {
        return Promise.resolve()
    }

    const links = utilities.getPageLinks(currentUrl, body)

    links.map(link => spider(link, nesting - 1))

    return promise
}

const spiderind = new Map()

function spider(url, nesting) {
    if (spiderind.has(url)) {
        return process.nextTick()
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

                spiderLinks(url, body, nesting,)
            })
        }

        spiderLinks(url, body, nesting, callback)
    })
}

spider(process.argv[2], 1)
    .then(() => console.log('Download complete'))
    .catch(err => console.log(err));