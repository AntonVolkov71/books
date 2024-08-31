function Logger(name){
    console.log('name', name)
    this.name = name
}

Logger.prototype.log = function (message) {
    console.log('log:', message)
}

Logger.prototype.info = function (message) {
    console.log('info:', message)
}

Logger.prototype.verbose = function (message) {
    console.log('verbose:', message)
}

module.exports = Logger

/*
class Logger {
    constructor(name){
        this.name = name
    }

    log (message) {
        console.log('log:', message)
    }

    info (message) {
        console.log('info:', message)
    }

    verbose (message) {
        console.log('verbose:', message)
    }
}

module.exports = Logger
 */
