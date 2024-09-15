function asyncDivision(dividend, divisor, cb) {
    return new Promise((resolve, reject) => {
        process.nextTick(() => {
            const result = dividend / divisor

            if (isNaN(result) || (!Number.isFinite(result))) {
                const error = new Error("Invalid operands")

                if (cb) {
                    return cb(error)
                }

                return reject(error)
            }

            if (cb) {
                return cb(null, result)
            }

            resolve(result)
        })
    })
}

function cb(err, result) {
    if (err) {
        console.log('error', err)
    }

    console.log('res', result)
}

asyncDivision(0, 0, cb)
asyncDivision(2, 2)
    .then(console.log)
    .catch(console.log)

