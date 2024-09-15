// Обратное давление
const Chance = require('chance')
const chance = new Chance()

require('http').createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'})


    function generateMore() {
        while (chance.bool({likelihood: 95})) {
            let shouldContinue = res.write(chance.string({length: (16 * 1024) - 1}))
            if (!shouldContinue) {
                console.log('Backpressure',)

                return res.once('drain', generateMore)
            }
            res.write(chance.string() + '\n')
        }
    }

    generateMore()
    res.end('\nThe end...\n')
})
    .listen(3000, () => console.log('Server listening :3000'))