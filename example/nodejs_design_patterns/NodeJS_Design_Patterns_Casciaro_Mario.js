const fs = require('fs')
const path = require('path')
const zlib = require('zlib');
const http = require('http');
const crypto = require('crypto')
const Chance = require('chance')
const RandomStream = require('./data_streams/ReadStream')
const ToFileStream = require('./data_streams/stream_for_writable')

// const logger = require("./logger");
// const loggerModule = require("./loggerModule");
// const loggerConstructor = require("./loggerConstructor");
// const loggerHowSingleton = require("./loggerHowSingleton");
// const {Logger} = require("./loggerHowSingleton")
// const EventEmitter = require('events').EventEmitter
/*
{
    // Замыкание
    function init(surname) {
        function displayName(name) {
            console.log(surname + ' ' + name)
        }

        return displayName
    }

    const surnameVolkov = init('Volkov')

    const inna = surnameVolkov.bind(surnameVolkov, 'Inna')
    surnameVolkov('Anton')
    surnameVolkov('Diana')

    inna()
}
*/
/*
{
    // Синхронность
    function add(a, b, callback) {
        callback(a + b)
    }

    console.log('before',)
    add(1, 2, res => console.log('res', res))
    console.log('after',)
}
*/
/*
{

    // Асинхронность
    console.log('',)

    function additionAsync(a, b, callback) {
        setTimeout(() => callback(a + b))
    }

    console.log('before',)
    additionAsync(1, 2, res => console.log('res', res))
    console.log('after',)
    console.log('after2',)
    console.log('after3',)
}
*/
/*
{
    // Непредсказуемая функция
    console.log('',)
    const cache = {}

    function inconsistentRead(filename, callback) {
        if (cache[filename]) {
            callback(cache[filename]) // синхронная
        } else {
            // асинхронная
            fs.readFile(filename, 'utf8', (err, data) => {
                cache[filename] = data
                callback(data)
            })
        }
    }

    const file = 'test.txt'
    inconsistentRead(file, res => console.log('res', res))

    // иначе cache еще будет пустой fs.readFile - асинхронная и будет вызвана после callback
    setTimeout(() => {
        inconsistentRead(file, res => console.log('res', res))
    })

    // Использование неправильной функции
    function createFileReader(filename) {
        const listeners = []

        inconsistentRead(filename, value => {
            listeners.forEach(listener => listener(value))
        })

        return {
            onDataReady: listener => listeners.push(listener)
        }
    }

    const reader1 = createFileReader(file)

    reader1.onDataReady(data => {
        console.log('First call data:', data)

        const reader2 = createFileReader(file)

        // так как внутренний вызов reader2 синхронный, но обработчик не зарегистрируется?!
        // и не будут вызваны
        reader2.onDataReady(data => {
            console.log('Second call data', data)
        })
    })
}
*/
/*
{
    // Синхронное использование, Прямой стиль

    const cache = {}

    function consistentReadSync(filename){
        if(cache[filename]){
            return cache[filename]
        } else {
            cache[filename] = fs.readFileSync(filename, 'utf8') // Синхронная
            return cache[filename]
        }
    }
}
*/
/*
{
    // Асинхронный стиль
    const  cache = {}

    function consistentReadASync(filename, callback){
        if(cache[filename]){
            // Добавляем асинхронность добавляем операцию в цикл события
            // а не возвращаем сразу
            process.nextTick(()=> callback(cache[filename]))
        } else {
            fs.readFile(filename, 'utf8', (err, data)=>{
                cache[filename] = data

                callback(data)
            })
        }
    }
}
*/
/*
{
    // Не перехваченные ошибки
    function readJSONThrows(filename, callback) {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                return callback(err)
            }

            // let parsed;
            //
            // try {
            //     parsed = JSON.parse(data)
            // } catch (e) {
            //    return callback(e)
            // }

            callback(null, JSON.parse(data))
        })
    }

    readJSONThrows('test.txt', (err => console.log('CATCH ERROR:', err)))

    // можно перехватить в цикле событий через событие 'uncaughtException'
    process.on('uncaughtException', err=>{
        console.log('My catch error:', err.message )
        process.exit(1)
    })
}
*/
/*
{
    // Экспорт ограниченной области видимости модуля
    const module = (() => {
        const privateFoo = () => {
        }
        const privateBar = []

        const exported = {
            publicFoo: () => {
            },
            publicBar: () => {
            }
        }

        return exported
    })

    console.log('module', module())
}
*/
/*
{
    // Самодельный модуль ПЛОХОЙ вариант
    function loadModule(filename, module, require){
        const wrappedSrc= `(function(module, exports, require){
        ${fs.readFileSync(filename, 'utf8')}
        })(module, module.exports, require);`

        eval(wrappedSrc)
    }

   ( function test(name){
        console.log('name', name)
    })('hello')
}
*/
/*
{
    // Require самодельный Синхронный
    function loadModule(filename, module, require){
        const wrappedSrc= `(function(module, exports, require){
        ${fs.readFileSync(filename, 'utf8')}
        })(module, module.exports, require);`

        eval(wrappedSrc)
    }

    const require = (moduleName)=>{
        console.log('Require invoked for module', moduleName )
        const id  = require.resolve(moduleName)

        if(require.cache[id]){
            return require.cache[id].exports
        }

        // метаданные модуля
        const module = {
            exports:{},
            id: id
        }

        // пополнить кеш
        require.cache[id] = module

        // загрузить модуль
        loadModule(id, module, require)

        return module.exports
    }
    
    require.cache={}
    require.resolve=(moduleName)=>{
        console.log('extracting  ID', )

        return moduleName
    }
}
*/
/*
{
    // Именованный экспорт

    logger.info('message for info')
    logger.verbose('message for verbose')
    console.log('', )
    loggerModule('message for info')
    loggerModule.verbose('message for verbose')
}
*/
/*
{
    // Экспорт конструктора
    const dbLogger = new loggerConstructor('DB')
    dbLogger.info('DB message for info')

    const accessLogger = new loggerConstructor('ACCESS')
    accessLogger.verbose('ACCESS message for verbose')
}
*/
/*
{
    // Экспорт конструктора Singleton
    loggerHowSingleton.log('message for log')

    const otherLoggerHowSingleton = new Logger('Other')
    otherLoggerHowSingleton.log('Message for other log')
}
 */

