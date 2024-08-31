const Chance = require('chance')
const chance = new Chance()

require('http').createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'})

    while (chance.bool({likelihood: 95})) {
        res.write(chance.string() + '\n')

    }

    res.end('\nThe end...\n')
    res.on('finish', () => console.log('All data was sent'))
})
    .listen(3000, () => console.log('Server listening :3000'))