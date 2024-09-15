const stream = require('stream')
const Chance = require('chance')

const chance = new Chance()

class RandomStream extends stream.Readable {
    /*
        options {
        encoding: Buffer -> String
        objectMode: флаг включения объектного режима, default FALSE
        highWaterMark: макс объем хранения в буфере (default 16КБ)
        }
     */
    constructor(options) {
        super(options);
    }

    _read(size) {
        const chunk = chance.string() // создает случайную строку
        console.log('Pushing chunk of size', chunk.length)

        this.push(chunk, 'utf8') // помещаем строку в буфер для чтения

        if (chance.bool({likelihood: 5})) { // завершаем поток с 5% вероятностью
            this.push(null)
        }
    }
}

module.exports = RandomStream