/*
{
    // Простая реализация функции с EventEmitter
    function findPattern(files, regex) {
        const emitter = new EventEmitter()

        files.forEach(function (file) {
            fs.readFile(file, 'utf8', (err, content) => {
                if (err) {
                    return emitter.emit('error', err)
                }

                emitter.emit('fileread', file)

                let match;

                if (match = content.match(regex)) {
                    match.forEach(elem => emitter.emit('found', file, elem))
                }
            })
        })

        return emitter
    }

    findPattern(
        ['fileA.txt', 'fileB.json'],
        /hello/g
    )
        .on('fileread', file => console.log(file, 'was read'))
        .on('found', (file, match) => console.log('matched', match, 'in file', file))
        .on('error', err => console.log('Error My:', err))
}
 */
/*
{
    // EventEmitter реализация своего класса
    class FindPattern extends EventEmitter {
        constructor(regex) {
            super();
            this.regex = regex
            this.files = []
        }

        addFile(file) {
            this.files.push(file)
            return this
        }

        find() {
            this.files.forEach(file => {
                fs.readFile(file, 'utf8', (err, content) => {
                    if (err) {
                        return this.emit('error', err)
                    }

                    this.emit('fileread', file)

                    let match;

                    if (match = content.match(this.regex)) {
                        match.forEach(elem => this.emit('found', file, elem))
                    }
                })
            })

            return this
        }
    }

    const findPatternObject = new FindPattern(/hello/g)
    findPatternObject
        .addFile('fileA.txt')
        .addFile('fileB.json')
        .find()
        .on('fileread', file => console.log(file, 'was read'))
        .on('found', (file, match) => console.log('matched', match, 'in file', file))
        .on('error', err => console.log('Error My:', err))
}
 */
/*
{
    // Синхронное события
    class SyncEmit extends EventEmitter {
        constructor() {
            super();
            this.emit('ready')
        }
    }

    const syncEmit = new SyncEmit()

    // обработчик регистрируется после отправки события
    // НЕ ОТРАБОАТАЕТ
    syncEmit.on('ready', ()=> console.log('Object is ready'))
}
 */

/*
{
    // EventEmitter and callback
    function helloEvents() {
        const emitter = new EventEmitter()

        setTimeout(() =>
                emitter.emit('hello', 'hello from emitter'),
            100
        )

        return emitter
    }

    function helloCallback(callback) {
        setTimeout(() => callback('hello fom callback'), 99)
    }

    helloEvents()
        .on('hello', res => console.log(res))

    helloCallback(res => console.log(res))
}
 */
/*
{
    // Совместное использование EventEmitter & callback
    // где (error, files)=> ) обратный вызов
    glob('file/*.txt', (error, files)=> console.log('All files found', JSON.stringify(files)))
        .on('match', match => console.log('Match found', match))
}
*/
/*
{
  // АД последовательных вызовов

    function asyncOperation(callback) {
        process.nextTick(callback);
    }

  function task1(callback){
      asyncOperation(()=>{
          task2(callback)
      })
  }

    function task2(callback){
        asyncOperation(()=>{
            task3(callback)
        })
    }

    function task3(callback){
        asyncOperation(()=>{
            callback()
        })
    }
    
    task1(()=>{
        console.log('task 1 2 3', )
    })
}

 */
