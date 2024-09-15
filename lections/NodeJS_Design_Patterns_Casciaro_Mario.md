## Глава 1 Платформа Node.js

- 'use strict' строгий режим
    - невозможно использовать необъявленные переменные
    - невозможно удалить переменные функции, аргументы

- стрелочные функции - для использования родительского this
    - setTimeout(function(){},0) - использует свой this
        - вместо setTimeout(function(){},0).bind(this) - setTimeout(()=>{},0)

- Map, Set
    - хешированные коллекции, где ключом может быть что угодно (функция, объект и т.д.)
    - перебор for..of, Map -> [key, value] и извлекаются в том же порядке как были сохранены

- WeakMap, WeakSet
    - отсутствует перебор
    - сборщик мусора, если ключ был объект и его удалили, то удаляет из коллекции

### Асинхронная природа Node.js

- серверы, созданные с использованием этой среды, не ожидают завершения операций ввода-вывода, прежде чем продолжить
  выполнение других задач.
- подразумевает наличие неблокирующего ввода-вывода, что позволяет в процессе ожидания ответа на запрос, например, к
  базе данных, выполнять другие операции и обрабатывать другие запросы.

### Reactor

- кратко, приложение в некоторый момент желает обратиться к ресурсу (без блокировки) и передает обработчика,
  который должен быть вызван некогда в будущем, после завершения операции

- > Приложение Node.js завершиться автоматически, когда в демультиплексоре событий не останется отложенных операций и
  событий в очереди
- низкоуровневая С-библиотека libuv обеспечивает программный интерфейс для создания циклов событий, управления очередью
  событий,
  выполнения асинхронных операций ввода/вывода и организации очереди заданий разных типов

- **Основные блоки**
    - набор привязок для libuv
    - движок V-8
    - node-core - ядро библиотеки JavaScript

## Глава 2 Основные шаблоны

- Синхронное - последовательные вычисления, операция блокируется до её завершения
- Асинхронное - операция переводится в фоновой режим, сразу выполняется следующая

### Шаблон Callback

- **обратные вызовы (Callback)** - функции, вызываемые для передачи результата операции, вместо return (return
  синхронный)

#### Замыкания

- это комбинация функции и лексическое окружение в котором функция была определена
- создается каждый раз при создании функции

#### Стиль передачи продолжений Continuation-Passing Style, CPS

- обратный вызов функции, переданную в аргументе другой функции вызываемой после завершения операции
- function add(a, b, callback){ callback(a + b) }

#### Обратный вызов не связанный со стилем передачи продолжений. Прямой стиль

- перебор map - синхронный!!!

```
  const result = [1, 5, 7].map(el => el - 1)
  console.log(res) // [0, 5, 6]
```

- > Важно определять Синхронный или Асинхронный программный интерфейс

* Для прямого стиля (синхронного) нет смысла использовать вызовы с продолжением

- > Используйте прямой стиль при создании синхронных функций
- > Синхронный стиль блокирует приложение. Ломает модель параллельной обработки JavaScript
- > Использование синхронного ввода/вывода не рекомендовано во многих случаях. Только при нескольких
  статических файлах.
- > Для чтения конфигурационных файлов при загрузке ОБЯЗАТЕЛЬНО Синхронный стиль

```
  const cache = {}

    function consistentReadSync(filename){
        if(cache[filename]){
            return cache[filename]
        } else {
            cache[filename] = fs.readFileSync(filename, 'utf8') // Синхронная
            return cache[filename]
        }
    }
```

### Перевод синхронного операции в асинхронную

- добавить отложенный вызов в 'process.nextTick' - process.nextTick(()=> callback(cache[filename]))
- отложенные обратные вызовы методом nextTick, выполняются доя любых событий ввода/вывода
- При этом, 'setImmediate' помещает в очередь за уже находящимися в очереди событиями ввода/вывода

### Соглашения об обратных вызовах при использовании CPS

- callback передается последним в списке параметров (последний аргумент), даже при наличии необязательных параметрах
    - fs.readFile(filename, [options], callback)