/*
{
    // Promise
    const isErr = true
   function asyncOperation(){
       return new Promise((res, rej)=>{
           if(!isErr){
               return rej('errorororo')
           }
           res('success')
       })
   }

   asyncOperation()
       .then(res=> console.log(res), err=> console.log(err))
}

 */

/*
{
    // Semi-coroutines
    function* fruitGenerator(){
        console.log('before yield', )
        yield 'apple'

        console.log('after apple', )
        yield 'orange'
        return 'watermelon'

    }

    const gen = fruitGenerator()

    console.log('gen', gen.next())
    console.log('gen', gen.next())
    console.log('gen', gen.next())
    console.log('gen', gen.next())



   // gen { value: 'apple', done: false }
   // gen { value: 'orange', done: false }
   // gen { value: 'watermelon', done: true }
   // gen { value: 'undefined', done: true }
}
*/
/*
{
    // Генератор в роли итератора
    function* iteratorGenerator(arr) {
        for (let i = 0; i < arr.length; i++) {
            yield arr[i]
        }
    }

    const iterator = iteratorGenerator([
        'apple', 'orange', 'watermelon'
    ])

    let currentItem = iterator.next()

    while (!currentItem.done){
        console.log(currentItem.value )

        if(currentItem.value === 'orange'){
            console.error('error')
            break
        }

        currentItem = iterator.next()
    }

    console.log('before while', currentItem )
}
*/
/*
{
    // Передача значение обратно в генератор
    function* twoWayGenerator() {
        const what = yield null

        console.log('Hello', what.first)
        console.log('Hello', what.second)
    }

    const gen = twoWayGenerator()
    gen.next() // захватили переменную what
    // gen.throw(new Error('текст ошибки'))
    gen.next({first: 'Anton', second: 'Volkov'}) // далее аргументом значение

    // Hello Anton
    // Hello Volkov
}

 */
/*
{
    // Асинхронное выполенние с  генератором

    function asyncFlow(generatorFunction) {
        function callback(err) {
            if (err) {
                return generator.throw(err)
            }

            const results = [].slice.call(arguments, 1)

            generator.next(results.length > 1 ? results : results[0])
        }

        const generator = generatorFunction(callback)

        generator.next()
    }


    asyncFlow(function* (callback) {
        const fileName = path.basename(__filename)
        const myself = yield fs.readFile(fileName, 'utf8', callback)
        yield fs.writeFile(`clone_of_${fileName}`, myself, callback);
        console.log('clone created',)
    })
}

 */
/*
{
    // Сжатие при использовании буферизующего API
    const file = 'C:\\Users\\volko\\Documents\\приложения с git\\books\\files\\Шаблоны проектирования Node.js. Каскиаро, Маммино.pdf'

    console.log('before zip', )
    fs.readFile(file, (err, buffer)=>{
        console.log('readfile success', )
        zlib.gzip(buffer, (err, buffer)=>{
            fs.writeFile(file +'.gz', buffer, err=>{
                console.log('File successfully compressed', )
            })
        })
    })

    console.log('after zip', )
}

 */
/*
{
    // Сжатие с потоком данных
    const file = 'test.txt'
    fs.createReadStream(file)
        .pipe(zlib.createGzip())
        .pipe(fs.createWriteStream(file + '.gz'))
        .on('finish', ()=> console.log('File successfully compressed'))
}

 */

/*
{
    // Клиент отправки файла на сервер используя потоки
    const file = 'test.txt'
    const server = 'localhost'

    const options = {
        hostname: server,
        port: 3000,
        path: '/',
        method: 'PUT',
        headers: {
            filename: path.basename(file),
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'gzip'
        }
    }

    const req = http.request(options, res => {
        console.log('Server response', res.statusCode)
    })

    fs.createReadStream(file)
        .pipe(zlib.createGzip(file))
        .pipe(crypto.createCipher('aes192', 'a_shared_secret'))
        .pipe(req)
        .on('finish', () => {
            console.log('File successfully sent',)
        })
}

 */

/*
{
    // Реализация потока чтения
    const randomStream = new RandomStream()

    randomStream
        .on('readable', () => {
            let chunk

            while ((chunk = randomStream.read()) !== null) {
                console.log('Chunk received', chunk.toString())
            }
        })
}

 */

{
    // Реализация потоков для записи

    const tfs = new ToFileStream()

    tfs.write({path: './fileA.txt', content: 'HELLOO'})
    tfs.write({path: './fileB.txt', content: 'HELLOO2'})

    tfs.end(() => console.log('lfinshed'))
}