- ошибки передаются первыми
    - стараться всегда передавать ошибку типа Error, а не строку
    - для прерывания операции можно возвращать обратный вызов, чтобы предотвратить дальнейшее выполнение метода
    - fs.readFile('foo.txt.', 'utf8', (err, data)=> if(err) {return callback(err)} else {callback(null, data)}

### Ошибки и исключения

- в Синхронном стиле ошибки передаются throw
- в Асинхронном стиле ошибка передается через обратный вызов в цепочке
- Исключение перехваченное внутри асинхронного обратного вызова, будет передано циклу событий и никогда не достигнет
  обратного вызова
    - поэтому в асинхронном стиле используем try catch и передаем ошибке в обратный вызов, а не throw
- можно перехватить в цикле событий через событие 'uncaughtException'
- Желательно, а лучше Обязательно завершать приложение после перехвата событием 'uncaughtException'

```
    process.on('uncaughtException', err=>{
      console.log('My catch error:', err.message )
      process.exit(1)
    })
```

## Система модулей

- в JS отсутствует пространство имен, программы, выполняемые в глобальной области видимости захламляют ее внутренними
  дынными и зависимостями
- шаблон для решения проблемы "Revealing Module" - "Открытий модуль"

```
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
    
```

### CommonJS modules

- аналог шаблона с открытым модулем
- каждый модуль запускается в собственной области видимости и не загрязняет глобальную область
- Плохой способ самодельного загрузчика модуля использовать eval как запуск исходного кода из файла
- для определения глобальной переменной используют 'global' - Плохая практика!!

- > Require в JS Синхронный, если необходимо асинхронный необходимо экспортировать неинициализированный модуль
  при этом не гарантируется его готовности к использованию!

- **Загрузка модулей по версиям**
    - сначала модуль в файлах <moduleName>.js, <moduleName>/index.js
    - потом модуль ядра Node.js
    - модуль в пакетах node_modules

- > Require - кеширует вызов модуля!!!!!!!!

>

- **Именованный экспорт** - большинство модулей в ядре Node.js использует именно так

```
  // logger.js
  exports.info = (message)=>{
    console.log('info:', message )
  }

  exports.verbose = (message)=>{
      console.log('verbose:', message)
  }
  
  // main.js
  const logger = require("./logger");
  
  logger.info('message for info')
  logger.verbose('message for verbose')
```

- **Экспорт функций**
- расширение как использование пространства имен
- шаблон "substack" - экспортируйте основные функциональные возможности модуля в виде единственной функции.
  Экспортированная функция используется как пространство имен для прочих вспомогательных возможностей

```
  // loggerModule.js
  module.exports = (message)=>{
    console.log('module info: ', message)
  }
  
  // вспомогательная возможность
  module.exports.verbose = (message)=>{
      console.log('module verbose: ',message )
  }
  
  // main.js
  const loggerModule = require("./loggerModule");
  
  loggerModule('message for info')
  loggerModule.verbose('message for verbose')
  
```

- **Экспорт конструктора**
    - можно прототипами можно class то же самое
    - экспорт конструктора или класса является единственной точкой входа

```
  // loggerContructor.js
  function Logger(name){
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
  
  // main.js
  const loggerConstructor = require("./loggerConstructor");
  
  const dbLogger = new loggerConstructor('DB')
  dbLogger.info('DB message for info')

  const accessLogger = new loggerConstructor('ACCESS')
  accessLogger.verbose('ACCESS message for verbose')
```

- для вызова без new, можно использовать проверку на существование ссылки this
- можно использовать синтаксический сахар new.target

```
   // loggerContructor.js
    function Logger(name){
      if(!this instanceof Logger){
        return new Logger(name)
      }
      
      /* синтаксический сахар new.target
      if(!new.target){
        return new Logger(name)
      }
      */
      
      this.name = name
    }
    
    module.exports = Logger
  
  // main.js
  const dbLogger = Logger('DB');
```

- **Экспорт экземпляра как Singleton и обычный**

```
  module.exports = new Logger('DEFAULT')
  module.exports.Logger = Logger
```

## Шаблон Observer - Наблюдатель

- определяет объект (называемый субъектом), способный уведомить ряд наблюдателей (или обработчиков) об изменении своего
  состоянии
- может уведомить нескольких наблюдателей

### Класс EventEmitter

- встроен в Node.js ('events'.EventEmitter) - и реализует шаблон Observer
- методы
    - on(event, listener) - регистрация обработчика для заданного типа события
    - once(event, listener) - тоже самое что 'on', только обработчик удаляется после 1 события
    - emit(event, [arg1],[...]) - создает событие и определяет доп аргументы для обработчика
    - removeListener(event, listener) - удаление обработчика для заданного типа события
- обязательно регистрировать обработчик ошибок, иначе ошибка потеряется в цикле событий

```
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
```

```
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
```

### EventEmitter синхронные и асинхронные события

- не мешать синхронный и асинхронные стили вместе
- Необходимо зарегистрировать обработчики до того, как EventEmitter начнет посылать события, иначе обработчик не
  отработает

```
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
```

### EventEmitter или обратные вызовы

- эквивалентны оба подхода, разница в читаемости
- EventEmitter более гибкий из-за типов событий, и несколько раз вызова события,
- callback при этом можно вызвать один раз
- EventEmitter может уведомить нескольких наблюдателей

```
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
```

### EventEmitter вместе с обратными вызовами

```
    // Совместное использование EventEmitter & callback
    // где (error, files)=> ) обратный вызов
    glob('file/*.txt', (error, files)=> console.log('All files found', JSON.stringify(files)))
        .on('match', match => console.log('Match found', match))
```

## Глава 3 Шаблоны асинхронного выполнения с обратными вызовами

### Ад обратных вызовов

```
asyncFoo( err => {
    asyncBar( err => {
        asyncFooBar( err => {
            //...
          });
        });
    });
```

### Шаблон Неограниченного Параллельного выполнения асинхронных операций

```
  const tasks = [/*...*/]
  let completed = 0
  
  tasks.forEach(taks => {
    task(() => {
      if(++completed === task.length){
        finish()
      }  
    }
  }
  
  function finish(){
    // all task completed
  }
```

### Ограничение параллельной обработки

```
  const tasks = [/*...*/]
  let concurency = 2
  let running = 0
  let completed = 0
  let index = 0
  
  function next() { //[1]
      while(running < concurrency && index < tasks.length) { 
        task = tasks[index++];
        task(() => { //[2]
        
        if(completed === tasks.length) { 
           return finish();
        }
        completed++, running--; 
        next(); 
      });
      
      running++;
  }
}
next();

function finish() {
 //все задания выполнены
}
```

### Шаблон очередь задач

```
class TaskQueue {
    constructor(concurrency) {
        this.concurrency = concurrency
        this.running = 0
        this.queue = []
    }

    pushTask(task){
        this.queue.push(task)
        this.next()
    }

    next(){
        while(this.running < this.concurrency && this.queue.length) {
            const task = this.queue.shift()

            task(()=>{
                this.running++
                this.next()
            })

            this.running++
        }
    }
}
```

### Библиотека Npm Async

- series - последовательный обход серии асинхронных операций ([operations ], finishOperation)
- eachSeries ([task]) - последовательный перебор коллекции
- можно использовать лимит - eachLimit, mapLimit и т.д.
- содержит аналог TaskQueue - добавляем задачу и обратный вызов при ее выполнении

## Глава 4 Шаблоны асинхронного выполнения ES2015

### Promise

- функция обещание, выполнить асинхронную операцию в будущем
- можно использовать throw оператор для возникновения ошибки

#### Promise и обратный вызов

```
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

```

### Генераторы

- они же **полусопрограммы** - semi-coroutines
- вызов генератора fruitGenerator() просто объявление сущности, никакая операция не выполниться

```
  // Semi-coroutines
    function* fruitGenerator(){
        console.log('start') // не запуститься при const gen = fruitGenerator()
        yield 'apple'
        
        console.log('after apple') // запуститья после второго next() 
        yield 'orange'
        return 'watermelon'

    }

    const gen = fruitGenerator()

    console.log('gen', gen.next())
    console.log('gen', gen.next())
    console.log('gen', gen.next())
    console.log('gen', gen.next()) // результат undefined

    /*
    gen { value: 'apple', done: false }
    gen { value: 'orange', done: false }
    gen { value: 'watermelon', done: true }
    gen { value: undefined, done: true }

     */
```

#### Генератор в роли итератора

```
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
    
    // apple
    // orange
    // error
    // before while { value: 'orange', done: false }

```

#### Передача значение обратно в генератоор

```
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
```

## Глава 5 Программирование с применением потоков данных

- потоки используются во многих местах в ядре Nodejs, fs, http, zlib

### Анатомия потоков

- все классы в модуле stream экземпляры класса EventEmitter, генерят события('end', 'error')
    - stream.Readable
    - stream.Writable
    - stream.Duplex
    - stream.Transform
- типы данных:
    - **двоичный режим** - буфер или строки
    - **объектный режим** - дискретные объекты (любое значение)
- эти два режима позволяют использовать потоки не только ввод/вывод, но и в функциональном стиле

### Потоки данных для чтения - Readable

- **дискретный** - подключается обработчик события 'readable', который уведомляет о новых данных, готовых для чтения
  пока не опустошится внутренний буфер

```
  process.stdin
    .on('readable', () => {
        let chunk;

        console.log('New data available',)

        while ((chunk = process.stdin.read()) !== null) {
            console.log('Chunk read', chunk.length, chunk.toString())
        }
    })
    .on('end', () => process.stdout.write('End of stream'))
```

- **непрерывный** - данные передаются сразу после их поступления

```
  process.stdin
    .on('data', chunk => {
        console.log('New data available',)
        console.log('Chunk read', chunk.length, chunk.toString())
    })
    .on('end', () => process.stdout.write('End of stream'))

```

- реализация своего класса расширяемого от stream.Readable должен иметь метод _read(size) и не вызывается напрямую
- readable.push(chunk) - заполнение внутреннего буфера

```
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
        this.push(chunk, 'utf8') // помещаем строку в буфер для чтения

        if (chance.bool({likelihood: 5})) { // завершаем поток с 5% вероятностью
            this.push(null)
        }
    }
}
```

### Потоки данных для записи - Writable

- потоки записи - приемники данных stream.Writable
- writable.write(chunk, [encoding], [callback])
    - encoding - необязательный, по умолчанию utf8
    - callback - вызывается сразу после передачи данных chunk в целевой ресурс
- writable.end([chunk], [encoding], [callback])
    - on('finish') - генерируется после передачи всех данных в целевой ресурс

```
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
```

### Обратное давление

- данные записываются быстрее чем поток может передать их.

### Реализация потоков для записи
